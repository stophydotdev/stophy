from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import respond


class PlaceSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        yield from respond(
            self,
            lambda stophy: stophy.google.maps.search(
                query=str(p["query"]),
                location=str(p["location"]),
                open_now=p.get("open_now") or None,
            ),
        )
