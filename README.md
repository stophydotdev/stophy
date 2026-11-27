<p align="center">
  <a href="https://stophy.dev">
    <img src="./assets/logo.png" width="80" height="80" alt="Stophy logo" />
  </a>
</p>

<h1 align="center">Stophy</h1>

<p align="center">Search, read, and act on the web.</p>

<p align="center">
  <a href="https://stophy.dev"><strong>Website</strong></a> ·
  <a href="https://docs.stophy.dev">Docs</a> ·
  <a href="https://docs.stophy.dev/api-reference/introduction">API reference</a> ·
  <a href="https://stophy.dev/signup">Get a key</a> ·
  <a href="https://x.com/stophydotdev">X</a>
</p>

An agent that needs the live web usually needs a search API, a scraper and a headless browser, each with its own key, bill and failure modes. Stophy is one API, one key and one prepaid balance for all three.

- **Search** the web, news, images, papers and YouTube in one call.
- **Read any page** as Markdown, HTML, links, a screenshot or JSON.
- **Crawl and map** a whole site, or watch pages and get told when they change.
- **Extract and parse** the fields you name from a page, or get structured data from Amazon, Reddit, LinkedIn, Google Maps and more with a site parser.
- **Cloud browser and tasks** run sessions that you drive with code or a prompt.
- **MCP and CLI** put all of it in your agent: run `stophy mcp`, or connect to the [MCP server](./mcp).

This repo holds what you install to use it: the SDKs, the `stophy` command, the MCP server, the agent skills and the docs.

## Try it

You don't need a key:

```bash
npx -y @stophy/cli search "bun runtime" --limit 2
```

Search, scrape, map and parse work without a key. For the rest, [sign up](https://stophy.dev/signup).

## Install

Each one calls the same API.

| From                            | Install                                         | Guide                                                |
| ------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| TypeScript                      | `npm install stophy`                            | [sdk/packages/typescript](./sdk/packages/typescript) |
| Python                          | `pip install stophy`                            | [sdk/packages/python](./sdk/packages/python)         |
| Rust                            | Use the `stophy` crate                          | [crates/stophy](./crates/stophy)                     |
| A terminal or a script          | `curl -fsSL https://stophy.dev/install \| bash` | [cli](./cli)                                         |
| An agent over MCP               | `stophy mcp`                                    | [mcp](./mcp)                                         |
| Claude Code, Cursor, Gemini CLI | `npx skills add stophydotdev/stophy`            | [skills](./skills)                                   |
| Vercel AI SDK                   | `npm install @stophy/ai-sdk`                    | [sdk/packages/ai-sdk](./sdk/packages/ai-sdk)         |
| LangChain                       | `pip install langchain-stophy`                  | [sdk/packages/langchain](./sdk/packages/langchain)   |

## Documentation

- [Quickstart](https://docs.stophy.dev/quickstart) makes a first request and reads the result.
- [Agent quickstart](https://docs.stophy.dev/agent-quickstart) lets your coding agent sign up and set Stophy up for you.
- [Choose an API](https://docs.stophy.dev/introduction#choose-an-api) maps what you have to the call you need.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

The [docs](./docs) folder is the source of [docs.stophy.dev](https://docs.stophy.dev).

## Contributing

Bug reports and small fixes are welcome. Open an issue first for anything bigger. [AGENTS.md](./AGENTS.md) explains how the repo is laid out and how to check a change.
