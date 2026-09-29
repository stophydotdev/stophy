---
name: stophy
description: |
  Get live data from a specific site or platform with the Stophy CLI: web and news search, YouTube, TikTok, Reddit, Instagram, X, LinkedIn, Google Maps, Amazon, app stores, job posts, homes for sale, ad libraries, stocks, and crypto. Use for "search Reddit for", "get this video's transcript", "find coffee shops near", "what does this cost", "who is hiring for". Prefer it over generic web browsing for these sites. For one category, use stophy-web, stophy-video, stophy-social, stophy-places, stophy-shopping, stophy-apps, stophy-jobs, stophy-real-estate, stophy-ads, or stophy-finance.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# Stophy

Stophy returns public web data as clean JSON or markdown. For one kind of data, use the matching `stophy-*` skill, which lists the best commands.

## Rules

- Run `stophy ...`. If the CLI is not installed, run `npx -y @stophy/cli ...`.
- Quote every query, URL, and user value.
- Never invent data. Never print or commit an API key.

## Set up

Web search, YouTube search, and YouTube transcripts work without a key. Every other command needs one. Check `stophy status`, then log in:

```bash
stophy login --browser
```

Ask the user to confirm that the code shown on stophy.dev matches the code in the terminal, then approve. In a script or CI, set `STOPHY_API_KEY` instead. Get a key at https://stophy.dev/signup.

## Quick start

```bash
stophy --help                     # every source
stophy youtube --help             # a source's commands
stophy youtube transcript --help  # a command's options and example
```

Put the main input first and the options after it:

```bash
stophy web search "postgres 18 release notes" --limit 5
stophy reddit search "bun vs node" --sort top --within month
stophy maps search "coffee" --near "Berlin"
```

Output is markdown. Add `--json` for exact fields and `-o file` to save the output. Long output is easier to read in parts from a file than in chat. For the next page, pass the `--cursor <cursor>` value printed at the end of the output.

**Done when:** you ran the command, read its output, and every fact you report comes from that output.

## Errors

- **Not logged in:** run `stophy login --browser`.
- **Out of credits:** send the user to https://stophy.dev/billing.
- **Rate limited or source failed:** wait for any delay the message gives, then retry once. Do not loop.
- **Invalid input:** read the command's `--help`.

## Report a problem

If a result is wrong or a command acts differently from its help, report it once. Rerun the same command with `--raw` to see the `requestId`, then send:

```bash
curl -X POST https://api.stophy.dev/v1/feedback -H "Authorization: Bearer $STOPHY_API_KEY" -H "content-type: application/json" -d '{"category":"wrong_data","requestId":"<requestId>","note":"..."}'
```

Over MCP, call `stophy_feedback`. Reports are free. Never put a key or personal data in the note.

## Without the CLI

- **MCP:** connect to `https://api.stophy.dev/mcp` and send `Authorization: Bearer <key>`. To sign in through the browser instead, connect to `https://api.stophy.dev/mcp-oauth`.
- **HTTP:** `POST https://api.stophy.dev/v1/<source>/<endpoint>` with a JSON body. `GET /v1/endpoints` lists every endpoint.
- **Code:** `npm install stophy` or `pip install stophy`.
