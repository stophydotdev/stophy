---
name: stophy-apps
description: |
  Get app store data: search the App Store and Google Play, read an app's details and reviews, and see the App Store top charts. Use for "find apps for", "what do users say about this app", "what is the rating of", "top free apps right now", "how do people review this app on Google Play". App Store and Google Play reviews work without an API key. For videos about an app use stophy-video.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy apps

Find apps and read what their users say.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). `appstore-reviews` and `google-play-reviews` work without a key, 50 calls a day, first page only. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no key needed: an app's reviews on both stores
stophy scrape "https://apps.apple.com/us/app/notes/id1110145109" --parser appstore-reviews --json -o .stophy/reviews.json
stophy scrape "https://play.google.com/store/apps/details?id=com.spotify.music" --parser google-play-reviews

# key needed: search, details and charts
stophy scrape "https://apps.apple.com/us/iphone/search?term=notes" --parser appstore-search
stophy scrape "https://play.google.com/store/search?q=meditation&c=apps" --parser google-play-search
stophy scrape "https://play.google.com/store/apps/details?id=com.spotify.music" --parser google-play-app
stophy scrape "https://apps.apple.com/us/iphone/charts" --parser appstore-top
```

**Done when:** you name each app with its rating and store link, and quote the reviews you summarize.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `appstore-search` | apps.apple.com/us/iphone/search?term=... | limit |
| `appstore-app` | apps.apple.com/us/app/name/id... | country |
| `appstore-reviews` (no key) | apps.apple.com/us/app/name/id... | sort, page |
| `appstore-top` | apps.apple.com/us/iphone/charts, or one chart | limit |
| `google-play-search` | play.google.com/store/search?q=...&c=apps | limit |
| `google-play-app` | play.google.com/store/apps/details?id=... | country, language |
| `google-play-reviews` (no key) | play.google.com/store/apps/details?id=... | sort, rating, cursor |

## Tips

- `appstore-reviews` pages with `{"page":2}`, and `google-play-reviews` with the `cursor`.
- `appstore-search`, `appstore-top` and `google-play-search` cost 1 credit per 10 apps. Every other call here costs 1 credit.

## See also

- [stophy-video](../stophy-video/SKILL.md): videos and reviews of an app on YouTube and TikTok
