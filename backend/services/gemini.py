import os
import hashlib
import json
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are an expert technical recruiter AI. Analyze resumes objectively and return structured JSON only. Return only JSON."""


def score_to_recommendation(score: int) -> str:
    """Hard rule: recommendation is always derived from score, never left to AI guesswork."""
    if score >= 85:
        return "Strong Yes"
    elif score >= 65:
        return "Yes"
    elif score >= 45:
        return "Maybe"
    else:
        return "No"
    
def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()    
    
def screen_resume(resume_text: str, job_description: str) -> dict:
    prompt = f"""
    {SYSTEM_PROMPT}

    Job Description:
    {job_description}

    Resume:
    {resume_text[:8000]}

Analyze this resume against the job description. Return ONLY this JSON:
{{
  "name": "Full name or 'Unknown Candidate'",
  "email": "Email address or empty string",
  "phone": "Phone number or empty string",
  "location": "City/country or empty string",
  "score": <integer 0-100. 85+=exceptional, 65-84=good, 45-64=partial, <45=poor match>,
  "experience": "e.g. '5 years' or 'Entry-level'",
  "experience_years": <float, total years of professional experience>,
  "education": "Highest degree and field",
  "current_role": "Most recent job title and company",
  "skills": ["up to 12 skills extracted from resume"],
  "matched_skills": ["skills from resume matching JD requirements"],
  "missing_skills": ["important JD skills absent from resume"],
  "strengths": ["3 specific, evidence-based strengths"],
  "red_flags": ["genuine skill/experience gaps only — NO mentions of name, gender, age, nationality, or personal attributes"],
  "summary": "2-3 sentences on fit and standout qualities. Focus on skills and experience only.",
  "blind_summary": "Same as summary but with NO name, gender pronouns, age, or demographic hints — skills and experience only"
}}"""


    response = client.models.generate_content(
        model="models/gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # Remove markdown if model adds it
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    return json.loads(text)

    score = int(data.get("score", 0))
    data["recommendation"] = score_to_recommendation(score)
    data["content_hash"] = content_hash(resume_text)
    return data
