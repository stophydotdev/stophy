import inspect
import json
from pathlib import Path

import pytest

from helpers import body_of, make_client, query_of

OK = {"json": {"success": True, "data": {}, "creditsUsed": 1, "requestId": "req_1"}}


def route(call):
    return f"{call.method} {call.url.raw_path.decode().split('?')[0]}"


def test_posts_input_to_the_spec_path():
    client, calls = make_client(OK)
    client.scrape(
        url="https://example.com", formats=["markdown"], only_main_content=True
    )
    client.batch.scrape(urls=["https://example.com"])
    assert [route(call) for call in calls] == [
        "POST /v1/scrape",
        "POST /v1/batch/scrape",
    ]
    assert body_of(calls[0]) == {
        "url": "https://example.com",
        "formats": ["markdown"],
        "onlyMainContent": True,
    }
    assert calls[0].headers["accept"] == "application/json"


def test_parsed_reads_a_page_with_a_parser():
    client, calls = make_client(OK)
    client.parsed("reddit-search", "https://www.reddit.com/search/?q=bun", page=2)
    client.parsed("reddit-search", "https://www.reddit.com/search/?q=bun")
    assert route(calls[0]) == "POST /v1/scrape"
    assert body_of(calls[0]) == {
        "url": "https://www.reddit.com/search/?q=bun",
        "formats": [
            {"type": "json", "parser": "reddit-search", "options": {"page": 2}}
        ],
    }
    assert body_of(calls[1])["formats"] == [{"type": "json", "parser": "reddit-search"}]


def test_id_goes_in_the_path_and_the_rest_in_the_query():
    client, calls = make_client({"json": {"status": "cancelled"}})
    client.crawl.cancel(id="job/1", max_text_length=100)
    assert route(calls[0]) == "DELETE /v1/crawl/job%2F1"
    assert query_of(calls[0]) == {"maxTextLength": "100"}
    assert calls[0].content == b""


def test_get_query_parameters_and_bare_calls():
    client, calls = make_client(OK)
    client.logs(days=7, api_key_id="key_1")
    client.limits()
    client.key.revoke()
    assert [route(call) for call in calls] == [
        "GET /v1/logs",
        "GET /v1/limits",
        "DELETE /v1/key",
    ]
    assert query_of(calls[0]) == {"days": "7", "apiKeyId": "key_1"}


def test_empty_optional_body():
    client, calls = make_client(OK)
    client.signup()
    assert body_of(calls[0]) == {}


def call_every_operation(node):
    for name, value in vars(node).items():
        if name.startswith("_") or not hasattr(value, "_call"):
            continue
        if callable(value):
            params = inspect.signature(value).parameters.values()
            value(
                **{param.name: "x" for param in params if param.default is param.empty}
            )
        call_every_operation(value)


def test_every_spec_operation_is_callable():
    spec = json.loads(Path("openapi.json").read_text())
    client, calls = make_client(OK)
    call_every_operation(client)
    expected = {
        f"{method.upper()} {path.replace('{id}', 'x')}"
        for path, item in spec["paths"].items()
        for method in item
    }
    assert {route(call) for call in calls} == expected
    client.close()


def test_retired_endpoints_are_gone():
    client, calls = make_client(OK)
    with pytest.raises(AttributeError):
        client.youtube.search(query="bun")  # type: ignore[attr-defined]
    assert calls == []
