# Stophy docs

Mintlify site for docs.stophy.dev. Pages are MDX with YAML frontmatter. Configuration lives in `docs.json`. Merging to `main` publishes.

## Layout

- Documentation tab: `introduction`, `quickstart`, `mcp-server` (overview) with `mcp-server/{keyless,oauth}`, `ai-onboarding`, `billing`, `rate-limits`, the parser pages `sources/*`, `guides/*`.
- API Reference tab: `api-reference/{introduction,errors}` (hand-written) and `api-reference/endpoint/*` (generated), one page per operation in the live OpenAPI document, in the groups `scripts/reference.config.json` names.
- Build with AI tab: `ai-onboarding`, the MCP pages, `quickstarts/{claude-code,claude-desktop,cursor,codex}`, `developer-guides/llm-sdks/*`.
- SDKs tab: `sdks/{overview,typescript,python,cli}`.

## Generated files

`bun scripts/sync-openapi.ts` refreshes `api-reference/openapi.json` from the live API. `bun scripts/record-responses.ts` (needs `STOPHY_API_KEY`) makes every example call live and saves the request and the trimmed response in `scripts/responses/`. `bun scripts/gen-reference.ts` writes `api-reference/endpoint/*.mdx` and the API Reference navigation in `docs.json`. `bun scripts/gen-parsers.ts` writes one page per parser category, `sources/*.mdx`, from `GET /v1/parsers`. Every operation belongs to one group and every parser to one page in `scripts/reference.config.json`; the scripts fail on one that is missing. Never hand-edit those files; edit the config and regenerate.

A removed page gets a redirect in `docs.json`, so no old link 404s.

## Checks

`mint validate` and `mint broken-links` must pass. Load changed pages in `mint dev`.

## Writing

- Plain words, short sentences, second person. Say what the reader gets.
- Every fact must match the live API (`/v1/endpoints`, `/openapi.json`) or the server code. Every example request must be a real call; free endpoints are free to call.
- Don't describe how Stophy gets its data or what runs it.
- Examples use cURL, Node.js `fetch` and Python `requests`.
- Every page has `title`, a 120 to 160 character `description`, `og:title` as `<Title> | Stophy` and `og:description`. Use `sidebarTitle` when the title is longer than the sidebar label.
- Sentence case for headings.
