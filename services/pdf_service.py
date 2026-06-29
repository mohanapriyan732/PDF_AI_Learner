import os
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""

    try:
        reader = PdfReader(file_path)
        text_parts = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)
        extracted = "\n".join(text_parts).strip()
    except Exception:
        extracted = ""

    return extracted or "This PDF did not contain readable text. You can still use the study tools with this placeholder content."
