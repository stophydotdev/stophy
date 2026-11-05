# Stophy for Python

Give your agents the live web from Python. Every method and result is typed.

## Install

```bash
pip install stophy
```

## Try it without a key

```python
from stophy import Stophy

stophy = Stophy()

page = stophy.scrape(url="https://example.com", formats=["markdown"])
print(page["data"]["markdown"])

results = stophy.search(query="bun runtime", limit=3)
print(results["data"]["web"])
```

`scrape`, `search`, `map` and `parse` work without a key, within a small free allowance. Every other method raises a `StophyError` with the code `apiKeyRequired`.

## Use an API key

Get a key at [stophy.dev/signup](https://stophy.dev/signup). Set it as `STOPHY_API_KEY`, or pass it in:

```python
stophy = Stophy(api_key="st_...")
```

Each method sends one call to the [Stophy API](https://api.stophy.dev/v1/endpoints) and returns its JSON as a dict. `scrape` returns `success` and `data`, and `map` returns `success` and `links`.

Arguments are keyword-only and snake_case.

For async code, use `AsyncStophy`. It has the same methods, and you `await` each call.

## Read a site with a parser

A parser reads a site's page and returns its data as JSON: Reddit posts, Google Maps places, Amazon products, YouTube videos and more. Send the parser's name and the page URL:

```python
places = stophy.parsed("google-maps", "https://www.google.com/maps/search/dentists+in+Ljubljana")
print(places["data"]["json"])
```

`parsed` calls `scrape` with the format `{"type": "json", "parser": ...}`. The parser name is typed as `ParserName`. `stophy.parsers()` returns each parser with the page it reads and what it returns.

Extra keyword arguments are the parser's options, such as the next page:

```python
next_page = stophy.parsed(
    "google-maps", "https://www.google.com/maps/search/dentists+in+Ljubljana", page=2
)
```

Paging needs an API key.

## Crawl a site

`crawl` answers at once with an id. Ask `crawl.status` for the pages:

```python
job = stophy.crawl(url="https://bun.com/docs", limit=20)
status = stophy.crawl.status(id=job["id"])
print(status["status"], status["completed"], status["total"], status.get("data"))
```

`status` is `scraping` until the crawl is `completed`. When the answer has a `cursor`, send it back with the same id to get the pages finished since. `stophy.crawl.cancel(id=...)` stops the crawl and keeps the pages already read. A crawl and its pages are kept for 24 hours.

`stophy.batch.scrape(urls=[...])` takes a list of URLs and works the same way, with `batch.scrape.status` and `batch.scrape.cancel`.

## Extract fields from pages

```python
job = stophy.extract(urls=["https://example.com"], prompt="What is this page for?")
result = stophy.extract.result(id=job["id"])
print(result["data"], result["confidence"])
```

`extract.result` raises a `StophyError` with the code `notFound` until the result is ready. Results are kept for 24 hours.

## Handle errors

```python
from stophy import StophyError

try:
    stophy.scrape(url="not a url")
except StophyError as error:
    print(error.code, str(error), error.retryable)
```

`StophyError` has `code`, `retryable`, `retry_after_seconds`, `status`, and `request_id`. The message is `str(error)`. It says what went wrong and what to do next.

The SDK retries network errors and the HTTP statuses 429, 500, 502, 503, and 504, and it waits as long as the API asks. If the API asks for a wait longer than 60 seconds, the SDK raises right away with `retry_after_seconds` set.

## Options

| Option        | Default                              | What it does                                |
| ------------- | ------------------------------------ | ------------------------------------------- |
| `api_key`     | `STOPHY_API_KEY`                     | Your API key                                |
| `base_url`    | `STOPHY_BASE_URL`, or the Stophy API | The server to call                          |
| `max_retries` | `2`                                  | Retries per request. `0` turns retries off. |
| `timeout`     | `70.0`                               | Time limit in seconds for each attempt      |

## Check your account

```python
limits = stophy.limits()
usage = stophy.usage()
logs = stophy.logs(days=7)
```

`limits` returns your balance and rate limit. `usage` returns your all-time usage. `logs` returns your recent calls. All three need an API key.

## License

MIT
