import json
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any

import pytest
from dify_plugin.errors.tool import ToolProviderCredentialValidationError

from provider.stophy import StophyProvider
from tools.home_search import HomeSearchTool
from tools.read_page import ReadPageTool
from tools.web_search import WebSearchTool

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
        def reply(self, body: Any) -> None:
            fake.requests.append(
                {"path": self.path, "body": body, "auth": self.headers.get("Authorization")}
            )
            payload = json.dumps(fake.reply).encode()
            self.send_response(fake.status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

        def do_POST(self) -> None:
            self.reply(json.loads(self.rfile.read(int(self.headers["Content-Length"]))))

        def do_GET(self) -> None:
            self.reply(None)

        def log_message(self, format: str, *args: Any) -> None:
            pass

    server = HTTPServer(("127.0.0.1", 0), Handler)
    Thread(target=server.serve_forever, daemon=True).start()
    monkeypatch.setenv("STOPHY_BASE_URL", f"http://127.0.0.1:{server.server_port}")
    yield fake
    server.shutdown()


def test_web_search_sends_the_inputs_and_returns_json(api: FakeStophy) -> None:
    tool = WebSearchTool.from_credentials({"api_key": "st_test"})

    messages = list(
        tool.invoke(
            {"query": "bun runtime", "limit": 10.0, "time": "", "include_domains": "bun.com, x.com"}
        )
    )

    assert api.requests == [
        {
            "path": "/v1/web/search",
            "body": {"query": "bun runtime", "limit": 10, "includeDomains": ["bun.com", "x.com"]},
            "auth": "Bearer st_test",
        }
    ]
    assert [message.message.json_object for message in messages] == [DATA]


def test_each_tool_calls_its_own_endpoint(api: FakeStophy) -> None:
    credentials = {"api_key": "st_test"}

    list(ReadPageTool.from_credentials(credentials).invoke({"url": " https://bun.com/docs "}))
    list(HomeSearchTool.from_credentials(credentials).invoke({"location": "Austin, TX"}))

    assert [(request["path"], request["body"]) for request in api.requests] == [
        ("/v1/web/scrape", {"url": "https://bun.com/docs"}),
        ("/v1/zillow/search", {"location": "Austin, TX"}),
    ]


def test_an_api_error_reaches_dify_with_its_message(api: FakeStophy) -> None:
    api.status = 402
    api.reply = {
        "success": False,
        "error": {
            "code": "insufficientCredits",
            "message": "Top up, then retry.",
            "retryable": False,
        },
    }
    tool = WebSearchTool.from_credentials({"api_key": "st_test"})

    with pytest.raises(ValueError, match="Top up, then retry."):
        list(tool.invoke({"query": "bun"}))


def test_a_rejected_key_fails_validation_with_the_api_message(api: FakeStophy) -> None:
    api.status = 401
    api.reply = {
        "success": False,
        "error": {
            "code": "apiKeyRequired",
            "message": "That key is not valid.",
            "retryable": False,
        },
    }

    with pytest.raises(ToolProviderCredentialValidationError, match="That key is not valid."):
        StophyProvider().validate_credentials({"api_key": "st_wrong"})

    assert api.requests[0]["path"] == "/v1/usage"
