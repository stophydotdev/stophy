# Stophy docs style

How to write a page on docs.stophy.dev. It follows what the best web data API docs do well, applied to Stophy's facts. `AGENTS.md` has the layout, the home of each fact and the checks.

Developers read these pages, and so do their coding agents, which load the `.md` version of every page. Each word costs an agent tokens, so say a thing once, exactly, where the reader needs it.

## Truth

- A number comes from code on `main` or a live response: prices from `stophy endpoints`, limits from the API code or a response header. If you can't check it, link the page that states it.
- An example is a call you ran with the signed-in CLI or SDK. Paste only output you got, cut to the fields the text names.
- Write what a feature does today. Nothing planned, nothing it almost does.
- Keyed first. The path is: sign up, create a key, set `STOPHY_API_KEY`. Calls without a key get one sentence after the keyed path, only where they matter.

## Page anatomy

Keep this order. Drop a part a page doesn't need.

1. **Title**: the product or the task, in a word or two: "Scrape", "Get credentials".
2. **Description** (frontmatter): what the reader gets, 120 to 160 characters, no price.
3. **Opener**: one sentence on what it does for the reader.
4. **First request**, in the first screen.
5. **Defaults and limits**, one or two sentences under the request: the default, the maximum, the field that changes it. "You get 10 results. Set `limit` up to 100."
6. **Response**: one sample, then where the answer is: "The text is in `data.markdown`."
7. **Choices**: one table per decision the reader makes.
8. **Errors** this call is known for, each with its fix. Link [Errors](/api-reference/errors) for the rest.
9. **Next**: two to four links.

A quickstart is numbered steps: get a key, install, make a request, next. A feature page skips the opener's request when a fragment shows the field.

## Voice

- Second person, present tense, imperative: "Send", "Set", "Read".
- One idea per sentence. Lead with the goal: "To read a site's own data, use a parser."
- Name the exact thing: the field in code, the number with its unit, the error code.
- Say the trap and the fix: "A body with `urls` returns `400 invalidRequest`. Read many pages with Batches."
- No marketing words (fast, powerful, seamless, robust, easy, simply, various, many) and no "about", "around" or "up to" without the number. Replace them with the fact or cut them.
- No "we", history, roadmap, or how Stophy gets its data. Name no other company's product.
- The word credits appears only in field names such as `creditsUsed`.
- No em dashes, en dashes or dash-like hyphens. Straight quotes.
- Headings in sentence case, named for the task: "Read a page again", not "Retrieval". One h1 (the title), no skipped levels.

## Examples

- Overview pages and quickstarts: one `<CodeGroup>` with `bash cURL`, `typescript TypeScript` and `python Python`, in that order, using only methods the published SDK has. Feature pages: cURL, and only when the shape isn't obvious.
- Every tab sends the same request with the same values, to a URL that answers today.
- cURL sends `-H "Authorization: Bearer $STOPHY_API_KEY"`. The SDK's `new Stophy()` reads `STOPHY_API_KEY`. Print the one field the text names.
- 5 to 15 lines per tab. No comments in code: the sentence above says what it does.
- One request and one response per page. Shorten long strings with `…` and drop fields the text doesn't use. Never add a field the API didn't send.
- Show other options as fragments, not second requests: `"onlyMainContent": true`.

## Tables

- A table when the reader picks one row, a list for steps or a set of facts.
- The first column is what the reader has or sends, the last is what to do or where to go: `You have | Use`, `Field | Default | What it does`, `Code | Cause | Fix`.

## For agents

- Every page is Markdown at its URL plus `.md`. `/llms.txt` lists the pages and `/llms-full.txt` holds all of them.
- The footer menu "For AI agents" has six links, in this order: Get credentials, Agent onboarding (SKILL.md), Agent auth (auth.md), Agent docs (llms.txt), Full docs (llms-full.txt), MCP server. Each one must stay a page worth reading.
- Write steps an agent can run alone, and name the one that needs a person: "Give your person the `claimUrl`."

## Frontmatter

`title`, `description`, and `sidebarTitle` when the sidebar label is shorter than the title. Mintlify derives `og:title` and `og:description`, so don't write them.
