import os
import json
import requests

from utils.prompts import TRANSLATION_PROMPT


def translate_content(text: str, target_language: str) -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"translated_text": f"Set GOOGLE_API_KEY to translate to {target_language}"}

    prompt = TRANSLATION_PROMPT.format(content=text[:12000], target_language=target_language)
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
