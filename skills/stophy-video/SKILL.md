---
name: stophy-video
description: |
  Get videos, transcripts, comments, channels and playlists from YouTube, TikTok and Instagram. Use for "get this video's transcript", "summarize this video", "what are people saying in the comments", "find videos about", "what does this channel post", "what is trending on this hashtag". YouTube search, videos, transcripts, comments and channels, TikTok transcripts and TikTok profiles work without an API key. For social posts that aren't videos use stophy-social. For ad libraries use stophy-ads.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy video

Find videos and read what they say and what viewers say about them.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). The parsers marked "no key" work without a key, 50 calls a day, first page only. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no key needed: search YouTube, then read one video
stophy scrape "https://www.youtube.com/results?search_query=lofi+beats" --parser youtube-search
stophy scrape "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --parser youtube-transcript --json -o .stophy/transcript.json
stophy scrape "https://www.youtube.com/watch?v=dQw4w9WgXcQ" --parser youtube-comments
stophy scrape "https://www.youtube.com/@mkbhd" --parser youtube-channel

# a TikTok profile and one video's transcript
stophy scrape "https://www.tiktok.com/@khaby.lame" --parser tiktok-profile
stophy scrape "https://www.tiktok.com/@charlidamelio/video/7137423965982592302" --parser tiktok-transcript

# key needed: TikTok accounts and videos on a topic, an Instagram reel's transcript
stophy scrape "https://www.tiktok.com/search/user?q=street%20food" --parser tiktok-search
stophy scrape "https://www.tiktok.com/tag/booktok" --parser tiktok-hashtag
stophy scrape "https://www.instagram.com/reel/DfS8Xbng4MD/" --parser instagram-transcript
```

**Done when:** you quote the transcript lines or comments that answer the question, with the video's link.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `youtube-search` (no key) | youtube.com/results?search_query=... | type, duration, uploadDate, features, cursor |
| `youtube-video` (no key) | a watch, youtu.be, shorts or live link | |
| `youtube-transcript` (no key) | a watch, youtu.be, shorts or live link | language, includeTimestamps |
| `youtube-comments` (no key) | a watch, youtu.be, shorts or live link | comment, sort, cursor |
| `youtube-channel` (no key) | youtube.com/@handle, with an optional tab | tab, sort, cursor |
| `youtube-playlist` | youtube.com/playlist?list=... | cursor |
| `youtube-post` | a community post link, youtube.com/post/... | sort, cursor |
| `tiktok-video` | a video page or share link | |
| `tiktok-transcript` (no key) | a video page or share link | language, includeTimestamps |
| `tiktok-comments` | a video page or share link | comment, cursor |
| `tiktok-profile` (no key) | tiktok.com/@handle | view: videos, cursor |
| `tiktok-search` | tiktok.com/search/user?q=... | cursor |
| `tiktok-hashtag` | tiktok.com/tag/... | cursor |
| `tiktok-sound` | tiktok.com/music/...-<sound id> | cursor |
| `tiktok-followers`, `tiktok-following` | tiktok.com/@handle | cursor |
| `instagram-transcript` | an Instagram reel or video post | language, includeTimestamps |

## Tips

- Save a transcript with `-o` and read it from the file. Add `--parserOptions '{"includeTimestamps":true}'` to cite the moment a line is said.
- For the replies to one comment, send its id as `--parserOptions '{"comment":"<id>"}'`.
- TikTok shows video search only to signed-in accounts, so find TikTok videos on a topic with `tiktok-hashtag`.
- Every call here costs $0.002, except transcripts made from audio. A TikTok transcript costs $0.002 with captions, or $0.004 plus $0.002 per 10 seconds of audio without, up to 3 minutes. An Instagram transcript costs $0.002 plus $0.002 per 30 seconds of audio, up to 5 minutes.

## See also

- [stophy-social](../stophy-social/SKILL.md): posts, profiles and threads on Reddit, Instagram, LinkedIn, X and more
- [stophy-ads](../stophy-ads/SKILL.md): ads that run on TikTok and Meta
