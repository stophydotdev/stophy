---
name: stophy-video
description: |
  Get YouTube, TikTok, and Kick data: search videos and read transcripts, comments, channels, playlists, and past streams or clips. Use for "get the transcript of", "what are people saying in the comments", "find videos about", "latest uploads from this channel", "past streams from this creator". YouTube search and transcripts work without an API key. For posts on Reddit, X, or Instagram use stophy-social. For TikTok ads use stophy-ads.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy video

Search and read videos, transcripts, comments, channels, playlists, and streams on YouTube, TikTok, and Kick.

**Prerequisite:** `stophy youtube search` and `stophy youtube transcript` work without a key. Every other command needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no login needed: find videos on a topic
stophy youtube search "rust tutorial" --limit 10 -o .stophy/search.md

# no login needed: read what a video says
stophy youtube transcript dQw4w9WgXcQ -o .stophy/transcript.md

# what viewers say
stophy youtube comments dQw4w9WgXcQ --sort top --limit 50 -o .stophy/comments.md

# a creator's recent uploads
stophy youtube channel @mkbhd --tab videos --limit 30 -o .stophy/channel.md

# the same on TikTok
stophy tiktok posts khaby.lame --limit 30 -o .stophy/tiktok-posts.md

# a streamer's past broadcasts
stophy kick videos xqc --limit 25 -o .stophy/kick-videos.md
```

Run `stophy <source> --help` for every command. The sources here are `youtube`, `tiktok`, and `kick`.

**Done when:** you quote the transcript, comment, or listing text that answers the question, with the video or channel URL.

## Tips

- `video`, `transcript`, and `comments` accept a bare video ID (`dQw4w9WgXcQ`) or a full URL.
- Search first to get an ID. `youtube comments replies` and `tiktok comments replies` need a comment ID from the `comments` output.

## See also

- [stophy-social](../stophy-social/SKILL.md): posts on Reddit, X, Instagram, and other platforms
- [stophy-ads](../stophy-ads/SKILL.md): TikTok's ad library
