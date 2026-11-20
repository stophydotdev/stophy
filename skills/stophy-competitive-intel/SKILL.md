---
name: stophy-competitive-intel
description: Use to size up a company or app, like "what ads is this brand running", "what are their plans and prices", "what do users say about this app", "top free apps", "how big is this company", "tell me when their pricing changes". Covers ad libraries, the App Store, Google Play, Crunchbase and G2.
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy competitive intel

Setup, keys and errors: [stophy](../stophy/SKILL.md). Find their pages first with `stophy map "<their site>" --search pricing`.

| Question | Read |
|---|---|
| What ads they run | `google-ads` (no key), `meta-ads`, `tiktok-ads`, `linkedin-ads` |
| Their plans and prices | their pricing page with a json format, see [stophy-scrape](../stophy-scrape/SKILL.md) |
| What app users say | `appstore-reviews` and `google-play-reviews` (no key) |
| How big they are | `linkedin-company`, `crunchbase-company` |
| What buyers say | `g2-reviews`, `trustpilot-reviews` |
| What they post | [stophy-social](../stophy-social/SKILL.md) |
| What changed | `changeTracking`, see [stophy-scrape](../stophy-scrape/SKILL.md) |

```bash
stophy scrape "https://adstransparency.google.com/?region=US&domain=nike.com" --parser google-ads
stophy scrape "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=nike&search_type=keyword_exact_phrase" --parser meta-ads
stophy scrape "https://play.google.com/store/apps/details?id=com.spotify.music" --parser google-play-reviews --parserOptions '{"rating":1}'
stophy scrape "https://www.g2.com/products/slack/reviews" --parser g2-reviews
```

| Parser | Page |
|---|---|
| `google-ads` | adstransparency.google.com with a domain, an advertiser page or an ad page |
| `meta-ads` | facebook.com/ads/library with `q`, a `view_all_page_id`, or an ad `id` |
| `tiktok-ads` | library.tiktok.com/ads with `adv_name`, or an ad page |
| `linkedin-ads` | linkedin.com/ad-library/search with `keyword` or `accountOwner`, or an ad page |
| `appstore-search`, `appstore-top` | apps.apple.com/us/iphone/search?term=..., apps.apple.com/us/iphone/charts |
| `appstore-app`, `appstore-reviews` | apps.apple.com/us/app/name/id... |
| `google-play-search` | play.google.com/store/search?q=...&c=apps |
| `google-play-app`, `google-play-reviews` | play.google.com/store/apps/details?id=... |
| `crunchbase-company` | crunchbase.com/organization/name |
| `g2-reviews` | g2.com/products/name/reviews |

- Put the country in the ad library URL: `region` on Google and TikTok, `country` on Meta, `countries` on LinkedIn.
- For complaints, read 1-star reviews: `--parserOptions '{"rating":1}'` on Google Play.

**Done when:** each finding links to its ad, page, review or post, and says when you read it.

## Price

$0.001 a call, except `appstore-search`, `appstore-top` and `google-play-search`: $0.001 per 10 apps.
