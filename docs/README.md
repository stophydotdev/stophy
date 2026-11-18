# Stophy docs

Search, read, and act on the web. This folder is the source of [docs.stophy.dev](https://docs.stophy.dev), built with [Mintlify](https://mintlify.com).

## Run locally

```bash
npm i -g mint && mint dev
```

Open http://localhost:3000. Before you open a pull request, run `mint validate` and `mint broken-links`.

## The API reference

The API reference and the parser pages are generated from the live API, so don't edit them by hand. Four scripts in `scripts` build them, and you run each one with `bun scripts/<name>.ts` from this folder:

- `sync-openapi` downloads `https://api.stophy.dev/openapi.json` into `api-reference/openapi.json`.
- `record-responses` calls every endpoint live and saves `scripts/responses/<operationId>.json`. Each file holds the request that was sent and the trimmed response, and the endpoint page shows both. It needs `STOPHY_API_KEY` and spends a few cents. Pass operation ids to record only those, like `bun scripts/record-responses.ts crawl crawlStatus`.
- `gen-reference` writes `api-reference/endpoint/*.mdx` and the API Reference navigation in `docs.json`.
- `gen-parsers` writes `sources/*.mdx` from `GET /v1/parsers`.

To change the generated pages, edit `scripts/reference.config.json`: the reference groups and titles, the calls to make, the fields to mask, and which parsers go on which page. Then run the scripts again.

## Publishing

Mintlify deploys `main`. Open a pull request, and merging it publishes. [AGENTS.md](./AGENTS.md) explains the page layout and the writing rules.
