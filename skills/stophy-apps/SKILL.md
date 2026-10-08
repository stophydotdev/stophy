---
name: stophy-apps
description: |
  Get app store data: search the App Store and Google Play, read an app's details and reviews, and see the App Store top charts. Use for "find apps for", "what do users say about this app", "what is the rating of", "top free apps right now", "how do people review this app on Google Play". For videos about an app use stophy-video.
metadata:
  author: stophy
  version: "4.0.2"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy apps

Search apps and read their details and reviews on the App Store and Google Play.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# apps by keyword, on each store
stophy appstore search "photo editor" --json -o .stophy/appstore.json
stophy google play search "photo editor" --json -o .stophy/google-play.json

# one app's details, by App Store ID or Google Play package name
stophy appstore app 284882215 --json
stophy google play app com.spotify.music --json

# what users say, newest first
stophy appstore reviews 284882215 --sort newest --json -o .stophy/appstore-reviews.json
stophy google play reviews com.spotify.music --rating 1 --json -o .stophy/google-play-reviews.json

# the App Store top free iPhone apps in the US
stophy appstore top --chart free --device iphone --country us --json
```

Run `stophy <source> --help` for every command. The sources here are `appstore` and `google play`.

**Done when:** you name the specific app, its rating or rank, and the review text or detail you rely on, with the store link.

## Tips

- `appstore app`, `appstore reviews`, `google play app` and `google play reviews` cost 1 credit per call. `appstore search`, `appstore top` and `google play search` cost 1 credit per 10 apps, and `--limit` returns fewer.
- Search first to get an app ID, then run `app` or `reviews` on it. To point at one app, give its link or its id, never both: `--appUrl` or `--appId`.
- App Store IDs are numbers (`284882215`). Google Play IDs are package names (`com.spotify.music`).
- `--country` picks the storefront, so prices, ratings and charts can differ by country. Google Play also takes `--language`.
- `appstore reviews` takes `--sort` (`newest`, `helpful`, `highest`, `lowest`). `google play reviews` takes `--sort` (`newest`, `relevance`, `highest`) and `--rating` to keep one star level.
- Each call returns one page. For more App Store reviews, run the same command with `--page 2`, until a page has no results. For more Google Play reviews, run it with `--cursor <cursor>` from the last output. Keep the other options the same.
- `appstore top` takes `--chart` (`free`, `paid`, `grossing`), `--device` (`iphone`, `ipad`, `mac`) and `--genre`. Google Play has search, app and reviews only.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok videos about an app
- [stophy-social](../stophy-social/SKILL.md): what people say about an app on Reddit
