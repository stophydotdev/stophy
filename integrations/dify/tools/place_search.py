from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import respond_parsed, segment


class PlaceSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        place = f"{p['query']} in {p['location']}"
        yield from respond_parsed(
            self,
            "google-maps",
            f"https://www.google.com/maps/search/{segment(place)}",
            openNow=p.get("open_now") or None,
        )
