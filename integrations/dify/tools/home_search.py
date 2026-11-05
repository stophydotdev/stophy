from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import amount, respond_parsed, segment, text, whole


class HomeSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        location = str(p["location"]).strip().replace(" ", "-")
        yield from respond_parsed(
            self,
            "zillow-search",
            f"https://www.zillow.com/homes/{segment(location)}_rb/",
            status=text(p.get("status")),
            minPrice=amount(p.get("min_price")),
            maxPrice=amount(p.get("max_price")),
            minBedrooms=whole(p.get("min_bedrooms")),
        )
