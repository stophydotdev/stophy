from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import AMAZON_SORTS, amount, number, page, respond_parsed, text


class ProductSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        sort = text(p.get("sort"))
        url = page(
            "https://www.amazon.com/s",
            k=str(p["query"]),
            **{"high-price": number(amount(p.get("max_price")))},
            s=None if sort is None else AMAZON_SORTS.get(sort),
        )
        yield from respond_parsed(self, "amazon-search", url)
