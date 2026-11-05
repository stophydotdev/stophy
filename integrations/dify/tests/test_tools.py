import json
from collections.abc import Iterator
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from typing import Any

import pytest
from dify_plugin.errors.tool import ToolProviderCredentialValidationError

from provider.stophy import StophyProvider
from tools.home_search import HomeSearchTool
from tools.job_search import JobSearchTool
from tools.place_search import PlaceSearchTool
from tools.product_search import ProductSearchTool
from tools.read_page import ReadPageTool
from tools.reddit_search import RedditSearchTool
from tools.web_search import WebSearchTool

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
            "path": "/v1/search",
            "body": {"query": "bun runtime", "limit": 10, "includeDomains": ["bun.com", "x.com"]},
            "auth": "Bearer st_test",
        }
    ]
    assert [message.message.json_object for message in messages] == [DATA]


def test_each_site_tool_reads_its_page_with_its_parser(api: FakeStophy) -> None:
    credentials = {"api_key": "st_test"}

    list(ReadPageTool.from_credentials(credentials).invoke({"url": " https://bun.com/docs "}))
    reddit = list(
        RedditSearchTool.from_credentials(credentials).invoke(
            {"query": "bun runtime", "subreddit": "javascript", "sort": "newest"}
        )
    )
    list(
        PlaceSearchTool.from_credentials(credentials).invoke(
            {"query": "coffee", "location": "Austin, TX", "open_now": False}
        )
    )
    list(
        ProductSearchTool.from_credentials(credentials).invoke(
            {"query": "earbuds", "max_price": 50.0, "sort": "priceLow"}
        )
    )
    list(JobSearchTool.from_credentials(credentials).invoke({"query": "nurse", "remote": "remote"}))
    list(
        HomeSearchTool.from_credentials(credentials).invoke(
            {"location": "Austin, TX", "min_bedrooms": 3.0}
        )
    )

    assert [message.message.json_object for message in reddit] == [DATA["json"]]
    assert [request["path"] for request in api.requests] == ["/v1/scrape"] * 6
    assert [request["body"] for request in api.requests] == [
        {"url": "https://bun.com/docs", "formats": ["markdown"]},
        {
            "url": "https://www.reddit.com/search/?q=bun+runtime&sort=new",
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
            "url": "https://www.indeed.com/jobs?q=nurse",
            "formats": [
                {"type": "json", "parser": "indeed-search", "options": {"remote": "remote"}}
            ],
        },
        {
            "url": "https://www.zillow.com/homes/Austin%2C-TX_rb/",
            "formats": [{"type": "json", "parser": "zillow-search", "options": {"minBedrooms": 3}}],
        },
    ]


def test_an_api_error_reaches_dify_with_its_message(api: FakeStophy) -> None:
    api.status = 402
    api.reply = {"success": False, "error": "Top up, then retry.", "code": "insufficientCredits"}
    tool = WebSearchTool.from_credentials({"api_key": "st_test"})

    with pytest.raises(ValueError, match="Top up, then retry."):
        list(tool.invoke({"query": "bun"}))


def test_a_rejected_key_fails_validation_with_the_api_message(api: FakeStophy) -> None:
    api.status = 401
    api.reply = {"success": False, "error": "That key is not valid.", "code": "apiKeyRequired"}

    with pytest.raises(ToolProviderCredentialValidationError, match="That key is not valid."):
        StophyProvider().validate_credentials({"api_key": "st_wrong"})

    assert api.requests[0]["path"] == "/v1/usage"
