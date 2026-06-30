---
name: stophy-video
description: Get everything about a single YouTube video with the Stophy CLI — metadata, transcript/captions, comments and replies, and live-stream chat. Trigger when the user provides a video URL or ID and wants details (title, channel, views, likes, duration), the transcript or spoken text, what viewers are saying in comments, replies in a thread, or live chat messages and stream status.
metadata:
  author: stophy
  version: "2.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-video

Everything about one YouTube video, via `stophy video <type>`: **details**, **transcript**,
**comments**, **replies**, and **livechat**. Stophy is a YouTube context API for AI agents;
this skill covers the single-video surface.

## Choose this skill when

- The user gives a video URL or ID and wants metadata, transcript, comments, or live chat.
- The user asks "what is this video?", "get the transcript", "what are people saying?",
  or "show the live chat".

For topic discovery use [stophy-search](../stophy-search/SKILL.md); for a creator's whole
catalog use [stophy-channel](../stophy-channel/SKILL.md).

## Safety

- Always quote the URL: `--url "https://www.youtube.com/watch?v=..."`. YouTube URLs contain
  `&`/`?`; unquoted they get split by the shell. Never place user input outside a quoted flag.
- Do not fabricate transcripts, comments, or chat. Run the command and report what returns.

## Subcommands

### details — title, description, stats, channel, thumbnails

```bash
stophy video details --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
stophy video details --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --json | jq -r '.data.title'
```

Returns: `title`, `description`, `viewCount`, `likeCount`, `publishedAt`, `channel`, `thumbnails`.

### transcript — timestamped captions

```bash
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --json \
  | jq -r '.data.segments[].text'
```

Returns: `language`, `segments[]` with `text`, `start`, `duration`. If captions are
disabled, say so directly — do not invent a transcript. For long transcripts, summarize
or save the structured output instead of flooding the response.

### comments — threaded comments, sorted top or latest

```bash
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy top
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy latest
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --continuation-token <token>
```

Returns `comments[]` with `text`, `author`, `likeCount`, `publishedAt`, `repliesToken`.
Group by theme with representative quotes; frame findings as "comments surfaced by the
API", not "all viewers". Preserve `repliesToken` for thread drill-down.

### replies — replies to one comment thread

```bash
stophy video replies --continuation-token <repliesToken>
```

Pass the `repliesToken` from a comment to load its thread. No `--url` needed.

### livechat — live-stream chat + stream status

```bash
stophy video livechat --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"               # top chat (moderated, default)
stophy video livechat --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --chat-type live   # every message
stophy video livechat --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --continuation-token <token>
```

Returns: `status` (`live`, `upcoming`, `replay`, `chat_disabled`, `not_live`), `isLive`,
`concurrentViewers`, `pollIntervalMs`, `messages[]` (`text`, `author`, `isOwner`,
`isModerator`, `isVerified`, `superChatAmount`), and `continuationToken`.

- Only `status: "live"` returns messages and a token. For other states, report the stream
  state instead of expecting messages.
- To follow chat, repeat with the returned `continuationToken`, waiting `pollIntervalMs`
  between calls. Stop when the token is `null` (each call spends credits).
- An empty `messages` array on a live stream just means nothing new — keep polling.
- Highlight Super Chats and moderator/owner messages when summarizing.

## Options

| Option | Applies to | Values |
|--------|-----------|--------|
| `--url <url>` | details, transcript, comments, livechat | YouTube video URL (required) |
| `--sortBy <sort>` | comments | `top`, `latest` |
| `--chat-type <type>` | livechat | `top`, `live` (set on first call, kept after) |
| `--continuation-token <token>` | comments, replies, livechat | pagination/poll token |
| `--json` | all | raw JSON for piping/parsing |

## Output guidance

- For a human answer, summarize the important fields; preserve the video URL and channel.
- Suggest the next concrete command when a follow-up is likely (transcript → comments, etc.).

## Related skills

- [stophy-search](../stophy-search/SKILL.md) — find candidate videos first
- [stophy-channel](../stophy-channel/SKILL.md) — the creator's full channel
- [stophy-playlist](../stophy-playlist/SKILL.md) — collect videos from a playlist
- [stophy-cli](../stophy-cli/SKILL.md) — setup, auth, credits, full command map
