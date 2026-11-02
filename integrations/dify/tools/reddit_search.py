from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import respond, text


class RedditSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        yield from respond(
            self,
            lambda stophy: stophy.reddit.search(
                query=str(p["query"]),
                subreddit=text(p.get("subreddit")),
                sort=text(p.get("sort")),
            ),
        )
