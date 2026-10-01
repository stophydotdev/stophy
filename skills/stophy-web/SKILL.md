---
name: stophy-web
description: |
  Search the web and get ranked results with titles, links, and descriptions. Use for "search the web for", "find pages about", "find sources on". Web search works without an API key. For posts on social platforms use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy web

Search the web for pages and sources on a topic.

**Prerequisite:** `stophy web search` works without a key. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find pages and sources on a topic
stophy web search "postgres 18 release notes" --limit 10 --json -o .stophy/search.json
```

Narrow a search with `--within`, `--country`, and `--language`. Run `stophy web search --help` for every option.

**Done when:** you report each result with its source URL or domain, and every claim matches the saved output.

## Tips

- Search first, then open the pages that matter. Quote the result's `url`.
- `web search` costs 1 credit, and works without a key within a free limit.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok videos and transcripts
- [stophy-social](../stophy-social/SKILL.md): posts and profiles on Reddit, Instagram, LinkedIn, and Pinterest
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries, including Google's
