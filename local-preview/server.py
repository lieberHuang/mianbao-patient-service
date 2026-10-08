"""Local prototype server. Saves page feedback and descriptions inside index.html."""

from __future__ import annotations

import json
import os
import re
import stat
import tempfile
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "index.html"
PORT = int(os.environ.get("MIANBAO_PORT", "8765"))
DATA_RE = re.compile(
    r'(<script id="page-feedback-data" type="application/json">)(.*?)(</script>)',
    re.DOTALL,
)
DESCRIPTION_RE = re.compile(
    r'(<script id="page-description-data" type="application/json">)(.*?)(</script>)',
    re.DOTALL,
)
KEY_RE = re.compile(r"^[A-Za-z][A-Za-z0-9:_-]{0,50}$")
WRITE_LOCK = threading.Lock()


def read_embedded(html: str, pattern: re.Pattern, label: str) -> dict:
    match = pattern.search(html)
    if not match:
        raise ValueError(f"index.html 缺少{label}数据区")
    value = json.loads(match.group(2))
    if not isinstance(value, dict):
        raise ValueError(f"{label}数据格式错误")
    return value


def validate_description(value: object) -> dict:
    if not isinstance(value, dict):
        raise ValueError("页面说明格式错误")
    result = {}
    limits = {"title": 60, "goal": 3000, "data": 6000, "logic": 6000, "pending": 6000}
    for field, limit in limits.items():
        item = value.get(field)
        if not isinstance(item, str) or len(item) > limit:
            raise ValueError(f"{field} 字段无效或过长")
        result[field] = item.strip()
    interactions = value.get("interactions")
    if not isinstance(interactions, list) or len(interactions) > 50:
        raise ValueError("页面通用事件与流转最多 50 项")
    if any(not isinstance(item, str) or not item.strip() or len(item) > 1000 for item in interactions):
        raise ValueError("事件与流转包含无效内容")
    result["interactions"] = [item.strip() for item in interactions]
    modules = value.get("modules")
    if modules is not None:
        if not isinstance(modules, list) or not 1 <= len(modules) <= 20:
            raise ValueError("页面模块至少一项、最多 20 项")
        cleaned_modules = []
        for item in modules:
            if not isinstance(item, dict):
                raise ValueError("页面模块格式错误")
            cleaned = {}
            for field, limit in {"title": 80, "description": 6000, "fields": 6000, "logic": 6000}.items():
                text = item.get(field)
                if not isinstance(text, str) or len(text) > limit:
                    raise ValueError(f"模块 {field} 字段无效或过长")
                cleaned[field] = text.strip()
            if not cleaned["title"]:
                raise ValueError("模块名称不能为空")
            cleaned_modules.append(cleaned)
        result["modules"] = cleaned_modules
    if not result["title"] or not result["goal"]:
        raise ValueError("请填写页面标题和目标")
    return result


def safe_json(value: dict) -> str:
    return (
        json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("&", "\\u0026")
    )


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path not in {"/api/feedback", "/api/description"}:
            self.send_json(404, {"error": "接口不存在"})
            return
        origin = self.headers.get("Origin")
        if origin and origin not in {
            f"http://127.0.0.1:{PORT}",
            f"http://localhost:{PORT}",
        }:
            self.send_json(403, {"error": "仅允许本地页面保存"})
            return
        if self.headers.get("Content-Type", "").split(";", 1)[0] != "application/json":
            self.send_json(415, {"error": "请使用 JSON 请求"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            max_length = 32_000 if self.path == "/api/feedback" else 512_000
            if not 0 < length <= max_length:
                raise ValueError("请求内容过大或为空")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError("请求数据格式错误")
            page_key = payload.get("pageKey")
            if not isinstance(page_key, str) or not KEY_RE.fullmatch(page_key):
                raise ValueError("页面标识无效")
            is_feedback = self.path == "/api/feedback"
            if is_feedback:
                text = payload.get("text")
                if not isinstance(text, str) or len(text) > 5_000:
                    raise ValueError("修改意见不能超过 5000 字")
                text = text.strip()
            else:
                raw_entry = payload.get("entry")
                if raw_entry is not None:
                    description = validate_description(raw_entry)
            with WRITE_LOCK:
                html = INDEX.read_text(encoding="utf-8")
                pattern = DATA_RE if is_feedback else DESCRIPTION_RE
                notes = read_embedded(html, pattern, "反馈" if is_feedback else "页面说明")
                if is_feedback and text:
                    entry = {"text": text, "updatedAt": datetime.now(timezone.utc).isoformat()}
                    notes[page_key] = entry
                elif not is_feedback and raw_entry is not None:
                    entry = {**description, "updatedAt": datetime.now(timezone.utc).isoformat()}
                    notes[page_key] = entry
                else:
                    entry = None
                    notes.pop(page_key, None)
                updated = pattern.sub(
                    lambda match: match.group(1) + safe_json(notes) + match.group(3),
                    html,
                    count=1,
                )
                with tempfile.NamedTemporaryFile(
                    mode="w", encoding="utf-8", dir=ROOT, delete=False
                ) as file:
                    temp_path = Path(file.name)
                    file.write(updated)
                os.chmod(temp_path, stat.S_IMODE(INDEX.stat().st_mode))
                os.replace(temp_path, INDEX)
            self.send_json(200, {"ok": True, "pageKey": page_key, "entry": entry})
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})
        except OSError:
            self.send_json(500, {"error": "写入 index.html 失败"})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"眠宝原型运行于 http://127.0.0.1:{PORT}/", flush=True)
    server.serve_forever()
