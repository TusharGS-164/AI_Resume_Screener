import os
import json
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db, ScreeningSession, Candidate, User
from services.auth import get_current_user
from services.parser import extract_text
from services.gemini import screen_resume
from services.export import export_csv, export_pdf
import io

router = APIRouter(prefix="/api/screen", tags=["screening"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def create_session(
    title: str = Form(...),
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ScreeningSession(
        user_id=current_user.id,
        title=title,
        job_description=job_description
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    results = []
    for upload in files:
        ext = os.path.splitext(upload.filename)[1].lower()
        safe_name = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_name)

        with open(file_path, "wb") as f:
            shutil.copyfileobj(upload.file, f)

        try:
            text = extract_text(file_path)
            if not text.strip():
                raise ValueError("Empty resume")
            data = screen_resume(text, job_description)
        except Exception as e:
            data = {
                "name": upload.filename,
                "score": 0,
                "experience": "Unknown",
                "education": "Unknown",
                "current_role": "",
                "skills": [],
                "matched_skills": [],
                "missing_skills": [],
                "strengths": [],
                "recommendation": "No",
                "summary": f"Could not analyze resume: {str(e)}"
            }

        candidate = Candidate(
            session_id=session.id,
            filename=upload.filename,
            name=data.get("name"),
            score=data.get("score", 0),
            experience=data.get("experience"),
            education=data.get("education"),
            skills=json.dumps(data.get("skills", [])),
            matched_skills=json.dumps(data.get("matched_skills", [])),
            summary=data.get("summary"),
            recommendation=data.get("recommendation", "Maybe"),
        )
        # Store extra fields in summary for now
        candidate.summary = data.get("summary", "")
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        results.append({
            "id": candidate.id,
            "filename": candidate.filename,
            "name": candidate.name,
            "score": candidate.score,
            "experience": candidate.experience,
            "education": candidate.education,
            "current_role": data.get("current_role", ""),
            "skills": data.get("skills", []),
            "matched_skills": data.get("matched_skills", []),
            "missing_skills": data.get("missing_skills", []),
            "strengths": data.get("strengths", []),
            "recommendation": candidate.recommendation,
            "summary": candidate.summary,
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"session_id": session.id, "title": session.title, "candidates": results}


@router.get("/sessions")
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_admin:
        sessions = db.query(ScreeningSession).order_by(ScreeningSession.created_at.desc()).all()
    else:
        sessions = db.query(ScreeningSession).filter(
            ScreeningSession.user_id == current_user.id
        ).order_by(ScreeningSession.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "candidate_count": len(s.candidates),
            "user_name": s.user.name,
            "top_score": max((c.score for c in s.candidates), default=0)
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not current_user.is_admin and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    candidates = sorted(session.candidates, key=lambda c: c.score, reverse=True)
    return {
        "id": session.id,
        "title": session.title,
        "job_description": session.job_description,
        "created_at": session.created_at.isoformat(),
        "user_name": session.user.name,
        "candidates": [
            {
                "id": c.id,
                "filename": c.filename,
                "name": c.name,
                "score": c.score,
                "experience": c.experience,
                "education": c.education,
                "skills": json.loads(c.skills or "[]"),
                "matched_skills": json.loads(c.matched_skills or "[]"),
                "recommendation": c.recommendation,
                "summary": c.summary,
            }
            for c in candidates
        ]
    }


@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not current_user.is_admin and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(session)
    db.commit()
    return {"message": "Deleted"}


@router.get("/sessions/{session_id}/export/csv")
def export_session_csv(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    candidates = sorted(session.candidates, key=lambda c: c.score, reverse=True)
    csv_bytes = export_csv(candidates)
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=screening_{session_id}.csv"}
    )


@router.get("/sessions/{session_id}/export/pdf")
def export_session_pdf(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    candidates = sorted(session.candidates, key=lambda c: c.score, reverse=True)
    pdf_bytes = export_pdf(session.title, session.job_description, candidates)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=screening_{session_id}.pdf"}
    )
