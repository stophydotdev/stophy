---
name: stophy-apps
description: |
  Get app listings, details, reviews, and top charts from the Apple App Store and Google Play. Use for "find apps for", "what do reviews say about this app", "what is trending in the App Store", "get this app's rating and description", "compare this app on iOS and Android". For physical products use stophy-shopping.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy apps

Search apps, read their details, and read their reviews on the App Store and Google Play.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search either store by keyword
stophy appstore search "photo editor" --limit 20 -o .stophy/appstore-search.md
stophy googleplay search "photo editor" -o .stophy/googleplay-search.md

# one app's details, by numeric ID or package name
stophy appstore app 284882215 -o .stophy/appstore-app.md
stophy googleplay app com.spotify.music -o .stophy/googleplay-app.md

# what users say
stophy appstore reviews 284882215 --sort helpful --limit 40 -o .stophy/reviews.md

# what is popular now
stophy appstore top --chart free --limit 50 -o .stophy/top.md
```

Run `stophy <source> --help` for every command. The sources here are `appstore` and `googleplay`.

**Done when:** you name the specific app, rating, and store, and quote reviews instead of paraphrasing them.

## Tips

- App Store IDs are numeric. Find one in a search result or the App Store URL. Google Play uses the package name, such as `com.spotify.music`.
- `appstore top` needs no app ID. It returns the current charts for a device and country.

## See also

- [stophy-shopping](../stophy-shopping/SKILL.md): physical products
