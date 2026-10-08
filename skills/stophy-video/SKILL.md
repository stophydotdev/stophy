---
name: stophy-video
description: |
  Get YouTube, TikTok and Instagram video data: search videos and read transcripts, comments, channels, playlists, profiles, hashtags, sounds and charts. Transcripts work for YouTube, TikTok, and Instagram videos. Use for "get the transcript of", "what are people saying in the comments", "find videos about", "latest uploads from this channel", "what is trending on YouTube". For posts on Reddit or Instagram use stophy-social. For TikTok ads use stophy-ads.
metadata:
  author: stophy
  version: "4.0.3"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy video

Search and read videos, transcripts, comments, channels, and playlists on YouTube, TikTok and Instagram.

**Prerequisite:** `youtube search`, `youtube video` and `youtube transcript` work without a key, within a free limit. Every other command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# find videos on a topic
stophy youtube search "rust tutorial" --json -o .stophy/search.json

# read what a video says
stophy youtube transcript "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -o .stophy/transcript.txt
stophy tiktok transcript "https://www.tiktok.com/@khaby.lame/video/7137423965982592302" --json
stophy instagram transcript "https://www.instagram.com/reel/DdG4RIxIPyf/" --json

# one video's title, channel, and views
stophy youtube video dQw4w9WgXcQ --json

# what viewers say
stophy youtube comments dQw4w9WgXcQ --sort top --json -o .stophy/comments.json

# a creator's recent uploads
stophy youtube channel @mkbhd --tab videos --json -o .stophy/channel.json

# videos for a hashtag, and the weekly charts
stophy youtube hashtag sourdough --json
stophy youtube charts --chart topSongs --country us --json

# the same on TikTok
stophy tiktok profile khaby.lame --json -o .stophy/tiktok-profile.json
stophy tiktok search "street food" --sort mostLiked --json
```

Run `stophy <source> --help` for every command. The sources here are `youtube`, `tiktok`, and `instagram`.

**Done when:** you quote the transcript, comment, or listing text that answers the question, with the video or channel URL.

## Tips

- To point at one video, give its link or its id, never both. `youtube video`, `youtube transcript` and `youtube comments` take a link or an id (`dQw4w9WgXcQ`). The options are `--videoUrl` and `--videoId`. Channels take `--channelUrl` or `--channelId`, and profiles take `--userUrl` or `--username`.
- A YouTube transcript costs 1 credit and comes from the video's captions. Add `--includeTimestamps` for each line with its time, and `--language` to pick one.
- `tiktok transcript` and `instagram transcript` cost 1 credit when the video has captions. Without captions, the audio is transcribed for 2 credits plus 1 credit per 10 seconds, and the result has `transcribedSeconds`. TikTok audio stops at 3 minutes and Instagram audio at 30 minutes (182 credits at most). A refused call is free.
- Every other command here costs 1 credit, except `youtube charts`, which costs 1 credit per 10 results. Send `--limit` to get fewer.
- Replies: for `youtube comments`, pass a comment's `repliesCursor` as `--comment`. For `tiktok comments` and `instagram comments`, pass a comment's `commentId` as `--comment`.
- A TikTok or Instagram profile returns its videos in `results`, a page at a time. When the output ends with a `cursor`, run the same command with `--cursor <cursor>` for the next page. YouTube search, comments, channels and playlists page the same way.
- A cursor comes from the site and can expire. Start again from the first page when it does.
- `youtube related` lists videos next to one video. `youtube post` reads a community post with its comments. `tiktok sound` lists videos that use a sound, by `--audioId`. `instagram profile reels` lists a profile's reels.

## See also

- [stophy-social](../stophy-social/SKILL.md): posts on Reddit, Instagram, and other platforms
- [stophy-shopping](../stophy-shopping/SKILL.md): TikTok Shop products and reviews
- [stophy-ads](../stophy-ads/SKILL.md): TikTok's ad library
