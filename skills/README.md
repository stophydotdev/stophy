# Stophy skills

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)
[![smithery badge](https://smithery.ai/badge/stophy/mcp)](https://smithery.ai/servers/stophy/mcp)

Live web data as typed JSON for AI agents. Search, video, social, jobs, places, property and ads behind one key, with a flat price per call. You pay only for answers that come back. This repo is a plugin with two parts:

- The hosted Stophy MCP server, `https://api.stophy.dev/mcp-oauth`. It signs you in with your browser.
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
claude mcp add --transport http stophy https://api.stophy.dev/mcp-oauth
```

Or use `https://api.stophy.dev/mcp` with an `Authorization: Bearer <key>` header. Without a key, only web search works.

## Requirements

- Node.js ≥18
- The CLI: `npm install -g @stophy/cli`, or run it with `npx -y @stophy/cli`
- An API key from [stophy.dev](https://stophy.dev/signup) for every command except web search

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
| [`stophy-web`](./skills/stophy-web/SKILL.md) | Web search |
| [`stophy-video`](./skills/stophy-video/SKILL.md) | YouTube and TikTok: videos, transcripts (YouTube, TikTok, Instagram), comments, channels |
| [`stophy-social`](./skills/stophy-social/SKILL.md) | Reddit, Instagram, LinkedIn, Pinterest |
| [`stophy-places`](./skills/stophy-places/SKILL.md) | Google Maps, Airbnb, Google Flights |
| [`stophy-jobs`](./skills/stophy-jobs/SKILL.md) | LinkedIn and Upwork job postings |
| [`stophy-real-estate`](./skills/stophy-real-estate/SKILL.md) | Zillow, Rightmove, ImmoScout24 |
| [`stophy-ads`](./skills/stophy-ads/SKILL.md) | Meta, Google, TikTok, LinkedIn, Pinterest, and Microsoft ad libraries |

## For agents

Pick the narrowest skill for the task. Run the command, read the output, then summarize. Never invent data. Every call returns one page for one flat price, and `--limit` keeps fewer results at the same price.

## Docs

Full command reference: [docs.stophy.dev](https://docs.stophy.dev)

## License

MIT
