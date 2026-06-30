# Stophy | YouTube context API for AI agents

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)

Agent skills for getting structured YouTube context search, query suggestions, video details, transcripts, comments, live chat, channels, and playlists as clean JSON. Uses [Stophy CLI](https://www.npmjs.com/package/@stophy/cli) under the hood.

## Included skills

| Skill | Use it for |
|-------|------------|
| `stophy-cli` | Setup, auth, credits, usage, and the full command map |
| `stophy-search` | Search YouTube by keyword with filters |
| `stophy-suggest` | Autocomplete / query suggestions for keyword research |
| `stophy-video` | One video: details, transcript, comments, replies, live chat |
| `stophy-channel` | Channel videos, Shorts, playlists, about page |
| `stophy-playlist` | All videos in a playlist with metadata |

## Install

```bash
npx skills add stophydotdev/skills
```

This installs the skills to your current project. For a global install add `-g`, but PromptScript only supports project-local installs.

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
stophy suggest --q "how to learn"
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy top
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"
```

## For agents

Use the narrowest skill for the task:

- Topic discovery → `stophy-search`
- Keyword/autocomplete research → `stophy-suggest`
- Anything about one video (metadata, transcript, comments, live chat) → `stophy-video`
- Creator/channel research → `stophy-channel`
- Playlist/course research → `stophy-playlist`
- Setup, auth, credits, or the command map → `stophy-cli`

Do not fabricate YouTube data. Run the command, inspect the output, then summarize.

## Registry

skills.sh manifest at `skills.sh.json`.

```json
[
  "stophy-cli",
  "stophy-search",
  "stophy-suggest",
  "stophy-video",
  "stophy-channel",
  "stophy-playlist"
]
```

## License

MIT
