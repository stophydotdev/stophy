# Stophy skills

[![skills.sh](https://skills.sh/b/stophydotdev/stophy)](https://skills.sh/stophydotdev/stophy)

Search, read, and act on the web. This repo is a plugin for coding agents with two parts: the hosted Stophy MCP server at `https://mcp.stophy.dev/mcp`, which signs you in with your browser, and agent skills for each task and kind of data that run on [the Stophy CLI](https://www.npmjs.com/package/@stophy/cli).

## Install

In Claude Code, add the marketplace and install the plugin:

```
/plugin marketplace add stophydotdev/stophy
/plugin install stophy@stophy
```

For other agents:

- **Cursor.** Stophy isn't in the Cursor Marketplace yet. Click **Add to Cursor** on [cursor.directory](https://cursor.directory/plugins/stophy), or add the server `https://mcp.stophy.dev/mcp` under `mcpServers` in `~/.cursor/mcp.json` yourself. Sign in when Cursor opens the browser.
- **Gemini CLI.** Run `gemini extensions install https://github.com/stophydotdev/stophy`.
- **Skills only.** Any agent that supports the Agent Skills format can run `npx skills add stophydotdev/stophy`. Add `--skill stophy-web --skill stophy-video` to install only those.
- **MCP server only.** Run `claude mcp add --transport http stophy https://mcp.stophy.dev/mcp`. Or use `https://api.stophy.dev/mcp` with an `Authorization: Bearer <key>` header. Without a key, the endpoints marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints) work, within a free allowance.

## Requirements

The skills run the CLI, 1.3.0 or later, so you need Node.js 18 or later and `npm install -g @stophy/cli`, or `npx @stophy/cli@latest`. An API key from [stophy.dev](https://stophy.dev/signup) is needed for everything except `search`, `scrape`, `map`, `parse` and the parsers each skill marks "no key", which work up to 10 calls a minute and 50 a day.

## API key

Run `stophy login --browser` to sign in with your browser, or `stophy login --api-key` to paste a key, which keeps it out of your shell history. In CI, set `STOPHY_API_KEY` from your secret store. Treat the key as a secret: do not commit it, print it, or paste it into a shared log.

## Skills

| Skill | Covers |
|-------|--------|
| [`stophy`](./skills/stophy/SKILL.md) | Start here: picks the skill and command for the task, setup, login, prices and errors |
| [`stophy-scrape`](./skills/stophy-scrape/SKILL.md) | One page you have a URL for: markdown, fields, a screenshot, or a site's data through a parser |
| [`stophy-search`](./skills/stophy-search/SKILL.md) | Web, news and image search, with the page text if you ask |
| [`stophy-crawl`](./skills/stophy-crawl/SKILL.md) | List a site's pages, crawl a site, batch scrape a list of URLs |
| [`stophy-extract`](./skills/stophy-extract/SKILL.md) | Named fields from up to 25 pages, from a prompt or a schema |
| [`stophy-parse`](./skills/stophy-parse/SKILL.md) | PDF, Word, Excel and PowerPoint files to markdown |
| [`stophy-monitor`](./skills/stophy-monitor/SKILL.md) | What changed on a page since the last read |
| [`stophy-download`](./skills/stophy-download/SKILL.md) | A site or a docs section saved as markdown files |
| [`stophy-docs`](./skills/stophy-docs/SKILL.md) | Developer questions answered from a library's current docs |
| [`stophy-browser`](./skills/stophy-browser/SKILL.md) | A browser that clicks through a site's search or form |

Build with Stophy:

| Skill | Covers |
|-------|--------|
| [`stophy-build`](./skills/stophy-build/SKILL.md) | Add Stophy to an app: SDK, REST, key and errors |
| [`stophy-build-scrape`](./skills/stophy-build-scrape/SKILL.md) | Code that scrapes pages and site data |
| [`stophy-build-search`](./skills/stophy-build-search/SKILL.md) | Code that searches the web |

Workflows:

| Skill | Covers |
|-------|--------|
| [`stophy-lead-gen`](./skills/stophy-lead-gen/SKILL.md) | Local businesses with phone, website, public emails and LinkedIn details |
| [`stophy-job-postings`](./skills/stophy-job-postings/SKILL.md) | Open roles across job boards, in full, with pay |
| [`stophy-shop`](./skills/stophy-shop/SKILL.md) | Prices, products and reviews compared across stores |
| [`stophy-competitive-intel`](./skills/stophy-competitive-intel/SKILL.md) | A competitor's ads, pricing, app reviews, posts and changes |
| [`stophy-deep-research`](./skills/stophy-deep-research/SKILL.md) | A sourced answer from the web, papers and discussions |

Site data:

| Skill | Covers |
|-------|--------|
| [`stophy-video`](./skills/stophy-video/SKILL.md) | YouTube, TikTok and Instagram: videos, transcripts, comments, channels |
| [`stophy-social`](./skills/stophy-social/SKILL.md) | Reddit, Instagram, LinkedIn, Pinterest, Facebook, X, Threads |
| [`stophy-places`](./skills/stophy-places/SKILL.md) | Google Maps, Tripadvisor, Yelp, Google Hotels, Airbnb, Booking.com, Expedia, Google Flights, Luma events |
| [`stophy-jobs`](./skills/stophy-jobs/SKILL.md) | LinkedIn, Indeed, Upwork, company careers pages and Glassdoor |
| [`stophy-shopping`](./skills/stophy-shopping/SKILL.md) | Amazon, TikTok Shop, eBay, Facebook Marketplace and Craigslist products and prices, and Trustpilot reviews |
| [`stophy-apps`](./skills/stophy-apps/SKILL.md) | App Store and Google Play apps, reviews and charts |
| [`stophy-real-estate`](./skills/stophy-real-estate/SKILL.md) | Zillow and Realtor.com homes for sale, for rent and sold |
| [`stophy-ads`](./skills/stophy-ads/SKILL.md) | Meta, Google, TikTok, and LinkedIn ad libraries |
| [`stophy-web`](./skills/stophy-web/SKILL.md) | Google Patents and Trends |

## For agents

Start with `stophy`, which names the skill for the task. Run the command, read the output, then summarize. Never invent data. Site data comes from scraping the site's own page with a parser: `stophy scrape "<page URL>" --parser <name>`. `stophy parsers` lists them. Each call returns one page. When the output has a `cursor`, run the same command with `--parserOptions '{"cursor":"<cursor>"}'` for the next page. Most calls cost $0.001, a search costs $0.001 per 10 results from each source, and each skill names the few that cost more.

## Docs

- [Install the skills](https://docs.stophy.dev/install-skill) covers each agent.
- [Install the CLI](https://docs.stophy.dev/install-cli) lists every command.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

## License

MIT
