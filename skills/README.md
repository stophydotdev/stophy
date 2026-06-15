# YouTube Data for AI Agents

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)

Agent skills for getting YouTube transcripts, comments, search results, channels, and playlists as structured data. Uses [Stophy CLI](https://www.npmjs.com/package/@stophy/cli) under the hood.

## Included skills

| Skill | Use it for |
|-------|------------|
| `youtube-for-ai` | Setup, auth, credits, usage, and combined workflows |
| `youtube-search` | Search YouTube by keyword with filters |
| `youtube-video` | Video metadata: title, description, channel, views, likes |
| `youtube-transcript` | Full transcript with timestamps |
| `youtube-comments` | Comments and threaded replies, sorted top or latest |
| `youtube-livechat` | Livestream chat messages and stream status |
| `youtube-channel` | Channel videos, Shorts, playlists, about page |
| `youtube-playlist` | All videos in a playlist with metadata |

## Requirements

```bash
npm install -g @stophy/cli
stophy login
```

Or use an API key:

```bash
export STOPHY_API_KEY=***
```

## Example commands

```bash
stophy search --q "AI coding agents" --type video --sortBy popularity
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy top
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"
```

## For agents

Use the narrowest skill for the task:

- Topic discovery → `youtube-search`
- Video metadata → `youtube-video`
- Spoken content → `youtube-transcript`
- Viewer reactions → `youtube-comments`
- Livestream chat → `youtube-livechat`
- Creator/channel research → `youtube-channel`
- Playlist/course research → `youtube-playlist`
- Setup, auth, credits, or combined → `youtube-for-ai`

Do not fabricate YouTube data. Run the command, inspect the output, then summarize.

## Registry

skills.sh manifest at `skills.sh.json`.

```json
[
  "youtube-for-ai",
  "youtube-search",
  "youtube-video",
  "youtube-transcript",
  "youtube-comments",
  "youtube-livechat",
  "youtube-channel",
  "youtube-playlist"
]
```

## License

MIT
