# Stophy MCP

For a client that starts a local server, configure the `stophy` executable with the argument `mcp`.

```json
{
  "mcpServers": {
    "stophy": {
      "command": "stophy",
      "args": ["mcp"]
    }
  }
}
```

The local server connects to `/mcp` on the configured API origin. It uses `STOPHY_API_KEY` or the key saved for that origin by `stophy login`. Use `STOPHY_MCP_URL` to choose a different MCP endpoint.

For a client that supports remote MCP, use `https://mcp.stophy.dev/mcp` and sign in in the browser. [Remote setup](https://docs.stophy.dev/install-mcp)
