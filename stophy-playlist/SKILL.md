---
name: stophy-playlist
description: Fetch YouTube playlist videos and metadata with Stophy CLI. Trigger when the user provides a playlist URL or asks what is in a playlist, course, series, collection, queue, or wants to process multiple videos from a curated YouTube playlist.
metadata:
  author: stophy
  version: "1.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx stophy *)
---

# stophy-playlist

Fetch videos and metadata from a YouTube playlist.

## Choose this skill when

- The user provides a YouTube playlist URL.
- The user asks what videos are in a course, series, collection, or playlist.
- The user wants a batch of video URLs before fetching transcripts, comments, or details.

Use `stophy-channel` first if the user asks for a channel’s playlists but has not provided a playlist URL.

## Commands

```bash
# Fetch playlist videos
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"

# Paginate
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx" --continuation-token <token>

# Print video titles as text
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx" --json   | jq '.data.items[].title' -r
```

## Options

| Option | Values | Use when |
|--------|--------|----------|
| `--url <url>` | YouTube playlist URL | Always required |
| `--continuation-token <token>` | string | Fetch the next page |
| `--json` | — | Pipe or parse raw JSON |

## Response shape

The playlist response includes playlist-level metadata and video items. Typical fields include:

- `title`
- `description`
- `videoCount`
- `items[]`
  - `title`
  - `url`
  - `duration`
  - `viewCount`
  - `publishedAt`

## Workflow patterns

- To summarize a course: fetch playlist → get transcripts for selected videos → summarize.
- To audit a playlist: fetch playlist → compare titles, dates, durations, and views.
- To continue beyond the first page: reuse `continuationToken`.

## Output guidance

- For long playlists, return a concise table or grouped summary rather than every item.
- Include video URLs for follow-up transcript/comment/detail requests.
- Preserve `continuationToken` when more results are available.

## Related skills

- [stophy-video](../stophy-video/SKILL.md) — get metadata for playlist videos
- [stophy-transcript](../stophy-transcript/SKILL.md) — get transcripts for playlist videos
- [stophy-comments](../stophy-comments/SKILL.md) — read comments for playlist videos
- [stophy-channel](../stophy-channel/SKILL.md) — find playlists from a channel
- [stophy-search](../stophy-search/SKILL.md) — find playlist results by keyword
