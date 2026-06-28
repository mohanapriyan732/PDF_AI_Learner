import os
import json
import requests

from utils.prompts import QUIZ_PROMPT


def generate_quiz(text: str, num_questions: int = 10, difficulty: str = "medium") -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"questions": [{"id": 1, "type": "mcq", "question": "Set GOOGLE_API_KEY to enable AI quiz generation", "options": ["A", "B"], "correct_answer": "A", "explanation": "Configure the API key."}]}

    prompt = QUIZ_PROMPT.format(content=text[:12000]) + f"\nGenerate {num_questions} questions at {difficulty} difficulty."
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


def evaluate_quiz(answers: list, questions: list) -> dict:
    score = 0
    results = []
    for question, answer in zip(questions, answers):
        correct = question.get("correct_answer")
        is_correct = str(answer).strip().lower() == str(correct).strip().lower()
        if is_correct:
            score += 1
        results.append({
            "question": question.get("question"),
            "correct_answer": correct,
            "your_answer": answer,
            "is_correct": is_correct,
            "explanation": question.get("explanation", ""),
        })
    total = max(1, len(questions))
    percentage = round((score / total) * 100, 1)
    feedback = "Excellent work!" if percentage >= 80 else "Keep practicing and review the explanations."
    return {"score": score, "total": total, "percentage": percentage, "feedback": feedback, "results": results}
