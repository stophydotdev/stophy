import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any, Iterator

import pytest

DATA = {"results": [{"url": "https://bun.com", "title": "Bun", "position": 1}]}


class FakeStophy:
    def __init__(self) -> None:
        self.requests: list[dict[str, Any]] = []
        self.status = 200
        self.reply: dict[str, Any] = {
            "success": True,
            "data": DATA,
            "creditsUsed": 1,
            "requestId": "req_1",
        }


@pytest.fixture
def api(monkeypatch: pytest.MonkeyPatch) -> Iterator[FakeStophy]:
    fake = FakeStophy()

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self) -> None:
            body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
            fake.requests.append(
                {"path": self.path, "body": body, "auth": self.headers.get("Authorization")}
            )
            payload = json.dumps(fake.reply).encode()
            self.send_response(fake.status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def log_message(self, format: str, *args: Any) -> None:
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    Thread(target=server.serve_forever, daemon=True).start()
    monkeypatch.setenv("STOPHY_BASE_URL", f"http://127.0.0.1:{server.server_port}")
    yield fake
    server.shutdown()
