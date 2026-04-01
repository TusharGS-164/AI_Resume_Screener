from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resume_screener.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    sessions = relationship("ScreeningSession", back_populates="user")


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    job_description = Column(Text, nullable=False)
    status = Column(String, default="active")   # active | archived | closed
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")
    candidates = relationship("Candidate", back_populates="session", cascade="all, delete-orphan")


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("screening_sessions.id"), nullable=False)
    filename = Column(String, nullable=False)
    content_hash = Column(String, nullable=True)   # SHA256 of resume text — for dedup
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    location = Column(String)
    score = Column(Float, default=0)
    experience = Column(String)
    experience_years = Column(Float, default=0)    # numeric for filtering
    education = Column(String)
    current_role = Column(String)
    skills = Column(Text)           # JSON list
    matched_skills = Column(Text)   # JSON list
    missing_skills = Column(Text)   # JSON list
    strengths = Column(Text)        # JSON list
    red_flags = Column(Text)        # JSON list — bias-aware concerns only
    summary = Column(Text)
    blind_summary = Column(Text)    # Name/gender/age-stripped version
    recommendation = Column(String)
    stage = Column(String, default="new")    # new | reviewed | shortlisted | rejected | hired
    recruiter_notes = Column(Text, default="")
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    session = relationship("ScreeningSession", back_populates="candidates")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
