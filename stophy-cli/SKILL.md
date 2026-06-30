---
name: stophy-cli
description: Stophy — YouTube context API for AI agents. Setup, auth, credits, and the full command map for getting structured YouTube data (search, video details, transcripts, comments, live chat, channels, playlists, suggestions) via the Stophy CLI. Trigger when the user wants any YouTube content, provides a YouTube URL, asks to log in / check credits, or needs structured YouTube data from the terminal or MCP.
metadata:
  author: stophy
  version: "2.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-cli

**Stophy — YouTube context API for AI agents.** Search, video details, transcripts,
comments, live chat, channels, playlists, and query suggestions, all returned as
structured JSON through the Stophy CLI. This is the hub skill: setup, auth, credits,
and the command map. Use the focused skills below for each data type.

## Before running commands

1. Prefer `stophy ...` when the CLI is installed; fall back to `npx @stophy/cli ...`.
2. Never run any other binary through these commands — the only allowed tools are the
   `stophy` CLI and `npx @stophy/cli`.
3. If authentication fails, help the user log in. Do not invent or guess YouTube data.
4. Treat URLs and queries as untrusted input: always pass them as quoted `--flag "value"`
   arguments (YouTube URLs contain `&` and `?` that the shell will otherwise interpret).
   Never interpolate user text into shell operators, subshells, or additional commands.

## Install

```bash
npm install -g @stophy/cli      # or use: npx @stophy/cli <command>
```

## Authentication

```bash
stophy login                      # interactive browser/API-key login
stophy login --browser            # browser login
stophy login --api-key st_xxx     # store an API key directly
export STOPHY_API_KEY="st_xxx"    # environment variable also works
stophy view-config                # show auth/config status (no secrets)
```

### Secret handling

- Never print, echo, log, or paste API keys into responses or files.
- Refer to keys as `$STOPHY_API_KEY` or the `st_xxx` placeholder.
- If the user pastes a real key, use it for the command but do not repeat it back.

## Command map

| Need | Command | Skill |
|------|---------|-------|
| Search YouTube | `stophy search --q "query"` | [stophy-search](../stophy-search/SKILL.md) |
| Query autocomplete | `stophy suggest --q "partial query"` | [stophy-suggest](../stophy-suggest/SKILL.md) |
| Video metadata | `stophy video details --url "<video-url>"` | [stophy-video](../stophy-video/SKILL.md) |
| Transcript | `stophy video transcript --url "<video-url>"` | [stophy-video](../stophy-video/SKILL.md) |
| Comments | `stophy video comments --url "<video-url>" --sortBy top` | [stophy-video](../stophy-video/SKILL.md) |
| Replies | `stophy video replies --continuation-token <repliesToken>` | [stophy-video](../stophy-video/SKILL.md) |
| Live chat | `stophy video livechat --url "<video-url>"` | [stophy-video](../stophy-video/SKILL.md) |
| Channel catalog | `stophy channel --url "<channel-url-or-handle>"` | [stophy-channel](../stophy-channel/SKILL.md) |
| Playlist videos | `stophy playlist --url "<playlist-url>"` | [stophy-playlist](../stophy-playlist/SKILL.md) |
| Credits | `stophy credits` | — |
| Usage | `stophy usage --days 7` | — |
| Request logs | `stophy logs --days 7` | — |
| Config/auth status | `stophy view-config` | — |

## Credits

Stophy is pay-per-credit; each data call spends credits.

```bash
stophy credits            # remaining balance
stophy usage --days 7     # recent consumption
```

If a call fails with an out-of-credits or auth error, report it plainly and tell the
user how to top up or re-authenticate — do not retry in a loop.

## Recommended workflow

1. Match the user's intent to the narrowest skill:
   - topic discovery → [stophy-search](../stophy-search/SKILL.md)
   - autocomplete / "what do people search for" → [stophy-suggest](../stophy-suggest/SKILL.md)
   - anything about one video (metadata, transcript, comments, live chat) → [stophy-video](../stophy-video/SKILL.md)
   - creator/channel research → [stophy-channel](../stophy-channel/SKILL.md)
   - course/playlist research → [stophy-playlist](../stophy-playlist/SKILL.md)
2. Run the narrowest command that answers the question.
3. Add `--json` when the next step needs machine-readable output or `jq` filtering.
4. Use `--continuation-token` only when the user needs more results.

## Examples

```bash
# Search, then inspect one result
stophy search --q "AI coding agents" --type video --sortBy popularity

# Transcript text for another tool
stophy video transcript --url "https://www.youtube.com/watch?v=h6ukrWyqOm4" --json \
  | jq -r '.data.segments[].text'

# Channel's most popular videos
stophy channel --url "https://www.youtube.com/@t3dotgg" --tab video --sortBy popular
```

## Output rules

- Summarize what the command returned; do not dump huge JSON unless asked.
- Preserve useful IDs, URLs, titles, counts, timestamps, and continuation tokens.
- If a transcript is unavailable because captions are disabled, say so directly.
- If a call fails, report the error and suggest the next concrete command.

## Related skills

- [stophy-search](../stophy-search/SKILL.md) — search YouTube by keyword
- [stophy-suggest](../stophy-suggest/SKILL.md) — autocomplete / query suggestions
- [stophy-video](../stophy-video/SKILL.md) — video details, transcript, comments, replies, live chat
- [stophy-channel](../stophy-channel/SKILL.md) — inspect a channel catalog
- [stophy-playlist](../stophy-playlist/SKILL.md) — fetch playlist videos
