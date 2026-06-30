---
name: stophy-suggest
description: Get YouTube search autocomplete suggestions with the Stophy CLI. Trigger when the user wants query suggestions, autocomplete completions, "what do people search for" around a term, related search phrases, keyword/topic ideas, or wants to expand a seed query before searching.
metadata:
  author: stophy
  version: "1.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
---

# stophy-suggest

Get YouTube's autocomplete suggestions for a partial query — the same completions the
search box shows. Part of Stophy, the YouTube context API for AI agents.

## Choose this skill when

- The user wants autocomplete completions for a term.
- The user asks "what do people search for about X" or wants related search phrases.
- The user needs keyword/topic ideas, or wants to expand a seed query before running a
  full [stophy-search](../stophy-search/SKILL.md).

This returns *query strings*, not videos. To fetch results for a query, use
[stophy-search](../stophy-search/SKILL.md).

## Safety

- Always quote the query: `--q "your partial query"`. Never splice user text into the
  command outside that quoted argument.

## Commands

```bash
stophy suggest --q "how to learn"                       # autocomplete suggestions
stophy suggest --q "comment apprendre" --hl fr --gl FR  # localized (French / France)
stophy suggest --q "best laptop" --json | jq -r '.data.suggestions[]'
```

## Options

| Option | Values | Use when |
|--------|--------|----------|
| `--q <query>` | partial query (1–200 chars) | Always required |
| `--hl <lang>` | ISO 639-1 code, e.g. `en`, `fr`, `es` (default `en`) | Localize suggestion language |
| `--gl <region>` | ISO 3166-1 alpha-2 code, e.g. `US`, `GB`, `FR` (default `US`) | Localize suggestion region |
| `--json` | — | Pipe or parse raw JSON |

## Response shape

```
data:
  q            # the query you sent
  hl, gl       # resolved language/region
  suggestions  # array of suggested query strings, ranked
```

## Decision rules

- Use this for keyword research, content gap analysis, or to broaden a seed term, then
  feed promising suggestions into `stophy search`.
- Set `--hl`/`--gl` when the user cares about a specific language or market; otherwise the
  defaults (`en`/`US`) are fine.

## Output guidance

- Return the suggestions as a clean ranked list.
- When useful, group them or note which ones are worth searching next, then offer the
  exact `stophy search --q "..."` follow-up.

## Related skills

- [stophy-search](../stophy-search/SKILL.md) — run a full search for a chosen suggestion
- [stophy-video](../stophy-video/SKILL.md) — inspect a video from search results
- [stophy-channel](../stophy-channel/SKILL.md) — research a creator
- [stophy-cli](../stophy-cli/SKILL.md) — setup, auth, credits, full command map
