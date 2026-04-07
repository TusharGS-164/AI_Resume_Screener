import os
import json
from google import genai


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
response = client.models.generate_content(
    model="gemini-2.5-flash",   # ✅ updated model
    contents="Explain AI in one sentence"
)


SYSTEM_PROMPT = """You are an expert technical recruiter AI. Analyze resumes objectively and return structured JSON only.
Never include markdown, code fences, or explanations — just raw JSON."""


def screen_resume(resume_text: str, job_description: str) -> dict:
    prompt = f"""{SYSTEM_PROMPT}

Job Description:
{job_description}

Resume:
{resume_text[:8000]}

Analyze this resume against the job description. Return ONLY this JSON (no other text):
{{
  "name": "Full name from resume, or 'Unknown Candidate' if not found",
  "score": <integer 0-100 match score>,
  "experience": "Total years of experience, e.g. '5 years' or 'Entry-level'",
  "education": "Highest degree and field, e.g. 'B.Tech Computer Science'",
  "current_role": "Most recent job title and company",
  "skills": ["list", "of", "up to 10", "skills", "from", "resume"],
  "matched_skills": ["skills", "that", "match", "JD requirements"],
  "missing_skills": ["important", "JD skills", "missing", "from resume"],
  "strengths": ["2-3 key strengths"],
  "recommendation": "Strong Yes | Yes | Maybe | No",
  "summary": "2-3 sentence recruiter summary of fit and standout qualities"
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # Strip any markdown fences if model adds them
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)
