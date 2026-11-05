from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import PERIODS, domains, respond, text, whole


class WebSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        time = text(p.get("time"))
        yield from respond(
            self,
            lambda stophy: stophy.search(
                query=str(p["query"]),
                limit=whole(p.get("limit")),
                tbs=None if time is None else PERIODS.get(time),
                include_domains=domains(p.get("include_domains")),
            ),
        )
