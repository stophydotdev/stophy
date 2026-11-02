from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import amount, respond, text, whole


class HomeSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        yield from respond(
            self,
            lambda stophy: stophy.zillow.search(
                location=str(p["location"]),
                status=text(p.get("status")),
                min_price=amount(p.get("min_price")),
                max_price=amount(p.get("max_price")),
                min_bedrooms=whole(p.get("min_bedrooms")),
            ),
        )
