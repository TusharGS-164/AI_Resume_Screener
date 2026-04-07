"""
gemini.py — Calls Gemini REST API directly (no SDK required).
Automatically finds a working model from the available list.
"""

import os
import json
import hashlib
import requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Stable v1 endpoint — broader model support than v1beta
_BASE = "https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={key}"

# Try these models in order — first one that works is used
_CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    
]

_active_model: str | None = None   # cached after first successful call


def _find_working_model() -> str:
    """
    Try each candidate model with a tiny ping prompt.
    Cache and return the first model that responds with HTTP 200.
    """
    global _active_model
    if _active_model:
        return _active_model

    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to backend/.env and restart."
        )

    ping_payload = {
        "contents": [{"parts": [{"text": "hi"}]}],
        "generationConfig": {"maxOutputTokens": 5},
    }

    for model in _CANDIDATE_MODELS:
        url = _BASE.format(model=model, key=GEMINI_API_KEY)
        try:
            r = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=ping_payload,
                timeout=15,
            )
            if r.status_code == 200:
                _active_model = model
                print(f"[ResumeAI] Using Gemini model: {model}")
                return model
        except Exception:
            continue

    # If all failed, collect errors from last attempt for a useful message
    raise RuntimeError(
        "No working Gemini model found. "
        f"Tried: {', '.join(_CANDIDATE_MODELS)}. "
        "Check your GEMINI_API_KEY and ensure the Generative Language API is enabled "
        "at https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
    )


def score_to_recommendation(score: int) -> str:
    if score >= 85: return "Strong Yes"
    elif score >= 65: return "Yes"
    elif score >= 45: return "Maybe"
    else: return "No"


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _clean_json(raw: str) -> str:
    """Strip markdown fences Gemini sometimes adds despite instructions."""
    text = raw.strip()
    # Remove ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        lines = text.splitlines()
        # drop first line (``` or ```json)
        lines = lines[1:]
        # drop last line if it's just ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def _call_gemini(prompt: str) -> str:
    """POST to Gemini REST and return the text response."""
    model = _find_working_model()
    url = _BASE.format(model=model, key=GEMINI_API_KEY)

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {
            "parts": [{
                "text": (
                    "You are an expert, unbiased technical recruiter AI. "
                    "Analyze resumes objectively. "
                    "Return ONLY raw JSON — no markdown, no code fences, no extra text."
                )
            }]
        },
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1500,
        },
    }

    try:
        resp = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=90,
        )
    except requests.exceptions.Timeout:
        raise RuntimeError("Gemini API timed out after 90 s. Try again.")
    except requests.exceptions.ConnectionError as e:
        raise RuntimeError(f"Cannot reach Gemini API: {e}")

    if resp.status_code != 200:
        global _active_model
        _active_model = None          # reset so next call retries model detection
        try:
            err_body = resp.json()
            msg = err_body.get("error", {}).get("message", resp.text)
        except Exception:
            msg = resp.text
        raise RuntimeError(f"Gemini API failed: {resp.status_code} {resp.reason}. {msg}")

    body = resp.json()
    try:
        return body["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as e:
        raise RuntimeError(
            f"Unexpected Gemini response shape: {e}\n"
            f"Body (first 400 chars): {json.dumps(body)[:400]}"
        )


def screen_resume(resume_text: str, job_description: str) -> dict:
    """Analyze a resume against a JD. Returns structured dict."""

    prompt = f"""Job Description:
{job_description}

Resume:
{resume_text[:8000]}

Analyze this resume against the job description above.
Return ONLY the following JSON — no markdown, no code fences, no explanation:
{{
  "name": "Full name from resume, or Unknown Candidate",
  "email": "Email address or empty string",
  "phone": "Phone number or empty string",
  "location": "City/country or empty string",
  "score": <integer 0-100: 85-100=exceptional match, 65-84=good, 45-64=partial, 0-44=poor>,
  "experience": "Human readable e.g. 5 years or Entry-level",
  "experience_years": <float total years of professional experience>,
  "education": "Highest degree and field e.g. B.Tech Computer Science",
  "current_role": "Most recent job title and company",
  "skills": ["up to 12 skills from the resume"],
  "matched_skills": ["skills from resume that match JD requirements"],
  "missing_skills": ["JD skills missing from this resume"],
  "strengths": ["3 specific evidence-based strengths from the resume"],
  "red_flags": ["skill or experience gaps only — no mention of name, gender, age, nationality"],
  "summary": "2-3 sentence recruiter summary focusing on skills and experience fit",
  "blind_summary": "Same as summary but with no name, no gender pronouns, no demographics"
}}"""

    raw = _call_gemini(prompt)
    cleaned = _clean_json(raw)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Gemini returned invalid JSON: {e}\n"
            f"Raw (first 600 chars):\n{cleaned[:600]}"
        )

    # Hard-derive recommendation from score — never trust model's own label
    score = max(0, min(100, int(data.get("score") or 0)))
    data["score"] = score
    data["recommendation"] = score_to_recommendation(score)
    data["content_hash"] = content_hash(resume_text)

    # Defensive normalisation — ensure expected types
    for f in ("skills", "matched_skills", "missing_skills", "strengths", "red_flags"):
        if not isinstance(data.get(f), list):
            data[f] = []

    for f in ("name", "email", "phone", "location", "experience",
              "education", "current_role", "summary", "blind_summary"):
        if not isinstance(data.get(f), str):
            data[f] = str(data.get(f) or "")

    try:
        data["experience_years"] = float(data.get("experience_years") or 0)
    except (ValueError, TypeError):
        data["experience_years"] = 0.0

    return data
