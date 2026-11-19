---
"@stophy/mcp": patch
---

Canceling a local MCP tool call now cancels its upstream request without interrupting other calls. Long-running tools get time to finish within their documented limits, up to 299 seconds per call.
