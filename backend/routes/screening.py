import os, json, shutil, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from models.database import get_db, ScreeningSession, Candidate, User
from services.auth import get_current_user
from services.parser import extract_text
from services.gemini import screen_resume, score_to_recommendation
from services.export import export_csv, export_pdf

router = APIRouter(prefix="/api/screen", tags=["screening"])
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _serialize_candidate(c: Candidate) -> dict:
    return {
        "id": c.id,
        "filename": c.filename,
        "name": c.name,
        "email": c.email,
        "phone": c.phone,
        "location": c.location,
        "score": c.score,
        "experience": c.experience,
        "experience_years": c.experience_years or 0,
        "education": c.education,
        "current_role": c.current_role,
        "skills": json.loads(c.skills or "[]"),
        "matched_skills": json.loads(c.matched_skills or "[]"),
        "missing_skills": json.loads(c.missing_skills or "[]"),
        "strengths": json.loads(c.strengths or "[]"),
        "red_flags": json.loads(c.red_flags or "[]"),
        "summary": c.summary,
        "blind_summary": c.blind_summary,
        "recommendation": c.recommendation,
        "stage": c.stage,
        "recruiter_notes": c.recruiter_notes or "",
        "is_duplicate": c.is_duplicate,
        "duplicate_of_id": c.duplicate_of_id,
        "created_at": c.created_at.isoformat(),
    }


@router.post("/")
async def create_session(
    title: str = Form(...),
    job_description: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ScreeningSession(user_id=current_user.id, title=title, job_description=job_description)
    db.add(session); db.commit(); db.refresh(session)

    # Track hashes seen in THIS batch for dedup
    seen_hashes: dict[str, int] = {}
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
                "name": upload.filename, "email": "", "phone": "", "location": "",
                "score": 0, "experience": "Unknown", "experience_years": 0,
                "education": "Unknown", "current_role": "",
                "skills": [], "matched_skills": [], "missing_skills": [],
                "strengths": [], "red_flags": [],
                "summary": f"Could not analyze: {str(e)}",
                "blind_summary": f"Could not analyze: {str(e)}",
                "recommendation": "No", "content_hash": "",
            }

        h = data.get("content_hash", "")
        is_dup = False
        dup_of = None
        if h:
            # Check DB for same hash in same session
            existing = db.query(Candidate).filter(
                Candidate.session_id == session.id,
                Candidate.content_hash == h
            ).first()
            if existing:
                is_dup = True
                dup_of = existing.id
            elif h in seen_hashes:
                is_dup = True
                dup_of = seen_hashes[h]

        normalized_rec = score_to_recommendation(int(data.get("score", 0)))

        candidate = Candidate(
            session_id=session.id,
            filename=upload.filename,
            content_hash=h,
            name=data.get("name"),
            email=data.get("email", ""),
            phone=data.get("phone", ""),
            location=data.get("location", ""),
            score=data.get("score", 0),
            experience=data.get("experience"),
            experience_years=float(data.get("experience_years") or 0),
            education=data.get("education"),
            current_role=data.get("current_role", ""),
            skills=json.dumps(data.get("skills", [])),
            matched_skills=json.dumps(data.get("matched_skills", [])),
            missing_skills=json.dumps(data.get("missing_skills", [])),
            strengths=json.dumps(data.get("strengths", [])),
            red_flags=json.dumps(data.get("red_flags", [])),
            summary=data.get("summary", ""),
            blind_summary=data.get("blind_summary", ""),
            recommendation=normalized_rec,
            is_duplicate=is_dup,
            duplicate_of_id=dup_of,
        )
        db.add(candidate); db.commit(); db.refresh(candidate)

        if h and not is_dup:
            seen_hashes[h] = candidate.id

        results.append(_serialize_candidate(candidate))

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"session_id": session.id, "title": session.title, "candidates": results}


@router.get("/sessions")
def list_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = db.query(ScreeningSession)
    if not current_user.is_admin:
        q = q.filter(ScreeningSession.user_id == current_user.id)
    sessions = q.order_by(ScreeningSession.created_at.desc()).all()
    return [
        {
            "id": s.id, "title": s.title, "status": s.status,
            "created_at": s.created_at.isoformat(),
            "candidate_count": len(s.candidates),
            "shortlisted": sum(1 for c in s.candidates if c.stage == "shortlisted"),
            "user_name": s.user.name,
            "top_score": max((c.score for c in s.candidates), default=0),
            "duplicate_count": sum(1 for c in s.candidates if c.is_duplicate),
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    search: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    recommendation: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    min_exp: Optional[float] = Query(None),
    max_exp: Optional[float] = Query(None),
    hide_duplicates: bool = Query(False),
    blind_mode: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not current_user.is_admin and session.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    candidates = sorted(session.candidates, key=lambda c: c.score, reverse=True)

    # Apply filters
    if hide_duplicates:
        candidates = [c for c in candidates if not c.is_duplicate]
    if stage:
        candidates = [c for c in candidates if c.stage == stage]
    if recommendation:
        candidates = [c for c in candidates if c.recommendation == recommendation]
    if min_score is not None:
        candidates = [c for c in candidates if c.score >= min_score]
    if max_score is not None:
        candidates = [c for c in candidates if c.score <= max_score]
    if min_exp is not None:
        candidates = [c for c in candidates if (c.experience_years or 0) >= min_exp]
    if max_exp is not None:
        candidates = [c for c in candidates if (c.experience_years or 0) <= max_exp]
    if search:
        s = search.lower()
        candidates = [
            c for c in candidates if
            s in (c.name or "").lower() or
            s in (c.skills or "").lower() or
            s in (c.current_role or "").lower() or
            s in (c.location or "").lower() or
            s in (c.education or "").lower()
        ]

    serialized = []
    for c in candidates:
        d = _serialize_candidate(c)
        if blind_mode:
            d["name"] = f"Candidate #{d['id']}"
            d["email"] = "***"
            d["phone"] = "***"
            d["summary"] = d.get("blind_summary") or d["summary"]
        serialized.append(d)

    # Stats over ALL candidates (not filtered)
    all_c = session.candidates
    counts = {"Strong Yes": 0, "Yes": 0, "Maybe": 0, "No": 0}
    stage_counts = {"new": 0, "reviewed": 0, "shortlisted": 0, "rejected": 0, "hired": 0}
    for c in all_c:
        if c.recommendation in counts: counts[c.recommendation] += 1
        if c.stage in stage_counts: stage_counts[c.stage] += 1

    return {
        "id": session.id, "title": session.title,
        "job_description": session.job_description,
        "status": session.status, "notes": session.notes or "",
        "created_at": session.created_at.isoformat(),
        "user_name": session.user.name,
        "candidates": serialized,
        "total_count": len(all_c),
        "filtered_count": len(serialized),
        "duplicate_count": sum(1 for c in all_c if c.is_duplicate),
        "rec_counts": counts,
        "stage_counts": stage_counts,
    }


class StageUpdate(BaseModel):
    stage: str
    recruiter_notes: Optional[str] = None


@router.patch("/candidates/{candidate_id}")
def update_candidate(
    candidate_id: int,
    body: StageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")
    valid_stages = {"new", "reviewed", "shortlisted", "rejected", "hired"}
    if body.stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Stage must be one of {valid_stages}")
    c.stage = body.stage
    if body.recruiter_notes is not None:
        c.recruiter_notes = body.recruiter_notes
    db.commit()
    return {"id": c.id, "stage": c.stage, "recruiter_notes": c.recruiter_notes}


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


@router.patch("/sessions/{session_id}")
def update_session(
    session_id: int, body: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not s: raise HTTPException(status_code=404, detail="Not found")
    if not current_user.is_admin and s.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if body.status: s.status = body.status
    if body.notes is not None: s.notes = body.notes
    db.commit()
    return {"id": s.id, "status": s.status, "notes": s.notes}


@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not s: raise HTTPException(status_code=404, detail="Not found")
    if not current_user.is_admin and s.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(s); db.commit()
    return {"message": "Deleted"}


@router.get("/sessions/{session_id}/export/csv")
def export_session_csv(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not s: raise HTTPException(status_code=404)
    candidates = sorted(s.candidates, key=lambda c: c.score, reverse=True)
    return Response(content=export_csv(candidates), media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=screening_{session_id}.csv"})


@router.get("/sessions/{session_id}/export/pdf")
def export_session_pdf(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    s = db.query(ScreeningSession).filter(ScreeningSession.id == session_id).first()
    if not s: raise HTTPException(status_code=404)
    candidates = sorted(s.candidates, key=lambda c: c.score, reverse=True)
    return Response(content=export_pdf(s.title, s.job_description, candidates), media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=screening_{session_id}.pdf"})
