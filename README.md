# HireSense — Resume Screening System

A full-stack AI-powered resume screening system built with **FastAPI + React**, using **Google Gemini** for intelligent candidate analysis.

---

## Features

- **AI-powered screening** — Gemini 1.5 Flash analyzes resumes against job descriptions
- **Smart ranking** — Candidates ranked 0–100 with match scores
- **Skill matching** — Highlights which resume skills match the JD
- **Recommendations** — Strong Yes / Yes / Maybe / No for each candidate
- **Session history** — All past screenings saved to SQLite database
- **Export** — Download results as CSV or PDF report
- **Authentication** — JWT-based login/register; first user becomes admin
- **Admin dashboard** — User management, platform stats, activity charts
- **File support** — PDF, DOCX, TXT resumes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python) |
| Frontend | React + Vite |
| Database | SQLite via SQLAlchemy |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT (python-jose + passlib) |
| PDF export | ReportLab |
| Resume parsing | PyPDF2, python-docx |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)

---

### 1. Clone / unzip the project

```bash
cd resume-screener
```

---

### 2. Set up the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
SECRET_KEY=any_long_random_string_for_jwt
DATABASE_URL=sqlite:///./resume_screener.db
UPLOAD_DIR=./uploads
```

Start the backend:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at `http://localhost:8000`
Docs available at `http://localhost:8000/docs`

---

### 3. Set up the frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`

---

### 4. Use the app

1. **Register** — Go to `/register`, create an account. First user = admin.
2. **Login** — Sign in with your credentials
3. **New Screening** — Go to "New Screening", paste a job description, upload resumes
4. **View Results** — Candidates ranked by AI match score with skill tags
5. **Export** — Download results as CSV or PDF
6. **Admin** — View platform stats, all users, activity (admin only)

---

## Project Structure

```
resume-screener/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── database.py         # SQLAlchemy models (User, Session, Candidate)
│   ├── routes/
│   │   ├── auth.py             # /api/auth/* (login, register, me)
│   │   ├── screening.py        # /api/screen/* (create, list, export)
│   │   └── admin.py            # /api/admin/* (stats, users)
│   └── services/
│       ├── auth.py             # JWT logic, password hashing
│       ├── gemini.py           # Gemini API integration
│       ├── parser.py           # PDF/DOCX text extraction
│       └── export.py           # CSV & PDF report generation
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx             # Routes
        ├── index.css           # Global styles + CSS variables
        ├── context/
        │   └── AuthContext.jsx # JWT auth state
        ├── components/
        │   └── Layout.jsx      # Sidebar layout
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── DashboardPage.jsx   # Session history + stats
            ├── ScreenPage.jsx      # Upload + screen form
            ├── SessionPage.jsx     # Results view + export
            └── AdminPage.jsx       # Admin panel
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/screen/` | Create screening session |
| GET | `/api/screen/sessions` | List all sessions |
| GET | `/api/screen/sessions/{id}` | Get session details |
| DELETE | `/api/screen/sessions/{id}` | Delete session |
| GET | `/api/screen/sessions/{id}/export/csv` | Export to CSV |
| GET | `/api/screen/sessions/{id}/export/pdf` | Export to PDF |
| GET | `/api/admin/stats` | Platform stats (admin) |
| GET | `/api/admin/users` | All users (admin) |

---

## Getting a Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy it into your `backend/.env` file

The free tier allows generous usage for development and testing.

---

## Troubleshooting

**CORS errors** — Make sure both servers are running (backend on 8000, frontend on 5173)

**Gemini errors** — Check your API key in `.env` and ensure it has the Generative Language API enabled

**PDF parsing issues** — Some scanned PDFs won't extract text. Use text-based PDFs or DOCX files.

**Port conflicts** — Change ports in `vite.config.js` (frontend) or the uvicorn command (backend)
