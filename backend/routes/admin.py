from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, User, ScreeningSession, Candidate
from services.auth import get_admin_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    total_users = db.query(User).count()
    total_sessions = db.query(ScreeningSession).count()
    total_candidates = db.query(Candidate).count()
    avg_score = db.query(Candidate).all()
    avg = sum(c.score for c in avg_score) / len(avg_score) if avg_score else 0
    return {
        "total_users": total_users,
        "total_sessions": total_sessions,
        "total_candidates": total_candidates,
        "avg_score": round(avg, 1)
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "is_admin": u.is_admin,
            "created_at": u.created_at.isoformat(),
            "session_count": len(u.sessions)
        }
        for u in users
    ]
