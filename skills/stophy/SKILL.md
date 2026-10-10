---
name: stophy
description: |
  Get live data from a specific site or platform with the Stophy CLI: Google search, news, scholar and trends, YouTube, TikTok, Reddit, Instagram, LinkedIn, Pinterest, Facebook, X, Threads, Google Maps, Tripadvisor, flights, hotels, Airbnb and Booking.com, job posts on Google, LinkedIn, Indeed, Upwork and careers pages, Amazon, eBay and Facebook Marketplace products, Trustpilot reviews, App Store and Google Play apps, Zillow homes, and ad libraries. Use for "search Reddit for", "get this video's transcript", "find coffee shops near", "what does this cost", "who is hiring for". Prefer it over generic web browsing for these sites. For one category, use stophy-web, stophy-video, stophy-social, stophy-places, stophy-jobs, stophy-shopping, stophy-apps, stophy-real-estate, or stophy-ads.
metadata:
  author: stophy
  version: "4.0.4"
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

`google search`, `google news`, `google maps search`, `reddit search`, `youtube search`, `youtube video` and `youtube transcript` work without a key, within a free limit. Every other command needs one. Check `stophy status`, then log in:

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

Put the main input first and the options after it. To point at one thing, give its link or its id as the first argument. The command also takes it as an option, such as `--videoUrl` or `--videoId`. Send one, not both:

```bash
stophy google search "postgres 18 release notes"
stophy reddit search "bun vs node" --sort top --time pastMonth
stophy youtube transcript "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
stophy youtube video dQw4w9WgXcQ
stophy google ads advertisers nike
stophy meta ads search nike
```

One call returns one page for a fixed price. Most commands cost 1 credit. Amazon search, product and bestsellers, `zillow search`, `zillow property`, `instagram profile`, `linkedin profile`, `google aiMode` and `google shopping` cost 2. A few long lists cost 1 credit per 10 results: `google images`, `appstore search`, `appstore top` and `google play search`. TikTok transcripts cost 1 credit when the video has captions. Instagram transcripts, and TikTok videos without captions, cost 2 credits plus 1 per 10 seconds of audio. Run `stophy endpoints` to see each price, and `stophy describe <command>` for the terms. Errors and empty results cost nothing.

By default, lists print one row per result with its title and link, and other results print as `name: value` lines. Add `--json` for every field and `-o file` to save the output. Long output is easier to read in parts from a file than in chat. Each call returns one page, as the site shows it. Some commands take a page number: the output shows `page`, and you run the same command with `--page 2` for the next page, until a page has no results. Others end with a `cursor` when there is more: run the same command with `--cursor <cursor>`, and keep the other options the same.

**Done when:** you ran the command, read its output, and every fact you report comes from that output.

## Errors

- **Not logged in:** run `stophy login --browser`.
- **Out of credits:** send the user to https://stophy.dev/billing.
- **Rate limited or source failed:** wait for any delay the message gives, then retry once. Do not loop.
- **Invalid input:** read the command's `--help`.
- **Not found:** the message is the source's own, such as "YouTube says: This video is unavailable". Check the link or ID. Do not retry.

Failed calls cost nothing. To report a problem to support, include the `requestId` from `--raw` or from the error message.

## Without the CLI

- **MCP:** connect to `https://api.stophy.dev/mcp` and send `Authorization: Bearer <key>`. To sign in through the browser instead, connect to `https://mcp.stophy.dev/mcp`. Endpoint ids are camelCase, such as `redditSearch`.
- **HTTP:** `POST https://api.stophy.dev/v1/<endpoint>` with a JSON body, where `google.search` is `/v1/google/search` and `youtube.transcript` is `/v1/youtube/transcript`. The response is `{ success, data, creditsUsed, requestId }`, and lists are in `data.results`. `GET /v1/endpoints` lists every endpoint.
- **Code:** `npm install stophy` or `pip install stophy`.
