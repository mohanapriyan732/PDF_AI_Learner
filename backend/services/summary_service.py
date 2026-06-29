import os
import json
import requests

from utils.prompts import SUMMARY_PROMPT


def generate_summary(text: str) -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "short_summary": "API key not configured",
            "detailed_summary": "API key not configured",
            "chapter_wise_summary": [],
            "key_points": [],
            "important_keywords": [],
            "definitions": [],
            "formulas": [],
        }

    prompt = SUMMARY_PROMPT.format(content=text[:12000])
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"},
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()
    content = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(content)
