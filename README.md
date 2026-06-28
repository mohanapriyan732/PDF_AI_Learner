# AI Study Assistant

AI Study Assistant is a lightweight Flask web app for uploading PDFs and generating study materials with Google Gemini.

## Features
- PDF upload and text extraction
- AI-powered summaries, notes, flashcards, quizzes, interviews, study plans, and translation
- Responsive UI with dark/light mode and animated cards

## Run locally
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python app.py
```

## Deploy to Render
1. Create a web service from this repository.
2. Set the build command to `pip install -r requirements.txt`.
3. Set the start command to `gunicorn app:app`.
