from langchain_tests.integration_tests import ToolsIntegrationTests

from langchain_stophy import (
    StophyPlaceSearch,
    StophyReadPage,
    StophyRedditSearch,
    StophyWebSearch,
)


class TestWebSearch(ToolsIntegrationTests):
    tool_constructor = StophyWebSearch
    tool_invoke_params_example = {"query": "bun runtime", "limit": 3}


class TestReadPage(ToolsIntegrationTests):
    tool_constructor = StophyReadPage
    tool_invoke_params_example = {"url": "https://bun.com/docs"}


class TestRedditSearch(ToolsIntegrationTests):
    tool_constructor = StophyRedditSearch
    tool_invoke_params_example = {"query": "bun runtime"}


class TestPlaceSearch(ToolsIntegrationTests):
    tool_constructor = StophyPlaceSearch
    tool_invoke_params_example = {"query": "coffee", "location": "Austin, TX"}
