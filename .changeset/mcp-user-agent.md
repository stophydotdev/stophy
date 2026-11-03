---
"@stophy/mcp": patch
---

Every request from the MCP server now sends `stophy-mcp/<version>` as its User-Agent, so Stophy can tell this package apart from other MCP clients.
