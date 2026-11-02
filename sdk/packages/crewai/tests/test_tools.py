import json

import pytest
from conftest import DATA, FakeStophy
from stophy import StophyError

from crewai_stophy import StophyHomeSearchTool, StophyWebSearchTool, stophy_tools


def test_every_tool_is_listed_and_declares_its_key() -> None:
    tools = stophy_tools("st_test")

    assert [tool.name for tool in tools] == [
        "Stophy web search",
        "Stophy read page",
        "Stophy Reddit search",
        "Stophy place search",
        "Stophy product search",
        "Stophy job search",
        "Stophy home search",
    ]
    assert all(tool.env_vars[0].name == "STOPHY_API_KEY" for tool in tools)
    assert StophyHomeSearchTool().args_schema.model_json_schema()["required"] == ["location"]


def test_a_run_sends_the_input_and_returns_json(api: FakeStophy) -> None:
    output = StophyWebSearchTool(api_key="st_test").run(
        query="bun runtime", include_domains=["bun.com"]
    )

    assert api.requests == [
        {
            "path": "/v1/web/search",
            "body": {"query": "bun runtime", "includeDomains": ["bun.com"]},
            "auth": "Bearer st_test",
        }
    ]
    assert json.loads(output) == DATA


def test_an_api_error_carries_the_api_message(api: FakeStophy) -> None:
    api.status = 401
    api.reply = {
        "success": False,
        "error": {"code": "apiKeyRequired", "message": "Needs an API key.", "retryable": False},
    }

    with pytest.raises(StophyError, match="Needs an API key."):
        StophyHomeSearchTool().run(location="Austin, TX")
