import os
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    if not os.path.exists(file_path):
        return ""

    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text_parts.append(page_text)
    return "\n".join(text_parts).strip()
