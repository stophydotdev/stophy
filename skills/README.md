# Stophy skills

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)
[![smithery badge](https://smithery.ai/badge/stophy/mcp)](https://smithery.ai/servers/stophy/mcp)

Live public web data for your AI agent: search, video, social, places, shopping, apps, jobs, real estate, ad libraries, and finance. This repo is a plugin with two parts:

- The hosted Stophy MCP server, `https://api.stophy.dev/mcp-oauth`. It signs you in with your browser.
- Eleven agent skills that run on [the Stophy CLI](https://www.npmjs.com/package/@stophy/cli).

## Install

### Claude Code

```
/plugin marketplace add stophydotdev/skills
/plugin install stophy@stophy
```

### Cursor

Install the Stophy plugin from the [Cursor Marketplace](https://cursor.com/marketplace). Sign in when Cursor opens the browser.

### Gemini CLI

```bash
gemini extensions install https://github.com/stophydotdev/skills
```

### Skills only

Works with any agent that supports the Agent Skills format.

```bash
npx skills add stophydotdev/skills
npx skills add stophydotdev/skills --skill stophy-web --skill stophy-video
```

### MCP server only

```bash
claude mcp add --transport http stophy https://api.stophy.dev/mcp-oauth
```

Or use `https://api.stophy.dev/mcp` with an `Authorization: Bearer <key>` header. Without a key, only the free tools work.

## Requirements

- Node.js ≥18
- The CLI: `npm install -g @stophy/cli`, or run it with `npx -y @stophy/cli`
- An API key from [stophy.dev](https://stophy.dev/signup) for every command except web search, YouTube search, and YouTube transcripts

## Authentication

```bash
stophy login --browser           # opens the browser
export STOPHY_API_KEY=st_xxx     # env var also works
```

Treat the API key as a secret. Do not commit it, print it, or paste it into a shared log.

## Included skills

| Skill | Covers |
|-------|--------|
| [`stophy`](./skills/stophy/SKILL.md) | Setup, login, running any command, and errors |
| [`stophy-web`](./skills/stophy-web/SKILL.md) | Web and news search, site maps and SEO, domain and email lookups, Google Trends |
| [`stophy-video`](./skills/stophy-video/SKILL.md) | YouTube, TikTok, and Kick: videos, transcripts, comments, channels |
| [`stophy-social`](./skills/stophy-social/SKILL.md) | Reddit, Instagram, X, Threads, Bluesky, Mastodon, Telegram, LinkedIn, Pinterest, Tumblr, Snapchat, Quora |
| [`stophy-places`](./skills/stophy-places/SKILL.md) | Google Maps, Tripadvisor, Airbnb, Google Flights |
| [`stophy-shopping`](./skills/stophy-shopping/SKILL.md) | Amazon, Walmart, AliExpress, Shopify stores |
| [`stophy-apps`](./skills/stophy-apps/SKILL.md) | App Store and Google Play listings and reviews |
| [`stophy-jobs`](./skills/stophy-jobs/SKILL.md) | Indeed, LinkedIn, and Upwork job postings |
| [`stophy-real-estate`](./skills/stophy-real-estate/SKILL.md) | Zillow, Redfin, Realtor.com, Rightmove, ImmoScout24 |
| [`stophy-ads`](./skills/stophy-ads/SKILL.md) | Meta, Google, TikTok, LinkedIn, Pinterest, Microsoft, and Snapchat ad libraries |
| [`stophy-finance`](./skills/stophy-finance/SKILL.md) | Stock quotes and history, crypto prices, DEX pairs, wallets |

## For agents

Pick the narrowest skill for the task. Run the command, read the output, then summarize. Never invent data.

## Docs

Full command reference: [docs.stophy.dev](https://docs.stophy.dev)

## License

MIT
