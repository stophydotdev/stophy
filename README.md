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

Stophy is one API for agents that need the web. They can search it, read any page as Markdown or JSON, crawl a whole site, pull fields out of pages, and drive a cloud browser when a page needs clicks.

This repo holds everything you install to use it: the SDKs, the `stophy` command, the MCP server, the agent skills and the docs.

## Try it

You don't need a key. This searches the web and prints two results:

```bash
npx -y @stophy/cli search "bun runtime" --limit 2
```

Search, scrape, map and parse work without a key, up to 10 calls a minute and 50 a day. For more, [sign up](https://stophy.dev/signup) with GitHub or Google. A new account starts with $2 and no card, which is about 2,000 pages.

## What you get

- **Search.** Web, news and image results, with the text of each result when you ask for it.
- **Scrape.** Any public page as Markdown, HTML, links, a screenshot, or JSON in the shape you describe.
- **Map and crawl.** Every URL on a site, or the content of all its pages, as a background job.
- **Extract.** The fields you name, filled from pages and checked against them.
- **Browsers.** A cloud browser that your code or your agent drives, for pages that need clicks.
- **Monitors.** Pages checked on a schedule, with each change sent to your webhook.

Prices are in dollars and you pay for what you use. A failed call is free.

## Install

Pick the one that fits where your agent runs. They all call the same API.

| From                            | Install                                         | Guide                                                |
| ------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| TypeScript                      | `npm install stophy`                            | [sdk/packages/typescript](./sdk/packages/typescript) |
| Python                          | `pip install stophy`                            | [sdk/packages/python](./sdk/packages/python)         |
| A terminal or a script          | `curl -fsSL https://stophy.dev/install \| bash` | [cli](./cli)                                         |
| An agent over MCP               | `npx -y @stophy/mcp`                            | [mcp](./mcp)                                         |
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
