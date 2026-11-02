from langchain_tests.unit_tests import ToolsUnitTests
from pydantic import SecretStr

from langchain_stophy import (
    StophyHomeSearch,
    StophyJobSearch,
    StophyPlaceSearch,
    StophyProductSearch,
    StophyReadPage,
    StophyRedditSearch,
    StophyToolkit,
    StophyWebSearch,
)
from langchain_stophy.tools import StophyTool


class TestWebSearch(ToolsUnitTests):
    tool_constructor = StophyWebSearch
    tool_invoke_params_example = {"query": "bun runtime", "time": "pastWeek"}


class TestReadPage(ToolsUnitTests):
    tool_constructor = StophyReadPage
    tool_invoke_params_example = {"url": "https://bun.com/docs"}


class TestRedditSearch(ToolsUnitTests):
    tool_constructor = StophyRedditSearch
    tool_invoke_params_example = {"query": "bun runtime", "sort": "top"}


class TestPlaceSearch(ToolsUnitTests):
    tool_constructor = StophyPlaceSearch
    tool_invoke_params_example = {"query": "coffee", "location": "Austin, TX"}


class TestProductSearch(ToolsUnitTests):
    tool_constructor = StophyProductSearch
    tool_invoke_params_example = {"query": "wireless earbuds", "max_price": 50}


class TestJobSearch(ToolsUnitTests):
    tool_constructor = StophyJobSearch
    tool_invoke_params_example = {"query": "data analyst", "remote": "remote"}


class TestHomeSearch(ToolsUnitTests):
    tool_constructor = StophyHomeSearch
    tool_invoke_params_example = {"location": "Austin, TX", "status": "forSale"}


def test_toolkit_shares_the_key_across_every_tool() -> None:
    tools = StophyToolkit(api_key=SecretStr("st_test")).get_tools()

    assert len({tool.name for tool in tools}) == 7
    assert {
        tool.api_key.get_secret_value()
        for tool in tools
        if isinstance(tool, StophyTool) and tool.api_key
    } == {"st_test"}
    assert all(isinstance(tool, StophyTool) for tool in tools)
