# Stophy skills

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)
[![smithery badge](https://smithery.ai/badge/stophy/mcp)](https://smithery.ai/servers/stophy/mcp)

Web scraping API for AI agents. Search, video, social, jobs, places, shopping, apps, property and ads behind one key, with a price shown before every call. You pay only for answers that come back. This repo is a plugin with two parts:

- The hosted Stophy MCP server, `https://mcp.stophy.dev/mcp`. It signs you in with your browser.
- Agent skills for each kind of data that run on [the Stophy CLI](https://www.npmjs.com/package/@stophy/cli).

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
claude mcp add --transport http stophy https://mcp.stophy.dev/mcp
```

Or use `https://api.stophy.dev/mcp` with an `Authorization: Bearer <key>` header. Without a key, the endpoints marked `keyless: true` in the [endpoint list](https://api.stophy.dev/v1/endpoints) work, within a free allowance.

## Requirements

- Node.js ≥18
- The CLI: `npm install -g @stophy/cli`, or run it with `npx -y @stophy/cli`
- An API key from [stophy.dev](https://stophy.dev/signup) for every command except Google search, Google News, Google Maps search, Reddit search, YouTube search, YouTube video details and YouTube transcripts

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
| [`stophy-web`](./skills/stophy-web/SKILL.md) | Google search, news, scholar, patents, AI answers and trends |
| [`stophy-video`](./skills/stophy-video/SKILL.md) | YouTube, TikTok and Instagram: videos, transcripts, comments, channels |
| [`stophy-social`](./skills/stophy-social/SKILL.md) | Reddit, Instagram, LinkedIn, Pinterest, Facebook, X, Threads |
| [`stophy-places`](./skills/stophy-places/SKILL.md) | Google Maps, Tripadvisor, Google Hotels, Airbnb, Booking.com, Google Flights |
| [`stophy-jobs`](./skills/stophy-jobs/SKILL.md) | Google Jobs, LinkedIn, Indeed, Upwork and company careers pages |
| [`stophy-shopping`](./skills/stophy-shopping/SKILL.md) | Amazon, Google Shopping, TikTok Shop, eBay and Facebook Marketplace products and prices, and Trustpilot reviews |
| [`stophy-apps`](./skills/stophy-apps/SKILL.md) | App Store and Google Play apps, reviews and charts |
| [`stophy-real-estate`](./skills/stophy-real-estate/SKILL.md) | Zillow homes for sale, for rent and sold |
| [`stophy-ads`](./skills/stophy-ads/SKILL.md) | Meta, Google, TikTok, and LinkedIn ad libraries |

## For agents

Pick the narrowest skill for the task. Run the command, read the output, then summarize. Never invent data. Every call returns one page from the site for a fixed price. Get the next page with `--page` or with the `--cursor` from the last output. Most calls cost 1 credit, some cost 2, and long lists cost 1 credit per 10 results. TikTok transcripts cost 1 credit when the video has captions. Instagram transcripts, and TikTok videos without captions, cost 2 credits plus 1 per 10 seconds of audio.

## Docs

Full command reference: [docs.stophy.dev](https://docs.stophy.dev)

## License

MIT
