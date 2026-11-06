---
name: stophy-ads
description: |
  Search the public ad libraries of Meta (Facebook and Instagram), Google, TikTok and LinkedIn. Use for "what ads is this brand running", "find ads for this competitor", "what is this company advertising on Facebook", "get this ad's details", "find advertisers in this ad library". Google's ad library works without an API key. For a brand's own posts, not ads, use stophy-social or stophy-video.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy ads

See which ads a brand runs, and where.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `google-ads` works without a key, 50 calls a day, first page only. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no key needed: a brand's Google ads
stophy scrape "https://adstransparency.google.com/?region=US&domain=nike.com" --parser google-ads --json -o .stophy/google-ads.json

# key needed: Meta, TikTok and LinkedIn
stophy scrape "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=nike&search_type=keyword_exact_phrase" --parser meta-ads
stophy scrape "https://library.tiktok.com/ads?region=DE&adv_name=adidas&query_type=1" --parser tiktok-ads
stophy scrape "https://www.linkedin.com/ad-library/search?keyword=software&countries=DE" --parser linkedin-ads
```

**Done when:** you report each ad with its advertiser, dates and link as the output gives them.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `google-ads` (no key) | adstransparency.google.com with a domain, an advertiser page or an ad page | view: advertisers, mediaType, shownFrom, shownTo, cursor |
| `meta-ads` | facebook.com/ads/library with `q`, a `view_all_page_id`, or an ad `id` | mediaType, platforms, shownFrom, shownTo, cursor |
| `tiktok-ads` | library.tiktok.com/ads with `adv_name`, or an ad page | advertiser, cursor |
| `linkedin-ads` | linkedin.com/ad-library/search with `keyword` or `accountOwner`, or an ad page | advertiser, cursor |

## Tips

- Put the country in the page URL: `region` on Google and TikTok, `country` on Meta, `countries` on LinkedIn.
- Every call here costs 1 credit.

## See also

- [stophy-social](../stophy-social/SKILL.md): a brand's own posts
- [stophy-video](../stophy-video/SKILL.md): a brand's own videos
