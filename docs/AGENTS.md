# Stophy docs

Mintlify site for docs.stophy.dev. Pages are MDX with YAML frontmatter. Configuration lives in `docs.json`. Merging to `main` publishes.

Goal: short, exact, cheap to read. Same facts, fewer words. `bun scripts/tokens.ts` prints tokens per section; `--pages` prints one row per page. A change that grows a section needs a reason.

## Layout

Four tabs, in `docs.json`:

- Documentation: Get started, Web data (`scrape`, `map`, `crawl`, `search`, `extract`, `agent`, `parse`), Browser, Automation (`batches`, `monitors`, `webhooks`), Account and billing, Production. A product's overview is its group's root page. Merge a page into its overview before adding a new one.
- API Reference: `api-reference/{introduction,errors}` (hand-written) and `api-reference/endpoint/*` (generated), one page per operation in the live OpenAPI document.
- Recipes: `recipes/*`, one goal per page, numbered steps with code.
- Integrations: `integrations/llm-sdks`.

One home per fact. Link, never restate:

| Fact | Home |
| --- | --- |
| Signup and API keys | `get-credentials` |
| Prices | `account/pricing` |
| Rate limits, concurrency, daily caps | `production/rate-limits` |
| Error codes and fixes | `api-reference/errors` |
| Retries | `production/troubleshooting` |
| Timeouts | `production/timeouts` |
| Webhook payloads | `webhooks` |
| Zero data retention | `production/zero-data-retention` |

A dollar price appears only on the pricing page. The generated pages and descriptions carry none.

## Generated files

`bun scripts/sync-openapi.ts` refreshes `api-reference/openapi.json` from the live API. `bun scripts/record-responses.ts` (needs `STOPHY_API_KEY`) calls examples live and saves the request and the trimmed response in `scripts/responses/`; it opens sessions and creates monitors, so run only the operations you need and clean up. `bun scripts/gen-reference.ts` writes `api-reference/endpoint/*.mdx` and the API Reference navigation. `bun scripts/gen-parsers.ts` writes `scrape/prebuilt-parsers.mdx`, one page per parser category under `scrape/prebuilt-parsers/`, and their navigation and redirects, from the parser catalog in `/openapi.json`. Every operation belongs to one group and every parser to one category in `scripts/reference.config.json`; the scripts fail on one that is missing. Never hand-edit those files; edit the config or the script and regenerate.

A removed page gets a redirect in `docs.json`, so no old link 404s.

## Checks

`mint validate` and `mint broken-links` must pass. Load changed pages in `mint dev`.

## Writing

Follow `STYLE.md`: page anatomy, voice, examples and the truth rules.
