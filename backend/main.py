import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from models.database import init_db
from routes.auth import router as auth_router
from routes.screening import router as screening_router
from routes.admin import router as admin_router
from routes import screening 

app = FastAPI(title="Resume Screener API", version="1.0.0")


init_db()
app.include_router(screening.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(screening_router)
app.include_router(admin_router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Resume Screener API running"}
