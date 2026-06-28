import os
from pathlib import Path


def allowed_file(filename: str) -> bool:
    return filename.lower().endswith(".pdf")


def ensure_upload_dirs(upload_folder: str, export_folder: str) -> None:
    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(export_folder, exist_ok=True)


def read_text_file(path: str) -> str:
    return Path(path).read_text(encoding="utf-8") if Path(path).exists() else ""
