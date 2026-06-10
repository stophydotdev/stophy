# Stophy Skills — YouTube Data for AI Agents

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)

Agent skills for working with YouTube through the Stophy CLI.

These skills help agents search YouTube, get transcripts, read comments, inspect channels, fetch playlists, and return structured data from terminal commands.

## What is included

| Skill | Use it for |
|-------|------------|
| `stophy-cli` | General Stophy CLI setup, authentication, credits, usage, logs, and multi-step workflows. |
| `stophy-search` | Searching YouTube by keyword and filtering by type, date, duration, or sort order. |
| `stophy-video` | Getting metadata for a single YouTube video, including title, description, channel, views, likes, publish date, and thumbnails. |
| `stophy-transcript` | Getting transcript text, timestamps, captions, and spoken content from a YouTube video. |
| `stophy-comments` | Reading top/latest comments, replies, audience reactions, objections, and viewer language. |
| `stophy-channel` | Inspecting a channel's videos, Shorts, playlists, about page, catalog, and creator profile. |
| `stophy-playlist` | Fetching videos and metadata from a YouTube playlist, course, series, or collection. |

## Requirements

Install the Stophy CLI:

```bash
npm install -g @stophy/cli
```

Authenticate once:

```bash
stophy login
```

Or use an API key through the environment:

```bash
export STOPHY_API_KEY="st_xxx"
```

## Example commands

Search YouTube:

```bash
stophy search --q "AI coding agents" --type video --sortBy popularity
```

Get a transcript:

```bash
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
```

Read comments:

```bash
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy top
```

Inspect a channel:

```bash
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular
```

Fetch playlist videos:

```bash
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"
```

## For agents

Use the narrowest skill that matches the task:

- Topic discovery → `stophy-search`
- Video metadata → `stophy-video`
- Spoken content → `stophy-transcript`
- Viewer reactions → `stophy-comments`
- Creator/channel research → `stophy-channel`
- Playlist/course research → `stophy-playlist`
- Setup, auth, credits, or combined workflows → `stophy-cli`

Do not fabricate YouTube data. Run the Stophy CLI command, inspect the real output, then summarize the result. If a transcript is unavailable or an API call fails, report that directly and suggest the next concrete command.

## Registry

The `skills.sh.json` file groups these skills under YouTube for skills.sh-style discovery.

Current registry skills:

```json
[
  "stophy-cli",
  "stophy-search",
  "stophy-video",
  "stophy-transcript",
  "stophy-comments",
  "stophy-channel",
  "stophy-playlist"
]
```

## License

MIT
