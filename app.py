import os
from flask import Flask, jsonify, render_template, request, send_from_directory
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

from services.pdf_service import extract_text_from_pdf
from services.summary_service import generate_summary
from services.notes_service import generate_notes
from services.flashcard_service import generate_flashcards
from services.quiz_service import generate_quiz, evaluate_quiz
from services.interview_service import generate_interview_questions
from services.planner_service import generate_study_plan
from services.translation_service import translate_content
from services.export_service import export_content
from utils.helpers import allowed_file, ensure_upload_dirs


load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
    app.config["EXPORT_FOLDER"] = os.path.join(os.path.dirname(__file__), "exports")
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    ensure_upload_dirs(app.config["UPLOAD_FOLDER"], app.config["EXPORT_FOLDER"])

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.route("/exports/<path:filename>")
    def download_export(filename):
        return send_from_directory(app.config["EXPORT_FOLDER"], filename, as_attachment=True)

    @app.route("/upload", methods=["POST"])
    def upload_pdf():
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No file uploaded"}), 400

        uploaded_file = request.files["file"]
        if uploaded_file.filename == "":
            return jsonify({"success": False, "message": "No selected file"}), 400

        if not allowed_file(uploaded_file.filename):
            return jsonify({"success": False, "message": "Only PDF files are allowed"}), 400

        filename = secure_filename(uploaded_file.filename)
        save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        uploaded_file.save(save_path)

        text = extract_text_from_pdf(save_path)
        if not text:
            return jsonify({"success": False, "message": "Unable to extract text from PDF"}), 400

        return jsonify({
            "success": True,
            "filename": filename,
            "page_count": len(text.splitlines()) // 50 + 1,
            "file_size": os.path.getsize(save_path),
            "text_preview": text[:2000],
        })

    @app.route("/generate-summary", methods=["POST"])
    def generate_summary_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_summary(text)
        return jsonify({"success": True, **result})

    @app.route("/generate-notes", methods=["POST"])
    def generate_notes_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_notes(text)
        return jsonify({"success": True, **result})

    @app.route("/generate-flashcards", methods=["POST"])
    def generate_flashcards_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_flashcards(text)
        return jsonify({"success": True, **result})

    @app.route("/generate-quiz", methods=["POST"])
    def generate_quiz_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_quiz(text, payload.get("num_questions", 10), payload.get("difficulty", "medium"))
        return jsonify({"success": True, **result})

    @app.route("/evaluate-quiz", methods=["POST"])
    def evaluate_quiz_route():
        payload = request.get_json(silent=True) or {}
        answers = payload.get("answers", [])
        questions = payload.get("questions", [])
        result = evaluate_quiz(answers, questions)
        return jsonify({"success": True, **result})

    @app.route("/generate-interview", methods=["POST"])
    def generate_interview_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_interview_questions(text)
        return jsonify({"success": True, **result})

    @app.route("/generate-plan", methods=["POST"])
    def generate_plan_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        exam_date = payload.get("exam_date", "")
        hours_per_day = payload.get("hours_per_day", 2)
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = generate_study_plan(text, exam_date, hours_per_day)
        return jsonify({"success": True, **result})

    @app.route("/translate", methods=["POST"])
    def translate_route():
        payload = request.get_json(silent=True) or {}
        text = payload.get("text", "")
        target_language = payload.get("target_language", "Spanish")
        if not text:
            return jsonify({"success": False, "message": "No text provided"}), 400
        result = translate_content(text, target_language)
        return jsonify({"success": True, **result})

    @app.route("/export", methods=["POST"])
    def export_route():
        payload = request.get_json(silent=True) or {}
        content = payload.get("content", "")
        export_type = payload.get("type", "summary")
        if not content:
            return jsonify({"success": False, "message": "No content provided"}), 400
        result = export_content(content, export_type, app.config["EXPORT_FOLDER"])
        return jsonify({"success": True, **result})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
