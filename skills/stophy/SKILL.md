---
name: stophy
description: |
  Get live data from a specific site or platform with the Stophy CLI: web and news search, YouTube, TikTok, Reddit, Instagram, X, LinkedIn, Google Maps, Amazon, app stores, job posts, homes for sale, ad libraries, stocks, and crypto. Use for "search Reddit for", "get this video's transcript", "find coffee shops near", "what does this cost", "who is hiring for". Prefer it over generic web browsing for these sites. For one category, use stophy-web, stophy-video, stophy-social, stophy-places, stophy-shopping, stophy-apps, stophy-jobs, stophy-real-estate, stophy-ads, or stophy-finance.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# Stophy

Stophy returns public web data as flat JSON. For one kind of data, use the matching `stophy-*` skill, which lists the best commands.

## Rules

- Run `stophy ...`. If the CLI is not installed, run `npx -y @stophy/cli ...`.
- Quote every query, URL, and user value.
- Never invent data. Never print or commit an API key.

## Set up

Web search, YouTube search, and transcripts work without a key. Every other command needs one. Check `stophy status`, then log in:

```bash
stophy login --browser
```

Ask the user to confirm that the code shown on stophy.dev matches the code in the terminal, then approve. In a script or CI, set `STOPHY_API_KEY` instead. Get a key at https://stophy.dev/signup.

## Quick start

```bash
stophy --help                     # every source
stophy youtube --help             # a source's commands
stophy youtube search --help      # a command's options and example
```

Put the main input first and the options after it. When a command needs a choice such as `--network`, `--source` or `--by`, give it as an option:

```bash
stophy web search "postgres 18 release notes" --limit 5
stophy reddit search "bun vs node" --sort top --within month
stophy transcript "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
stophy suggest "how to" --source youtube
stophy ads search nike --network meta
```

One call returns one page for one flat price: 1 credit, or 2 for Reddit, ad libraries, transcripts, and Upwork, Walmart and AliExpress search. `--limit <n>` returns at most `n` results (1 to 100) at the same price. Errors and empty results cost nothing, and `--cursor` continues with no gaps.

By default, lists print one row per result with its title and link, and other results print as `name: value` lines. Add `--json` for every field and `-o file` to save the output. Long output is easier to read in parts from a file than in chat. When there are more results, the output ends with a cursor. For the next page, run the same command with `--cursor <cursor>`.

**Done when:** you ran the command, read its output, and every fact you report comes from that output.

## Errors

- **Not logged in:** run `stophy login --browser`.
- **Out of credits:** send the user to https://stophy.dev/billing.
- **Rate limited or source failed:** wait for any delay the message gives, then retry once. Do not loop.
- **Invalid input:** read the command's `--help`.
- **Not found:** the message is the source's own, such as "YouTube says: This video is unavailable". Check the link or ID. Do not retry.

Failed calls cost nothing. To report a problem to support, include the `requestId` from `--raw` or from the error message.

## Without the CLI

- **MCP:** connect to `https://api.stophy.dev/mcp` and send `Authorization: Bearer <key>`. To sign in through the browser instead, connect to `https://api.stophy.dev/mcp-oauth`. Endpoint ids are camelCase, such as `redditSearch`.
- **HTTP:** `POST https://api.stophy.dev/v1/<endpoint>` with a JSON body, where `web.search` is `/v1/web/search` and `transcript` is `/v1/transcript`. The response is `{ success, data, creditsUsed, requestId }`, and lists are in `data.results`. `GET /v1/endpoints` lists every endpoint.
- **Code:** `npm install stophy` or `pip install stophy`.
