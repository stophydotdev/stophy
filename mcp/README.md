# Stophy MCP

Give your agents the live web over MCP. Your agent can search, scrape, map, crawl and extract, and read a site's own data through a parser.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=stophy&config=eyJ1cmwiOiJodHRwczovL21jcC5zdG9waHkuZGV2L21jcCJ9)

## Connect to the hosted server

Most apps connect to the hosted server directly, with nothing to install.

| URL                          | How you connect                      | What your agent can use                                                                                                   |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `https://api.stophy.dev/mcp` | No key                               | The endpoints marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints), within a free allowance |
| `https://api.stophy.dev/mcp` | `Authorization: Bearer <key>` header | Every endpoint                                                                                                            |
| `https://mcp.stophy.dev/mcp` | Sign in with your browser            | Every endpoint                                                                                                            |

Get an API key at [stophy.dev/signup](https://stophy.dev/signup).

### Claude

In Claude on the web, Desktop or mobile, open [Customize > Connectors](https://claude.ai/customize/connectors), choose **Add custom connector**, and paste `https://mcp.stophy.dev/mcp`. Sign in when Claude asks.

### Claude Code

To sign in with your browser, add the server, then run `/mcp` and choose **Authenticate**:

```bash
claude mcp add --transport http stophy https://mcp.stophy.dev/mcp
```

To use an API key:

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp --header "Authorization: Bearer <key>"
```

To start without a key:

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp
```

### Codex

To use the key in your `STOPHY_API_KEY` environment variable:

```bash
codex mcp add stophy --url https://api.stophy.dev/mcp --bearer-token-env-var STOPHY_API_KEY
```

To sign in with your browser instead, add the sign-in URL, then log in:

```bash
codex mcp add stophy --url https://mcp.stophy.dev/mcp
codex mcp login stophy
```

### Cursor

Use the **Add to Cursor** button above to sign in with your browser, or add this to `.cursor/mcp.json` to use a key:

```json
{
  "mcpServers": {
    "stophy": {
      "url": "https://api.stophy.dev/mcp",
      "headers": { "Authorization": "Bearer <key>" }
    }
  }
}
```

To start without a key, leave out `headers`.

## Run it as a local server

Some apps can only start a local MCP server. For those, use this package. It runs on your computer and passes every request to the hosted server, so it always has the same tools.

```bash
npx -y @stophy/mcp
```

With `STOPHY_API_KEY` set, your agent can use every endpoint. Without it, your agent can use the endpoints that need no key, within a free allowance.

### Claude Desktop

Add this to `claude_desktop_config.json`, then restart Claude Desktop:

```json
{
  "mcpServers": {
    "stophy": {
      "command": "npx",
      "args": ["-y", "@stophy/mcp"],
      "env": { "STOPHY_API_KEY": "<key>" }
    }
  }
}
```

To start without a key, leave out `env`.

The package needs Node.js 18 or later.

| Variable         | What it does                                                           |
| ---------------- | ---------------------------------------------------------------------- |
| `STOPHY_API_KEY` | Your Stophy API key. Optional.                                         |
| `STOPHY_MCP_URL` | The server to connect to. The default is `https://api.stophy.dev/mcp`. |

## Tools

| Tool                       | What it does                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `stophy_search`            | Searches the web, news and images                                                                             |
| `stophy_scrape`            | Reads a page as markdown, HTML, links, a screenshot or JSON                                                   |
| `stophy_map`               | Lists the pages on a site                                                                                     |
| `stophy_crawl`             | Starts a crawl of a site in the background and returns its `id`                                               |
| `stophy_extract`           | Pulls the fields you name from pages as JSON                                                                  |
| `stophy_search_endpoints`  | Finds the endpoint for a task, with its cost. Free                                                            |
| `stophy_describe_endpoint` | Shows an endpoint's inputs, an example and what it returns. Free                                              |
| `stophy_call`              | Runs any endpoint by `id` with `input`, and optional `fields` and `maxTextLength`                             |
| `stophy_signup`            | Gets your agent an API key: it returns a link for you to approve, then the key once you call it with the code |

To get a site's own data as JSON, such as a Reddit search, a YouTube transcript or Google Maps places, call `stophy_scrape` with the site's page URL and a parser:

```json
{
  "url": "https://www.reddit.com/search/?q=bun+runtime",
  "formats": [{ "type": "json", "parser": "reddit-search" }]
}
```

The `stophy_scrape` description names every parser, and [the parser list](https://api.stophy.dev/v1/parsers) shows the page each one takes.

Endpoint ids are camelCase, such as `crawlStatus` or `batchScrape`. A crawl runs in the background: call `crawlStatus` through `stophy_call` with the crawl's `id`. While the crawl runs, the result has a `next` link: send the `cursor` value from that link as `cursor` to get the pages finished since. `fields` keeps only the keys you name on each row. Most calls cost 1 credit. Search costs 2 credits per 10 results, a crawl 1 credit a page, and extract 5 credits for most pages. Each result shows its cost in `creditsUsed`. See [pricing](https://docs.stophy.dev/billing).

To give each endpoint its own tool, add `toolsets` to the URL with a source name, such as `https://api.stophy.dev/mcp?toolsets=web`. Your agent then also gets `scrape`, `crawlStatus`, `batchScrape` and every other web endpoint as tools.

## Network and credentials

- The hosted server lives at `https://mcp.stophy.dev/mcp` (sign in) and `https://api.stophy.dev/mcp` (no key or an API key). Your client sends requests only there.
- Credentials: browser sign-in handled by your MCP client, or an optional `STOPHY_API_KEY` that you set yourself. The local package also reads an optional `STOPHY_MCP_URL`.
- The plugin manifests (`.mcp.json`, `.grok-plugin/plugin.json`, `mcp.json`, `plugin.json`) only point at the hosted server. They run no code on your machine.
- No telemetry.

## More

- [Stophy docs](https://docs.stophy.dev)
- [Dashboard and API keys](https://stophy.dev/dashboard)

## License

MIT
