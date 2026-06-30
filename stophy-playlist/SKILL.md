---
name: stophy-playlist
description: Fetch YouTube playlist videos and metadata with the Stophy CLI. Trigger when the user provides a playlist URL or asks what is in a playlist, course, series, collection, or queue, or wants to process multiple videos from a curated YouTube playlist.
metadata:
  author: stophy
  version: "2.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-playlist

Fetch videos and metadata from a YouTube playlist. Part of Stophy, the YouTube context
API for AI agents.

## Choose this skill when

- The user provides a YouTube playlist URL.
- The user asks what videos are in a course, series, collection, or playlist.
- The user wants a batch of video URLs before fetching transcripts, comments, or details.

Use [stophy-channel](../stophy-channel/SKILL.md) first if the user wants a channel's
playlists but has not given a playlist URL.

## Safety

- Always quote the URL: `--url "https://www.youtube.com/playlist?list=..."`.

## Commands

```bash
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx" --continuation-token <token>
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx" --json | jq -r '.data.items[].title'
```

## Options

| Option | Values | Use when |
|--------|--------|----------|
| `--url <url>` | YouTube playlist URL | Always required |
| `--continuation-token <token>` | string | Fetch the next page |
| `--json` | — | Pipe or parse raw JSON |

## Response shape

Playlist-level metadata plus video items. Typical fields:

- `title`, `description`, `videoCount`
- `items[]` — `title`, `url`, `duration`, `viewCount`, `publishedAt`

## Workflow patterns

- Summarize a course: fetch playlist → get transcripts for selected videos → summarize.
- Audit a playlist: fetch playlist → compare titles, dates, durations, and views.
- Continue beyond the first page: reuse `continuationToken`.

## Output guidance

- For long playlists, return a concise table or grouped summary, not every item.
- Include video URLs for follow-up transcript/comment/detail requests.
- Preserve `continuationToken` when more results are available.

## Related skills

- [stophy-video](../stophy-video/SKILL.md) — metadata, transcript, comments for playlist videos
- [stophy-channel](../stophy-channel/SKILL.md) — find playlists from a channel
- [stophy-search](../stophy-search/SKILL.md) — find playlists by keyword
- [stophy-cli](../stophy-cli/SKILL.md) — setup, auth, credits, full command map
