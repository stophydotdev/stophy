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

The local server uses `STOPHY_API_KEY` or the key from `stophy login`. Use `stophy status` to check the active credentials. Set `STOPHY_MCP_URL` to connect to a different MCP endpoint. It defaults to `https://api.stophy.dev/mcp`.

For a client that supports remote MCP, use `https://mcp.stophy.dev/mcp` and sign in in the browser. [Remote setup](https://docs.stophy.dev/install-mcp)
