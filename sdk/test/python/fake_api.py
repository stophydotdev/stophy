from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Callable, List, Optional, Tuple, Union

Answer = Union[Tuple[int, Any], str]


class FakeApi:
    def __init__(self, answer: Callable[[Optional[str], int], Answer]) -> None:
        self.keys: List[Optional[str]] = []
        outer = self

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self) -> None:
                self.rfile.read(int(self.headers.get("content-length", 0)))
                key = self.headers.get("idempotency-key")
                outer.keys.append(key)
                reply = answer(key, len(outer.keys))
                if reply == "hang":
                    time.sleep(0.5)
                    self.connection.close()
                    return
                if reply == "drop":
                    self.connection.close()
                    return
                status, body = reply
                data = json.dumps(body).encode()
                self.send_response(status)
                self.send_header("content-type", "application/json")
                self.send_header("content-length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            do_GET = do_POST

            def log_message(self, *args: Any) -> None:
                pass

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"

    def close(self) -> None:
        self.server.shutdown()
        self.server.server_close()


def accept_jobs(lost: List[Answer] = ["drop"]):
    known: dict = {}
    charges: List[str] = []

    def answer(key: Optional[str], count: int) -> Answer:
        earlier = known.get(key) if key is not None else None
        job = earlier or {"success": True, "id": f"job_{len(charges) + 1}"}
        if earlier is None:
            charges.append(job["id"])
            if key is not None:
                known[key] = job
        return lost[count - 1] if count <= len(lost) else (200, job)

    return answer, charges
