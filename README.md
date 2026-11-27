<p align="center">
  <a href="https://stophy.dev">
    <img src="./assets/logo.png" width="80" height="80" alt="Stophy logo" />
  </a>
</p>

<h1 align="center">Stophy</h1>

<p align="center"><strong>Search, read, and act on the web.</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/stophy"><img src="https://img.shields.io/npm/v/stophy?label=npm&color=000" alt="npm version" /></a>
  <a href="https://pypi.org/project/stophy/"><img src="https://img.shields.io/pypi/v/stophy?label=pypi&color=000" alt="PyPI version" /></a>
  <a href="./mcp/LICENSE"><img src="https://img.shields.io/badge/license-MIT-000" alt="MIT license" /></a>
  <a href="https://x.com/stophydotdev"><img src="https://img.shields.io/badge/follow-@stophydotdev-000?logo=x" alt="Follow on X" /></a>
</p>

<p align="center">
  <a href="https://stophy.dev"><strong>Website</strong></a> ·
  <a href="https://docs.stophy.dev">Docs</a> ·
  <a href="https://docs.stophy.dev/api-reference/introduction">API reference</a> ·
  <a href="https://docs.stophy.dev/account/pricing">Pricing</a> ·
  <a href="https://stophy.dev/signup">Get a key</a>
</p>

An agent that needs the live web usually needs a search API, a scraper and a headless browser, each with its own key, bill and failure modes. Stophy is one API, one key and one prepaid balance for all three. You pay per call. Reading a page costs $1 per 1,000, and there are no plans.

## Try it

You don't need a key:

```bash
npx -y @stophy/cli search "bun runtime" --limit 2
```

Search, scrape, map and parse work without a key. For the rest, [sign up](https://stophy.dev/signup).

## What you get

| Feature                  | What it does                                                         | Try it                                                                              |
| ------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Search**               | The web, news, images, papers and YouTube in one call.               | `stophy search "bun runtime" --limit 5`                                             |
| **Read any page**        | Markdown, HTML, links, a screenshot or JSON.                         | `stophy scrape https://bun.com/docs`                                                |
| **Crawl and map**        | List a site's URLs, or read the whole site in the background.        | `stophy map https://bun.com --limit 20`                                             |
| **Extract**              | The fields you name, each checked against the page.                  | `stophy extract --urls https://bun.com --prompt "the latest version"`               |
| **Site parsers**         | Structured data from Amazon, Reddit, LinkedIn, Google Maps and more. | `stophy scrape https://youtu.be/M4TufsFlv_o --parser youtube-transcript`            |
| **Cloud browser, tasks** | A real browser that fills forms and clicks through a site for you.   | `stophy browser task --url https://www.python.org --goal "find the latest release"` |
| **MCP and CLI**          | All of the above inside your coding agent.                           | `stophy mcp`                                                                        |

Every price is on the [pricing page](https://docs.stophy.dev/account/pricing). This repo holds what you install to use it: the SDKs, the `stophy` command, the MCP server, the agent skills and the docs.

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
