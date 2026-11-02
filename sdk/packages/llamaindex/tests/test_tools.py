import pytest
from conftest import DATA, FakeStophy
from stophy import StophyError

from llama_index.tools.stophy import StophyToolSpec


def test_every_tool_is_listed_with_its_inputs() -> None:
    tools = {tool.metadata.name: tool for tool in StophyToolSpec().to_tool_list()}

    assert list(tools) == [
        "web_search",
        "read_page",
        "reddit_search",
        "place_search",
        "product_search",
        "job_search",
        "home_search",
    ]
    assert tools["home_search"].metadata.get_parameters_dict()["required"] == ["location"]


def test_a_tool_call_sends_the_input_and_returns_the_data(api: FakeStophy) -> None:
    tools = {tool.metadata.name: tool for tool in StophyToolSpec("st_test").to_tool_list()}

    output = tools["web_search"].call(query="bun runtime", include_domains=["bun.com"])

    assert api.requests == [
        {
            "path": "/v1/web/search",
            "body": {"query": "bun runtime", "includeDomains": ["bun.com"]},
            "auth": "Bearer st_test",
        }
    ]
    assert output.raw_output == DATA


def test_an_api_error_carries_the_api_message(api: FakeStophy) -> None:
    api.status = 401
    api.reply = {
        "success": False,
        "error": {
            "code": "apiKeyRequired",
            "message": "This needs an API key.",
            "retryable": False,
        },
    }

    with pytest.raises(StophyError, match="This needs an API key."):
        StophyToolSpec().home_search(location="Austin, TX")
