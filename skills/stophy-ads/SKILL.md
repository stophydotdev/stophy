---
name: stophy-ads
description: |
  Search the public ad libraries of Meta (Facebook and Instagram), Google, TikTok, LinkedIn, Microsoft, and Pinterest. Use for "what ads is this brand running", "find ads for this competitor", "what is this company advertising on Facebook", "get this ad's details", "find advertisers in this ad library". For a brand's organic posts, not ads, use stophy-social or stophy-video.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy ads

Search the public ad libraries of six ad platforms and read one ad in full.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# a brand's ads on Meta (Facebook and Instagram)
stophy ads search nike --network meta --limit 20 --json -o .stophy/meta-ads.json

# a domain's Google ads
stophy ads search --network google --domain nike.com --limit 25 --json -o .stophy/google-ads.json

# Meta ads that are video only
stophy ads search nike --network meta --mediaType video --json -o .stophy/meta-video.json

# TikTok and LinkedIn ads by keyword or advertiser
stophy ads search adidas --network tiktok --limit 12 --json -o .stophy/tiktok-ads.json
stophy ads search software --network linkedin --json -o .stophy/linkedin-ads.json

# Pinterest ads by country and advertiser
stophy ads search --network pinterest --country de --advertiser nike --json -o .stophy/pinterest-ads.json

# one ad in full, by ID from a search result
stophy ads ad "123456789012345" --network meta --json -o .stophy/ad.json

# find an advertiser by name in the Google or Microsoft library
stophy ads advertisers nike --network google --json

# every ad a Facebook page runs
stophy meta ads page "https://www.facebook.com/nike" --json -o .stophy/page-ads.json
```

Run `stophy ads --help` for every command. `--network` is one of `meta`, `google`, `tiktok`, `linkedin`, `microsoft`, or `pinterest`.

**Done when:** you name the specific advertiser, ad copy, and platform, with the ad's ID or link.

## Tips

- `ads advertisers` costs 1 credit per call. `ads search`, `ads ad` and `meta ads page` cost 5.
- The network decides what a search accepts. Meta needs a keyword, and `--mediaType` keeps `image`, `video` or `text` ads. Google takes `--advertiser` or `--domain`, and a keyword only when it is a domain. To search Google by name, find the advertiser with `ads advertisers` first. TikTok, LinkedIn and Microsoft take a keyword, an advertiser, or both. LinkedIn honours `--within`. Pinterest needs `--country` and `--advertiser`, and takes no keyword.
- `ads advertisers` covers `google` and `microsoft` only.

## See also

- [stophy-social](../stophy-social/SKILL.md): a brand's organic posts
- [stophy-video](../stophy-video/SKILL.md): a channel's organic videos
