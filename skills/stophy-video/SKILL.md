---
name: stophy-video
description: Use for YouTube, TikTok, Instagram and Twitch videos, like "get this video's transcript", "summarize this video", "what do the comments say", "find videos about", "what does this channel post".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy video

Setup, keys and errors: [stophy](../stophy/SKILL.md). Scrape the page a person would open, with the parser that reads it:

```bash
stophy scrape "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --parser youtube-transcript -o .stophy/transcript.json --json
stophy scrape "https://www.youtube.com/results?search_query=lofi+beats" --parser youtube-search
stophy scrape "https://www.tiktok.com/tag/booktok" --parser tiktok-hashtag
```

| Parser | Page |
|---|---|
| `youtube-search` (no key) | youtube.com/results?search_query=... |
| `youtube-video`, `youtube-transcript`, `youtube-comments` (no key) | a watch, youtu.be, shorts or live link |
| `youtube-channel` (no key) | youtube.com/@handle, with an optional tab |
| `youtube-playlist`, `youtube-post` | a playlist link, a community post link |
| `tiktok-video`, `tiktok-transcript`, `tiktok-comments` | a TikTok video page or share link |
| `tiktok-profile` (no key), `tiktok-followers`, `tiktok-following` | tiktok.com/@handle |
| `tiktok-search` | tiktok.com/search/user?q=..., or /search?q=... for videos |
| `tiktok-hashtag`, `tiktok-sound`, `tiktok-trending`, `tiktok-live` | tiktok.com/tag/..., /music/...-<id>, /explore, /@handle/live |
| `instagram-transcript` | an Instagram reel or video post |
| `twitch-profile`, `twitch-clips` | twitch.tv/<channel>, twitch.tv/<channel>/clips |

- Read the transcript first, then the comments for how people reacted. `--parserOptions '{"includeTimestamps":true}'` lets you cite the moment a line is said.
- For the replies to one comment, send `--parserOptions '{"comment":"<repliesCursor>"}'`.

**Done when:** you quote the lines or comments that answer the question, with the video's link.

## Price

$0.001 a call, except: `tiktok-trending` $0.001 per 10 videos, `twitch-clips` $0.001 per 10 clips, `tiktok-transcript` $0.004 plus $0.72 per hour of audio when the video has no captions (up to 3 minutes), and `instagram-transcript` $0.002 plus $0.24 per hour of audio (up to 5 minutes).
