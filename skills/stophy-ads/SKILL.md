---
name: stophy-ads
description: |
  Search the public ad libraries of Meta (Facebook and Instagram), Google, TikTok, LinkedIn, Microsoft, and Pinterest. Use for "what ads is this brand running", "find ads for this competitor", "what is this company advertising on Facebook", "get this ad's details", "find advertisers in this ad library". For a brand's organic posts, not ads, use stophy-social or stophy-video.
metadata:
  author: stophy
  version: "4.0.3"
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
stophy meta ads search nike --json -o .stophy/meta-ads.json

# Meta ads that are video only, on Instagram, in English
stophy meta ads search nike --mediaType video --platforms instagram --language en --json -o .stophy/meta-video.json

# a domain's Google ads
stophy google ads search --domain nike.com --json -o .stophy/google-ads.json

# TikTok and LinkedIn ads by keyword or advertiser
stophy tiktok ads search adidas --json -o .stophy/tiktok-ads.json
stophy linkedin ads search software --json -o .stophy/linkedin-ads.json

# Microsoft ads by keyword
stophy microsoft ads search shoes --json

# Pinterest ads by country and advertiser
stophy pinterest ads search --country de --advertiser nike --json -o .stophy/pinterest-ads.json

# one ad in full, by ID or link from a search result
stophy meta ads ad 925321173274919 --json -o .stophy/ad.json

# find an advertiser by name in the Google or Microsoft library
stophy google ads advertisers nike --json
stophy microsoft ads advertisers nike --json

# every ad a Facebook page runs
stophy meta ads page "https://www.facebook.com/nike" --json -o .stophy/page-ads.json
```

Run `stophy <platform> ads --help` for every command. The platforms are `meta`, `google`, `tiktok`, `linkedin`, `microsoft`, and `pinterest`.

**Done when:** you name the specific advertiser, ad copy, and platform, with the ad's ID or link.

## Tips

- Every command here costs 1 credit per call.
- Each platform has its own `ads search`, `ads ad` and, for Google and Microsoft, `ads advertisers`. Search first, then run `ads ad` on a result. To point at one ad, give its link or its id, never both: `--adUrl` or `--adId`. Microsoft needs `--adId`.
- The platform decides what a search accepts. Meta needs a keyword, and takes `--mediaType` (`image`, `video`, `text`, `meme` or `imageAndMeme`), `--platforms`, `--language`, `--status`, `--shownFrom` and `--shownTo`. Google takes a domain such as `nike.com` (or `--advertiser`) and `--platform`, `--mediaType`, `--shownFrom` and `--shownTo`. To search Google by name, find the advertiser with `google ads advertisers` first. TikTok, LinkedIn and Microsoft take a keyword, an advertiser, or both. LinkedIn honours `--within`. Pinterest needs `--country` and takes `--advertiser`, with no keyword.
- TikTok, Microsoft and Pinterest publish ads for European countries only (Pinterest also `br` and `tr`). Pick a country from that list.
- Every search returns one page. When the output ends with a `cursor`, run the same command with `--cursor <cursor>` for the next page.

## See also

- [stophy-social](../stophy-social/SKILL.md): a brand's organic posts
- [stophy-video](../stophy-video/SKILL.md): a channel's organic videos
