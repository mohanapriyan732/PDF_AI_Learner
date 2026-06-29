import os
from pathlib import Path


def export_content(content: str, export_type: str, export_folder: str) -> dict:
    export_path = Path(export_folder) / f"{export_type}.txt"
    export_path.write_text(content, encoding="utf-8")
    return {"download_url": f"/exports/{export_path.name}", "filename": export_path.name}
