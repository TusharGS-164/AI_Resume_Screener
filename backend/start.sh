#!/bin/bash
cd "$(dirname "$0")"

echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt -q

if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created .env from template."
  echo "   Please edit backend/.env and set your GEMINI_API_KEY before running."
  echo ""
  exit 1
fi

echo "Starting FastAPI server on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
