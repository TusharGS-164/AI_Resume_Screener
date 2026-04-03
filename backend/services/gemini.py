import os
import hashlib
import json
import re
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are an expert technical recruiter AI. Analyze resumes objectively and return structured JSON only. Return only JSON."""

def score_to_recommendation(score: int) -> str:
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

def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)
    else:
        raise ValueError("No JSON found in Gemini response")

def screen_resume(resume_text: str, job_description: str) -> dict:
    prompt = f"""
    {SYSTEM_PROMPT}

    Job Description:
    {job_description}

    Resume:
    {resume_text[:8000]}
    """

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        raw_text = response.text.strip()
        json_text = extract_json(raw_text)
        data = json.loads(json_text)

        score = int(data.get("score", 0))
        data["recommendation"] = score_to_recommendation(score)
        data["content_hash"] = content_hash(resume_text)

        return data

    except Exception as e:
        print("GEMINI ERROR:", str(e))
        raise Exception("Gemini API failed: " + str(e))