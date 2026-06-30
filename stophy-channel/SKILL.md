---
name: stophy-channel
description: Inspect YouTube channel data with the Stophy CLI. Trigger when the user provides a channel URL or @handle and wants a creator's videos, Shorts, playlists, or about page — most popular or recent uploads, catalog, links, subscriber info, or creator research.
metadata:
  author: stophy
  version: "2.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-channel

Inspect a YouTube channel's videos, Shorts, playlists, or about page. Part of Stophy,
the YouTube context API for AI agents.

## Choose this skill when

- The user provides a channel URL or @handle.
- The user asks what a creator uploaded recently or what their most popular videos are.
- The user needs channel-level research: catalog, playlists, about page, links, positioning.

Use [stophy-search](../stophy-search/SKILL.md) when the user has only a topic, not a channel.

## Safety

- Always quote the channel argument: `--url "https://www.youtube.com/@handle"`.

## Commands

```bash
stophy channel --url "https://www.youtube.com/@t3dotgg"                          # latest videos
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular  # most popular
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab about              # description, links, subs
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab short              # Shorts
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab playlist           # playlists
stophy channel --url "https://www.youtube.com/@t3dotgg" --continuation-token <token>  # next page
```

## Options

| Option | Values | Use when |
|--------|--------|----------|
| `--url <url>` | Channel URL or @handle | Always required |
| `--tab <tab>` | video, short, playlist, about | Choose the channel section (default: video) |
| `--sortBy <sort>` | latest, popular, oldest | Sort videos; only applies to `--tab video` |
| `--continuation-token <token>` | string | Fetch the next page |
| `--json` | — | Pipe or parse raw JSON |

## Decision rules

- `--tab about` for descriptions, links, and channel-level facts.
- `--tab video --sortBy popular` for the creator's strongest historical content.
- `--tab video --sortBy latest` for recent uploads.
- `--tab playlist` before [stophy-playlist](../stophy-playlist/SKILL.md) when the user wants courses or series.
- Do not pass `--sortBy` with `short`, `playlist`, or `about`; it only applies to videos.

## Output guidance

- For channel research, summarize patterns instead of listing every item.
- Include video/playlist URLs for follow-up work.
- Preserve `continuationToken` when more results are available.

## Related skills

- [stophy-video](../stophy-video/SKILL.md) — metadata, transcript, comments for a video
- [stophy-playlist](../stophy-playlist/SKILL.md) — fetch a playlist found on a channel
- [stophy-search](../stophy-search/SKILL.md) — discover channels by topic
- [stophy-cli](../stophy-cli/SKILL.md) — setup, auth, credits, full command map
