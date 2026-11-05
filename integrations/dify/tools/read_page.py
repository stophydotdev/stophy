from collections.abc import Generator
from typing import Any

from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage

from stophy_call import respond


class ReadPageTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage, None, None]:
        url = str(tool_parameters["url"]).strip()
        yield from respond(self, lambda stophy: stophy.scrape(url=url, formats=["markdown"]))
