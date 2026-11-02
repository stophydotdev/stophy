from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import amount, respond, text


class ProductSearchTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        p = tool_parameters
        yield from respond(
            self,
            lambda stophy: stophy.amazon.search(
                query=str(p["query"]),
                max_price=amount(p.get("max_price")),
                sort=text(p.get("sort")),
            ),
        )
