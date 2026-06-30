# Stophy — domain vocabulary

Vocabulary used across skills in this repo. Use these terms consistently in skill descriptions, body text, and decision rules. When the right word below doesn't fit a sentence, prefer it over a longer paraphrase.

## Skill

A reusable capability installed by an agent via `npx skills add`. In this repo, every skill maps 1:1 to a CLI subcommand or a tightly grouped workflow on top of one. Skills are scoped to *what an agent does with the Stophy CLI*, not to general YouTube knowledge.

_Avoid_: plugin, extension, command (when referring to the skill itself — `command` is reserved for the CLI)

## Skill body

The Markdown content of `SKILL.md` below the frontmatter. Always follows the shape in `AGENTS.md`: Choose this skill when / Safety / Commands / Options / Decision rules / Output guidance / Related skills.

_Avoid_: instructions (the agent has instructions; skills are reusable patterns), prompt (a skill is loaded into context, not a one-shot prompt)

## Skill name

The `name:` field in `SKILL.md` frontmatter. Must match the parent directory name and use lowercase letters and hyphens only. Always prefixed `stophy-` in this repo.

_Avoid_: id, slug (the term *slug* is reserved for the path component on skills.sh, e.g. `stophy-channel`), display name

## Command

A Stophy CLI invocation, written as `stophy <subcommand> [flags]`. Top-level subcommands: `login`, `search`, `suggest`, `video`, `channel`, `playlist`, `credits`, `usage`, `logs`, `view-config`, `logout`. Some subcommands nest a resource (`stophy video details`, `stophy video transcript`, `stophy video comments`, `stophy video livechat`).

_Avoid_: function, method (this is a CLI, not an API)

## Channel

A YouTube creator's account, identified by `@handle`, channel URL, or channel ID. Stophy returns channel data in three tabs: `video`, `short`, `playlist`, `about`. A "channel page" or "creator page" in user speech is the same thing.

_Avoid_: user (a channel is not a user account), account

## Video

A single YouTube video, identified by URL, ID, or URL with start/end parameters. A "Short" is a video with `duration <= 60s` and a vertical aspect ratio; treat it as a sub-type of video, not a separate entity.

_Avoid_: clip, media

## Playlist

A YouTube playlist, identified by playlist URL or `list=...` query parameter. Order is author-defined and stable.

_Avoid_: queue (queue is a runtime concept, not a YouTube entity), collection

## Transcript

The spoken text of a video, segmented by start time and duration. Returned as `segments[]` with `text`, `start`, `duration`. Languages are ISO codes; default is the video's original audio.

_Avoid_: captions (captions can be auto-generated in any language by viewers; transcript is the canonical spoken text), subtitles

## Comments

Top-level viewer comments on a video, sorted by `top` (default) or `new`. Replies are nested under a comment and fetched separately via the comment's continuation token.

_Avoid_: replies (when referring to the top-level list — replies are children of comments), reviews (YouTube videos don't have reviews)

## Live chat

Real-time messages on a currently-airing livestream. Status is `live`, `upcoming`, or `ended`. Polling is required; Stophy returns a `pollIntervalMs` hint.

_Avoid_: chat (too generic — Discord, Twitch, etc. all use the word), IRC

## Credits / Usage / Logs

API account state. `credits` is the remaining balance; `usage` is recent consumption over a window; `logs` is the request log. All three are read-only and per-API-key.

_Avoid_: billing (Stophy is credit-based, not subscription billing), quota (Stophy does not enforce a request quota — credits are monetary)

## API key

A `st_xxx` token from the Stophy dashboard, set via `stophy login --api-key`, the `STOPHY_API_KEY` environment variable, or persisted in `~/.config/stophy/`. Treat as a secret. Never log, print, or commit.

_Avoid_: token (ambiguous — JWTs are also tokens), password

## relationships

- A **Skill** maps to one or more **Commands**.
- A **Video** has zero or one **Transcript** in any given language.
- A **Video** has many **Comments**; a **Comment** has many replies.
- A **Channel** owns many **Videos** and **Playlists**.
- A **Playlist** contains many **Videos** in a stable order.