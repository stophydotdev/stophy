from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import page, respond_parsed, text


class JobSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        yield from respond_parsed(
            self,
            "indeed-search",
            page("https://www.indeed.com/jobs", q=str(p["query"]), l=text(p.get("location"))),
            remote=text(p.get("remote")),
            datePosted=text(p.get("date_posted")),
        )
