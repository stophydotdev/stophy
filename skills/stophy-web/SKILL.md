---
name: stophy-web
description: |
  Search the web and news, and look up a site's contacts and SEO, email deliverability, search suggestions, and Google Trends. Use for "search the web for", "find recent news about", "find the contact details on this site", "is this email address real", "what do people search for", "what's trending on Google". Web search works without an API key. For posts on social platforms use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy web

Search the web and news, and look up sites, email addresses, search suggestions, and Google Trends.

**Prerequisite:** `stophy web search` works without a key. Every other command needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find pages and sources on a topic
stophy web search "postgres 18 release notes" --limit 10 --json -o .stophy/search.json

# recent coverage of a topic
stophy web news "openai" --within week --json -o .stophy/news.json

# contact details published on a site
stophy web contacts "https://www.franklinbbq.com" --json -o .stophy/contacts.json

# a page's titles, tags, headings, and links
stophy site seo "https://www.allbirds.com" --json -o .stophy/seo.json

# is an address real, and who is the likely contact
stophy email check --emails "patrick@stripe.com,info@example.com" --json
stophy email find stripe.com --name "Patrick Collison" --json

# keyword research: autocomplete suggestions from Google, YouTube or Amazon
stophy suggest "best running shoes" --source google --json -o .stophy/suggest.json

# search interest over time, and related searches
stophy google trends --by time --queries bitcoin,ethereum --json -o .stophy/trends.json
stophy google trends related bitcoin --json
```

Run `stophy <source> --help` for every command. The sources here are `web`, `site`, `email`, `suggest`, and `google`.

**Done when:** you report each result with its source URL or domain, and every number or contact detail matches the saved output.

## Tips

- `suggest` needs `--source google`, `youtube` or `amazon`. `google trends` needs `--by time` or `--by region`, and up to five `--queries`.
- `google trends related` and `google trends trending` take a bare keyword or a country, not a URL.
- `web contacts` costs 2 credits. `web search`, `web news` and `site seo` cost 1.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok videos and transcripts
- [stophy-social](../stophy-social/SKILL.md): posts and profiles on Reddit, X, Instagram, and other platforms
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries, including Google's
