---
name: stophy-ads
description: |
  Search the public ad libraries of Meta (Facebook and Instagram), Google, TikTok, LinkedIn, Pinterest, Microsoft, and Snapchat. Use for "what ads is this brand running", "find ads for this competitor", "what is this company advertising on Facebook", "get this ad's details", "find advertisers in this ad library". For a brand's organic posts, not ads, use stophy-social or stophy-video.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy ads

Search the public ad libraries of seven ad platforms and read one ad in full.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# a brand's active Facebook and Instagram ads
stophy meta ads search nike --limit 20 -o .stophy/meta-ads.md

# a domain's Google ads
stophy google ads search --domain nike.com --limit 25 -o .stophy/google-ads.md

# TikTok and LinkedIn ads by keyword or brand
stophy tiktok ads search --query adidas --limit 12 -o .stophy/tiktok-ads.md
stophy linkedin ads search --query software -o .stophy/linkedin-ads.md

# one country's Pinterest ads
stophy pinterest ads search DE --limit 24 -o .stophy/pinterest-ads.md

# one ad in full, by ID from a search result
stophy meta ads ad "123456789012345" -o .stophy/ad.md
```

Run `stophy <source> ads --help` for every command. The sources here are `meta`, `google`, `tiktok`, `linkedin`, `pinterest`, `microsoft`, and `snapchat`.

**Done when:** you name the specific advertiser, ad copy, and platform, with the ad's ID or link.

## Tips

- To list every ad from one advertiser, use `meta ads page`, `google ads advertisers`, or `microsoft ads advertisers`.
- `pinterest ads search` and `snapchat ads search` take a country code or advertiser name, not a free-text query. Check `--help` for which.

## See also

- [stophy-social](../stophy-social/SKILL.md): a brand's organic posts
- [stophy-video](../stophy-video/SKILL.md): a channel's organic videos
