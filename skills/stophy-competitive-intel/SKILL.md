---
name: stophy-competitive-intel
description: |
  Size up a competitor: the ads they run, their pricing, what their app users complain about, what they post, and what changed since last time. Use for "what is this competitor doing", "what ads is this brand running", "what are their plans and prices", "what do users hate about their app", "tell me when their pricing changes". For one ad library, use stophy-ads; for one app store, stophy-apps.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy competitive intel

Build a picture of a rival from public sources.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `google-ads`, `appstore-reviews`, `google-play-reviews` and `map` work without a key, 10 calls a minute and 50 a day. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# ads they run on Google and Meta
stophy scrape "https://adstransparency.google.com/?region=US&domain=nike.com" --parser google-ads
stophy scrape "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=nike&search_type=keyword_exact_phrase" --parser meta-ads

# their plans and prices, as fields
stophy scrape "https://www.notion.com/pricing" --formats '[{"type":"json","schema":{"type":"object","properties":{"plans":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"monthlyPrice":{"type":"string"}}}}}}}]'

# what their users say, and what they post
stophy scrape "https://apps.apple.com/us/app/notes/id1110145109" --parser appstore-reviews
stophy scrape "https://play.google.com/store/apps/details?id=com.spotify.music" --parser google-play-reviews --parserOptions '{"rating":1}'
stophy scrape "https://www.linkedin.com/company/microsoft" --parser linkedin-posts

# what changed on their pricing page since your last check
stophy scrape "https://www.notion.com/pricing" --formats '["markdown","changeTracking"]'
```

**Done when:** each finding links to its ad, page, review or post, and you say when you read it.

## Tips

- Find their pages first with `stophy map "<their site>" --search pricing`.
- Read 1-star reviews for complaints: `google-play-reviews` takes `--parserOptions '{"rating":1}'`.
- Run the change-tracking scrape on a schedule to hear when their pricing or terms change. See [stophy-monitor](../stophy-monitor/SKILL.md).
- A parser call or scrape costs 1 credit. Fields from a schema add 4 credits when they return something.

## See also

- [stophy-ads](../stophy-ads/SKILL.md), [stophy-apps](../stophy-apps/SKILL.md), [stophy-social](../stophy-social/SKILL.md)
- [stophy-monitor](../stophy-monitor/SKILL.md): watch a page for changes
