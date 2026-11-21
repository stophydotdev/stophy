# Stophy MCP

Search, read, and act on the web. This package connects any MCP client to the hosted Stophy server, so your agent can search, scrape, map, crawl, extract, monitor pages and drive a cloud browser.

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=stophy&config=eyJ1cmwiOiJodHRwczovL21jcC5zdG9waHkuZGV2L21jcCJ9)

## Install

Most apps connect to the hosted server directly, with nothing to install. This adds it to Claude Code and signs in with your browser:

```bash
claude mcp add --transport http stophy https://mcp.stophy.dev/mcp
```

Then run `/mcp` in Claude Code and choose **Authenticate**. Apps that can only start a local server run this package instead, with `npx -y @stophy/mcp`. It needs Node.js 18 or later.

## Connect

| URL                          | How you connect                      | What your agent can use                                |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `https://api.stophy.dev/mcp` | No key                               | Search, scrape, map and parse, within a free allowance |
| `https://api.stophy.dev/mcp` | `Authorization: Bearer <key>` header | Every tool                                             |
| `https://mcp.stophy.dev/mcp` | Sign in with your browser            | Every tool                                             |

Pick the browser sign-in when a person sets the app up, and a key when a script or an agent does. Get a key at [stophy.dev/signup](https://stophy.dev/signup).

- **Claude on the web, Desktop or mobile.** Open [Customize > Connectors](https://claude.ai/customize/connectors), choose **Add custom connector**, paste `https://mcp.stophy.dev/mcp` and sign in.
- **Claude Code with a key.** Add `--header "Authorization: Bearer <key>"` to the command above and use the `api.stophy.dev` URL. Leave the header out to start without a key.
- **Codex.** `codex mcp add stophy --url https://api.stophy.dev/mcp --bearer-token-env-var STOPHY_API_KEY` uses the key in your environment. To sign in with your browser, add `https://mcp.stophy.dev/mcp` the same way and run `codex mcp login stophy`.
- **Cursor.** The **Add to Cursor** button above signs in with your browser. To use a key, put the `api.stophy.dev` URL and an `Authorization` header in `.cursor/mcp.json`, and leave `headers` out to start without a key.
- **Claude Desktop, through the local package.** In `claude_desktop_config.json`, add a server named `stophy` with the command `npx`, the arguments `-y` and `@stophy/mcp`, and `STOPHY_API_KEY` in `env`. Restart Claude Desktop. Leave `env` out to start without a key.

The local package runs on your computer and passes every request to the hosted server, so it always has the same tools. It reads two variables:

| Variable         | What it does                                                           |
| ---------------- | ---------------------------------------------------------------------- |
| `STOPHY_API_KEY` | Your Stophy API key. Optional.                                         |
| `STOPHY_MCP_URL` | The server to connect to. The default is `https://api.stophy.dev/mcp`. |

With the key set, your agent can use every tool. Without it, your agent can use the tools that need no key, within a free allowance. If the server answers 401, the package says to check `STOPHY_API_KEY` or unset it.

## Tools

Without a key, the server lists these tools:

| Tool            | What it does                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `stophy_search` | Searches the web, news, images, research papers and YouTube videos                                            |
| `stophy_scrape` | Reads a page as markdown, HTML, links, a screenshot or JSON                                                   |
| `stophy_map`    | Lists the pages on a site                                                                                     |
| `stophy_parse`  | Turns a PDF, Word, Excel, PowerPoint or HTML file, or a picture of text, into markdown                        |
| `stophy_signup` | Gets your agent an API key: it returns a link for you to approve, then the key once you call it with the code |

With a key, it also lists a tool for each product:

| Tools                                                              | What they do                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `stophy_crawl`, `stophy_crawl_status`, `stophy_crawl_cancel`       | Start a crawl of a site in the background, read its pages, or stop it                      |
| `stophy_extract`                                                   | Pulls the fields you name from pages as JSON, each checked against the page                |
| `stophy_agent`, `stophy_agent_status`, `stophy_agent_cancel`       | Start a task that searches, reads pages and fills your fields, read its answer, or stop it |
| `stophy_developer_search`                                          | Searches code docs, READMEs, issues, pull requests and releases                            |
| `stophy_paper_search`, `stophy_paper_read`, `stophy_paper_similar` | Search research papers, read one, or find papers like it                                   |
| `stophy_monitor`, `stophy_monitor_read`                            | Create, change, run or delete a monitor with `action`, or read monitors and what changed   |
| `stophy_browser_open`, `_run`, `_close` and three more             | Drive a cloud browser                                                                      |

To get a site's own data as JSON, such as a Reddit search, a YouTube transcript or Google Maps places, call `stophy_scrape` with the site's page URL and a parser: send `formats` as `[{ "type": "json", "parser": "reddit-search" }]` with the Reddit search page as the `url`. The `stophy_scrape` description names every parser, and [the parser list](https://api.stophy.dev/v1/parsers) shows the page each one takes.

Over MCP, `stophy_scrape` keeps link text and drops link addresses: send `"linkStyle": "inline"` for `[text](address)`, or add `links` to `formats`. A crawl runs in the background: read it with `stophy_crawl_status` and the crawl's `id`. A call costs the same as over HTTP, and `costUsd` in a result is what it cost. For more endpoints of a source, add `toolsets` to the URL with the source name, such as `https://api.stophy.dev/mcp?toolsets=web`. Your agent then also gets tools for batches and for more crawl and agent endpoints, such as `batchScrape`, `crawlList` and `agentList`.

## Network and credentials

- The hosted server lives at `https://mcp.stophy.dev/mcp` (sign in) and `https://api.stophy.dev/mcp` (no key or an API key). Your client sends requests only there.
- Credentials: browser sign-in handled by your MCP client, or an optional `STOPHY_API_KEY` that you set yourself. The local package also reads an optional `STOPHY_MCP_URL`.
- The plugin manifests (`.mcp.json`, `.grok-plugin/plugin.json`, `mcp.json`, `plugin.json`) only point at the hosted server. They run no code on your machine.
- No telemetry.

## Docs

- [Install the MCP server](https://docs.stophy.dev/install-mcp) has the steps for each app.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.
- [Dashboard and API keys](https://stophy.dev/dashboard) is where you manage your keys.

## License

MIT
