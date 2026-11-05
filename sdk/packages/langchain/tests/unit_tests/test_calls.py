import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any, Iterator

import pytest
from langchain_core.messages import ToolMessage
from pydantic import SecretStr

from langchain_stophy import (
    StophyHomeSearch,
    StophyJobSearch,
    StophyPlaceSearch,
    StophyProductSearch,
    StophyRedditSearch,
    StophyWebSearch,
)

DATA = {
    "web": [{"url": "https://bun.com", "title": "Bun", "position": 1}],
    "json": {"results": []},
}


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


def test_sends_the_input_and_gives_the_model_json(api: FakeStophy) -> None:
    tool = StophyWebSearch(api_key=SecretStr("st_test"))

    message = tool.invoke(
        {
            "name": tool.name,
            "args": {"query": "bun runtime", "include_domains": ["bun.com"]},
            "id": "1",
            "type": "tool_call",
        }
    )

    assert api.requests == [
        {
            "path": "/v1/search",
            "body": {"query": "bun runtime", "includeDomains": ["bun.com"]},
            "auth": "Bearer st_test",
        }
    ]
    assert isinstance(message, ToolMessage)
    assert json.loads(str(message.content)) == DATA


def test_an_api_error_reaches_the_model_as_an_error_message(api: FakeStophy) -> None:
    api.status = 401
    api.reply = {"success": False, "error": "This needs an API key.", "code": "apiKeyRequired"}
    tool = StophyHomeSearch()

    message = tool.invoke(
        {"name": tool.name, "args": {"location": "Austin, TX"}, "id": "1", "type": "tool_call"}
    )

    assert isinstance(message, ToolMessage)
    assert message.status == "error"
    assert message.content == "This needs an API key."


def test_site_tools_read_their_page_with_their_parser(api: FakeStophy) -> None:
    key = SecretStr("st_test")
    reddit = StophyRedditSearch(api_key=key).invoke(
        {"query": "bun runtime", "subreddit": "javascript", "sort": "newest", "time": "pastWeek"}
    )
    StophyPlaceSearch(api_key=key).invoke({"query": "coffee", "location": "Austin, TX"})
    StophyProductSearch(api_key=key).invoke(
        {"query": "earbuds", "max_price": 50, "sort": "priceLow"}
    )
    StophyJobSearch(api_key=key).invoke({"query": "data analyst", "remote": "remote"})
    StophyHomeSearch(api_key=key).invoke({"location": "Austin, TX", "min_bedrooms": 3})

    assert reddit == DATA["json"]
    assert [request["path"] for request in api.requests] == ["/v1/scrape"] * 5
    assert [request["body"] for request in api.requests] == [
        {
            "url": "https://www.reddit.com/search/?q=bun+runtime&sort=new&t=week",
            "formats": [
                {"type": "json", "parser": "reddit-search", "options": {"subreddit": "javascript"}}
            ],
        },
        {
            "url": "https://www.google.com/maps/search/coffee%20in%20Austin%2C%20TX",
            "formats": [{"type": "json", "parser": "google-maps"}],
        },
        {
            "url": "https://www.amazon.com/s?k=earbuds&high-price=50&s=price-asc-rank",
            "formats": [{"type": "json", "parser": "amazon-search"}],
        },
        {
            "url": "https://www.indeed.com/jobs?q=data+analyst",
            "formats": [
                {"type": "json", "parser": "indeed-search", "options": {"remote": "remote"}}
            ],
        },
        {
            "url": "https://www.zillow.com/homes/Austin%2C-TX_rb/",
            "formats": [{"type": "json", "parser": "zillow-search", "options": {"minBedrooms": 3}}],
        },
    ]
