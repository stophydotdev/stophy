---
name: stophy-search
description: Search YouTube by keyword with the Stophy CLI. Trigger when the user asks to find videos, Shorts, channels, playlists, or movies; wants top/recent/popular content on a topic; or needs candidate results before fetching transcripts, comments, channel, or playlist data.
metadata:
  author: stophy
  version: "2.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-search

Search YouTube by keyword and filter by type, date, duration, features, and sort order.
Part of Stophy, the YouTube context API for AI agents.

## Choose this skill when

- The user asks to "search YouTube", "find videos about X", "top videos on X", or "recent X".
- The user needs candidate videos/channels/playlists before deeper lookups.

If the user already gave a specific video, channel, or playlist URL, use the matching
focused skill instead.

## Safety

- Always pass the query as a quoted flag: `--q "your query"`. Never splice user text into
  the command outside that quoted argument.

## Commands

```bash
stophy search --q "how to build a SaaS"                          # basic
stophy search --q "Claude Code" --type video --sortBy popularity # popular videos
stophy search --q "AI news" --uploadDate week                    # recent
stophy search --q "Python for beginners" --duration long         # long-form
stophy search --q "live coding" --features live                  # by feature
stophy search --q "typescript" --continuation-token <token>      # next page
```

## Options

| Option | Values | Use when |
|--------|--------|----------|
| `--q <query>` | any query | Always required |
| `--type <type>` | video, short, channel, playlist, movie | Limit result type |
| `--sortBy <sort>` | relevance, popularity, date, rating | Order results |
| `--uploadDate <date>` | today, week, month, year | Focus on recent content |
| `--duration <duration>` | short (<4m), medium (4–20m), long (>20m) | Match length |
| `--features <feature>` | live, 4k, hd, subtitles, creativeCommons, 360, vr180, 3d, hdr, location, purchased | Filter by feature |
| `--continuation-token <token>` | string | Fetch the next page |
| `--json` | — | Pipe or parse raw JSON |

Note: `--duration` does not apply when `--type short` (Shorts are already short-form).

## Decision rules

- `--sortBy popularity` for "top"/"popular"/"biggest" videos.
- `--sortBy date` or `--uploadDate week/month` for news and fast-moving topics.
- `--duration long` for podcasts, lectures, deep dives.
- `--type channel` when the user wants creators, not individual videos.
- Keep the query human-readable; skip Boolean syntax unless the user asks.

## Output guidance

- Return a short ranked list: title, channel, URL, publish date, and views when available.
- Include `continuationToken` if the user may want more results.
- Suggest the next exact command (video, transcript, comments) for a selected result.

## Follow-up paths

- [stophy-video](../stophy-video/SKILL.md) — metadata, transcript, comments for a result
- [stophy-channel](../stophy-channel/SKILL.md) — inspect a channel from results
- [stophy-playlist](../stophy-playlist/SKILL.md) — fetch a playlist result
- [stophy-suggest](../stophy-suggest/SKILL.md) — expand a query before searching
- [stophy-cli](../stophy-cli/SKILL.md) — setup, auth, credits, full command map
