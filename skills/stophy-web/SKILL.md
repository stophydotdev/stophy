---
name: stophy-web
description: |
  Search the web and news, and look up a site's pages and SEO, a domain's WHOIS, DNS, and tech, email deliverability, and Google Trends. Use for "search the web for", "find recent news about", "what tech does this site run on", "who owns this domain", "is this email address real", "what's trending on Google". Web search works without an API key. For posts on social platforms use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy web

Search the web and news, and look up sites, domains, email addresses, and Google Trends.

**Prerequisite:** `stophy web search` works without a key. Every other command needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find pages and sources on a topic
stophy web search "postgres 18 release notes" --limit 10 -o .stophy/search.md

# recent coverage of a topic
stophy web news --query "openai" --within week -o .stophy/news.md

# contact details published on a site
stophy web contacts "https://www.franklinbbq.com" -o .stophy/contacts.md

# what a domain runs on, and who owns it
stophy domain tech "https://www.allbirds.com" -o .stophy/tech.md
stophy domain whois stripe.com -o .stophy/whois.md

# keyword research: autocomplete suggestions
stophy google suggest "best running shoes" --expand alphabet -o .stophy/suggest.md
```

Run `stophy <source> --help` for every command. The sources here are `web`, `site`, `domain`, `email`, and `google`.

**Done when:** you report each result with its source URL or domain, and every number or contact detail matches the saved output.

## Tips

- For a full site audit, run `site map` to list every URL, then run `site seo` on the URLs that matter.
- `google trends interest` and `google trends related` take a bare keyword, not a URL. `domain whois`, `domain dns`, and `domain tech` take a domain or URL.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube, TikTok, and Kick videos
- [stophy-social](../stophy-social/SKILL.md): posts and profiles on Reddit, X, Instagram, and other platforms
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries, including Google's
