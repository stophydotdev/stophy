# Stophy — YouTube context API for AI agents

[![skills.sh](https://skills.sh/b/stophydotdev/skills)](https://skills.sh/stophydotdev/skills)

Stophy is a YouTube context API for AI agents. It returns clean, structured JSON for search, query suggestions, video details, transcripts, comments, replies, live chat, channels, and playlists. This repository is a curated set of agent skills that teach coding agents how to use [the Stophy CLI](https://www.npmjs.com/package/@stophy/cli).

<p align="center">
  <img src="assets/stophy-cli.gif" alt="Stophy CLI demo — install package, add skills, login, search" width="100%" />
</p>

## Install

```bash
npx skills add https://github.com/stophydotdev/skills --skill --all
```

Or pick specific skills:

```bash
npx skills add https://github.com/stophydotdev/skills --skill stophy-search --skill stophy-video
```

## Requirements

- Node.js ≥18
- `@stophy/cli` installed globally: `npm install -g @stophy/cli`
- An API key from [stophy.dev](https://stophy.dev/dashboard)

## Authentication

```bash
stophy login --browser           # opens browser
stophy login --api-key st_xxx    # paste a key directly
export STOPHY_API_KEY=st_xxx     # env var also works
```

**Safety:** treat the API key as a secret. Do not commit it, print it in agent output, or paste it into shared logs. The `STOPHY_API_KEY` value stays in your shell environment.

## Included skills

| Skill | Use it for |
|-------|------------|
| `stophy-cli` | Setup, auth, credits, usage, and the full command map |
| `stophy-search` | Search YouTube by keyword with filters |
| `stophy-suggest` | Autocomplete / query suggestions for keyword research |
| `stophy-video` | One video: details, transcript, comments, replies, live chat |
| `stophy-channel` | Channel videos, Shorts, playlists, about page |
| `stophy-playlist` | All videos in a playlist with metadata |

## Example commands

```bash
stophy search --q "AI coding agents" --type video --sortBy popularity --uploadDate week
stophy suggest --q "how to learn rust"
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4"
stophy video comments --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --sortBy top
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular
stophy playlist --url "https://www.youtube.com/playlist?list=PLxxxxxx"
```

## For agents

Pick the narrowest skill for the task. Don't fabricate YouTube data — run the command, inspect the output, then summarize.

| Task | Skill |
|------|-------|
| Topic discovery by keyword | `stophy-search` |
| Keyword or autocomplete research | `stophy-suggest` |
| Anything about one video (metadata, transcript, comments, replies, live chat) | `stophy-video` |
| Creator or channel research (catalog, playlists, about page) | `stophy-channel` |
| Playlist or course research | `stophy-playlist` |
| Setup, auth, credits, or the full command map | `stophy-cli` |

## Registry

`skills.sh` reads the skill list from `skills.sh.json`:

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

## Contributing

Layout, conventions, and workflow live in [`AGENTS.md`](./AGENTS.md). Domain vocabulary used across skills is in [`CONTEXT.md`](./CONTEXT.md). Decisions the maintainers have explicitly rejected (and why) live in [`.out-of-scope/`](./.out-of-scope). The Claude Code plugin index is in [`.claude-plugin/plugin.json`](./.claude-plugin/plugin.json).

Every change goes on a fresh branch off `main`. Commit messages follow Conventional Commits (`feat(scope): subject`, `fix(scope): subject`, `docs(scope): subject`, etc.). Push the branch and open a PR.

## License

MIT