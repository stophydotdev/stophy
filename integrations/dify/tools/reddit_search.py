from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import REDDIT_SORTS, page, respond_parsed, text


class RedditSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        sort = text(p.get("sort"))
        url = page(
            "https://www.reddit.com/search/",
            q=str(p["query"]),
            sort=None if sort is None else REDDIT_SORTS.get(sort),
        )
        yield from respond_parsed(self, "reddit-search", url, subreddit=text(p.get("subreddit")))
