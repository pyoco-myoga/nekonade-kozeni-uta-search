from pathlib import Path

def project_root() -> Path:
    return Path(__file__).parent.parent

def add_indent(input: str, indent: str = "    ") -> str:
    return indent + f"\n{indent}".join(input.split("\n"))

def youtube_url(video_id: str, second: float | None = None) -> str:
    if second is None:
        return f"https://youtube.com/watch?v={video_id}"
    else:
        return f"https://youtube.com/watch?v={video_id}&t={second}"
