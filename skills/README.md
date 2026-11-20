# Stophy skills

[![skills.sh](https://skills.sh/b/stophydotdev/stophy)](https://skills.sh/stophydotdev/stophy)

Search, read, and act on the web. Agent skills that run on [the Stophy CLI](https://www.npmjs.com/package/@stophy/cli), plus the hosted MCP server at `https://mcp.stophy.dev/mcp`.

## Install

```bash
npm install -g @stophy/cli
stophy init --all
```

`init` installs the skills and the MCP server for your agents, then signs you in. To install one part:

- **Claude Code plugin:** `/plugin marketplace add stophydotdev/stophy`, then `/plugin install stophy@stophy`.
- **Skills only:** `npx skills add stophydotdev/stophy`. Add `--skill stophy-video` to install one skill.
- **Gemini CLI:** `gemini extensions install https://github.com/stophydotdev/stophy`.
- **Cursor:** click **Add to Cursor** on [cursor.directory](https://cursor.directory/plugins/stophy).
- **MCP only:** `claude mcp add --transport http stophy https://mcp.stophy.dev/mcp`.

The skills need CLI 2.1.2 or later and Node.js 20 or later. Run `stophy login` to sign in, or set `STOPHY_API_KEY` in CI. Search, scrape, map, parse and the parsers marked "no key" work without a key for 10 calls a minute and 50 a day.

## Skills

| Skill | Use it for |
|-------|------------|
| [`stophy`](./stophy/SKILL.md) | Start here: setup, which skill and command fits, prices and errors |
| [`stophy-search`](./stophy-search/SKILL.md) | Web, news, images, papers and docs questions |
| [`stophy-scrape`](./stophy-scrape/SKILL.md) | A URL or a file as markdown or fields, fields from 25 pages, page changes |
| [`stophy-crawl`](./stophy-crawl/SKILL.md) | A site's pages: map, crawl, batch scrape, save as files |
| [`stophy-deep-research`](./stophy-deep-research/SKILL.md) | Sourced reports, Google Patents and Google Trends |
| [`stophy-browser`](./stophy-browser/SKILL.md) | Data behind a site's search box or form |
| [`stophy-build`](./stophy-build/SKILL.md) | Stophy in your code: SDKs, REST, paging, errors |
| [`stophy-video`](./stophy-video/SKILL.md) | YouTube, TikTok, Instagram and Twitch videos and transcripts |
| [`stophy-social`](./stophy-social/SKILL.md) | Reddit, X, Instagram, LinkedIn, Facebook, Threads, Bluesky, Pinterest |
| [`stophy-places`](./stophy-places/SKILL.md) | Maps, reviews, hotels, flights, events and local leads |
| [`stophy-shopping`](./stophy-shopping/SKILL.md) | Amazon, eBay, TikTok Shop, Marketplace, Craigslist, Trustpilot |
| [`stophy-jobs`](./stophy-jobs/SKILL.md) | LinkedIn, Indeed, Upwork, careers pages, Glassdoor |
| [`stophy-real-estate`](./stophy-real-estate/SKILL.md) | Zillow and Realtor.com |
| [`stophy-competitive-intel`](./stophy-competitive-intel/SKILL.md) | Ad libraries, app stores, pricing, Crunchbase, G2 |

These names now point to the skill that replaced them: `stophy-shop`, `stophy-job-postings`, `stophy-download`, `stophy-parse`, `stophy-monitor`, `stophy-extract`, `stophy-docs`, `stophy-web`, `stophy-ads`, `stophy-apps`, `stophy-lead-gen`, `stophy-build-scrape` and `stophy-build-search`.

## Docs

- [Install the skills](https://docs.stophy.dev/install-skill)
- [Install the CLI](https://docs.stophy.dev/install-cli)
- [Pricing](https://docs.stophy.dev/account/pricing)

## License

MIT
