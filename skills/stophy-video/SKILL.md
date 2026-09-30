---
name: stophy-video
description: |
  Get YouTube and TikTok data: search videos and read transcripts, comments, channels, playlists, and profiles. Transcripts work for YouTube, TikTok, and Instagram videos. Use for "get the transcript of", "what are people saying in the comments", "find videos about", "latest uploads from this channel". YouTube search and transcripts work without an API key. For posts on Reddit, X, or Instagram use stophy-social. For TikTok ads use stophy-ads.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy video

Search and read videos, transcripts, comments, channels, and playlists on YouTube and TikTok.

**Prerequisite:** `stophy youtube search` and `stophy transcript` work without a key. Every other command needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find videos on a topic
stophy youtube search "rust tutorial" --limit 10 --json -o .stophy/search.json

# no login needed: read what a video says, from a YouTube, TikTok or Instagram link
stophy transcript "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -o .stophy/transcript.txt

# one video's title, channel, and views
stophy youtube video dQw4w9WgXcQ --json

# what viewers say
stophy youtube comments dQw4w9WgXcQ --sort top --limit 50 --json -o .stophy/comments.json

# a creator's recent uploads
stophy youtube channel @mkbhd --tab videos --limit 30 --json -o .stophy/channel.json

# the same on TikTok
stophy tiktok profile khaby.lame --json -o .stophy/tiktok-profile.json
stophy tiktok search "street food" --json
```

Run `stophy <source> --help` for every command. The sources here are `youtube`, `tiktok`, and `transcript`.

**Done when:** you quote the transcript, comment, or listing text that answers the question, with the video or channel URL.

## Tips

- `transcript` takes a YouTube, TikTok, or Instagram link, or a bare YouTube video ID. It costs 2 credits, or nothing without a key. Add `--includeTimestamps` for each line with its time. TikTok videos over 3 minutes are refused, and a refused call is free.
- `youtube video` and `youtube comments` accept a bare video ID (`dQw4w9WgXcQ`) or a full URL.
- Replies: each comment has a `repliesCursor`. Pass it as `--comment` to `youtube comments` or `tiktok comments` to get that comment's replies.
- A TikTok profile returns a page of its videos. Use `--cursor` for the next page.

## See also

- [stophy-social](../stophy-social/SKILL.md): posts on Reddit, X, Instagram, and other platforms
- [stophy-ads](../stophy-ads/SKILL.md): TikTok's ad library
