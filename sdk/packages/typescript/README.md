# Stophy for TypeScript

Search, read, and act on the web. This is the typed Stophy client for TypeScript and JavaScript.

## Install

```bash
npm install stophy
```

## Example

```ts
import { Stophy } from "stophy";

const stophy = new Stophy();
const page = await stophy.scrape({ url: "https://example.com", formats: ["markdown"] });
console.log(page.data.markdown);
```

That call needs no key. Every method and result is typed, and each method sends one call to the [Stophy API](https://api.stophy.dev/v1/endpoints) and returns its JSON as is. `scrape` returns `{ success, data }`, and `map` returns `{ success, links }`.

## Pick a method

| Method                    | Use it to                                                                       |
| ------------------------- | ------------------------------------------------------------------------------- |
| `search`                  | Search the web, news, images, research papers or YouTube videos                 |
| `scrape`                  | Read one page as Markdown, HTML, links, a screenshot or JSON                    |
| `parsed`                  | Read a site's own data, such as Reddit posts or Google Maps places, as JSON     |
| `map`                     | List the pages on a site, to find the right one before you read it              |
| `parse`                   | Turn a PDF, Word, Excel or PowerPoint file, or a picture of text, into Markdown |
| `crawl`, `batch.scrape`   | Read a whole section of a site, or a list of URLs, in the background            |
| `extract`                 | Pull the fields you name from pages, each checked against the page              |
| `browser.task`            | Click through a public site in a cloud browser to search, filter or fill a form |
| `limits`, `usage`, `logs` | Read your balance, your all-time usage and your recent calls                    |

`limits` returns the balance in dollars as `balanceUsd`, with your rate limit. `scrape`, `search`, `map` and `parse` work without a key, within a small free allowance, and so do `parsers`, `endpoints` and `signup`. Every other method throws a `StophyError` with the code `apiKeyRequired`.

## Read a site with a parser

`parsed("google-maps", url)` calls `scrape` with the format `{ type: "json", parser }` and puts the result in `data.json`. The parser name is typed, so your editor lists every parser, and `await stophy.parsers()` returns each one with the page it reads and what it returns. The third argument sends the parser's options, such as `{ page: 2 }` for the next page. Paging needs an API key.

## Run a job in the background

`crawl`, `batch.scrape`, `extract` and `browser.task` answer at once with an `id`, which `browser.task` returns as `data.id` and the others return at the top level. Read the result with `crawl.status({ id })`, `batch.scrape.status({ id })`, `extract.result({ id })` or `browser.task.status({ id })`. `crawl` and `batch.scrape` also have `cancel({ id })`, which stops the job and keeps the pages already read.

A crawl `status` is `scraping` until it is `completed`. While pages are left to read, the answer has `next`, a link with a `cursor`. Send that cursor with the same id to get only the pages finished since. `extract.result` throws a `StophyError` with the code `notFound` until the result is ready. A job and its result are kept for 24 hours.

## API key

Get a key at [stophy.dev/signup](https://stophy.dev/signup). The client reads `STOPHY_API_KEY`, or you pass it in with `new Stophy({ apiKey: "st_..." })` or `new Stophy("st_...")`.

| Option       | Default                              | What it does                                                                                  |
| ------------ | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `apiKey`     | `STOPHY_API_KEY`                     | Your API key                                                                                  |
| `baseUrl`    | `STOPHY_BASE_URL`, or the Stophy API | The server to call                                                                            |
| `maxRetries` | `2`                                  | Retries per request. `0` turns retries off.                                                   |
| `timeoutMs`  | `70000`                              | Time limit for each attempt. A timed-out attempt is retried when the call carries an API key. |

Each method also takes `signal` to cancel the request, and `idempotencyKey` to choose the key of one `POST`.

## Errors and retries

A failed call throws a `StophyError`, which you import from `stophy`. It has `code`, `message`, `retryable`, `retryAfterSeconds`, `status`, `requestId` and `details`. The message says what went wrong and what to do next.

The client retries network errors, timeouts and every error the API marks `retryable`, and it waits as long as the API asks. If the API asks for a wait longer than 60 seconds, it throws right away with `retryAfterSeconds` set.

## Docs

- [TypeScript guide](https://docs.stophy.dev/sdks/typescript) covers the main methods with examples.
- [Quickstart](https://docs.stophy.dev/quickstart) makes a first request and reads the result.
- [Choose an API](https://docs.stophy.dev/introduction#choose-an-api) maps what you have to the call you need.
- [API reference](https://docs.stophy.dev/api-reference/introduction) lists every option of every call.
- [Errors](https://docs.stophy.dev/api-reference/errors) lists every error code, and [rate limits](https://docs.stophy.dev/production/rate-limits) explains the free allowance.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

## License

MIT
