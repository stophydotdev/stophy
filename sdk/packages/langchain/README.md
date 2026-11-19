# langchain-stophy

Search, read, and act on the web. These are Stophy tools for [LangChain](https://docs.langchain.com).

## Install

```bash
pip install langchain-stophy
```

## Example

```python
from langchain.agents import create_agent
from langchain_stophy import StophyReadPage, StophyWebSearch

agent = create_agent(
    "openai:gpt-5-mini",
    tools=[StophyWebSearch(), StophyReadPage()],
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "What changed in the latest Bun release?"}]}
)
print(result["messages"][-1].content)
```

The agent searches, picks a page, reads it and answers. To give an agent every tool below, get them from a `StophyToolkit`. Keep the toolkit open while its tools are in use.

```python
from langchain_stophy import StophyToolkit

with StophyToolkit() as toolkit:
    search = next(tool for tool in toolkit.get_tools() if tool.name == "stophy_web_search")
    print(search.invoke({"query": "bun runtime"}))
```

If you don't use a `with` block, call `toolkit.close()` after the last tool call. A toolkit reads `STOPHY_API_KEY` and `STOPHY_BASE_URL` when you create it. If either changes, close the old toolkit and create a new one.

## Tools

| Tool                  | What the model gets                                   | Price per call                               |
| --------------------- | ----------------------------------------------------- | -------------------------------------------- |
| `StophyWebSearch`     | Ranked pages with title, url and description          | $0.001 for each 10 results                   |
| `StophyReadPage`      | A page or PDF as markdown                             | $0.001, plus $0.0005 to $0.0025 per PDF page |
| `StophyRedditSearch`  | Reddit posts with score and comment count             | $0.001                                       |
| `StophyPlaceSearch`   | Google Maps places with rating, reviews and hours     | $0.001                                       |
| `StophyProductSearch` | Amazon products with price, rating and reviews        | $0.001                                       |
| `StophyJobSearch`     | Indeed jobs with company, location and salary         | $0.001                                       |
| `StophyHomeSearch`    | Zillow homes for sale or rent with price, beds, baths | $0.004                                       |

The five site tools read the site's search page with a Stophy parser and return its JSON. A page that cannot be read costs nothing.

## API key

Each tool reads `STOPHY_API_KEY` from the environment, or takes `api_key`. Without a key, web search, page reading, Reddit and Google Maps still work within free limits. The other tools send the model an error that says a key is needed. Get a key at [stophy.dev/signup](https://stophy.dev/signup).

## Errors and retries

When a call fails, the tool returns the API's message as an error `ToolMessage`, so the agent can read it and recover. The tools call the [`stophy`](https://pypi.org/project/stophy/) client, which retries network errors and errors the API marks retryable.

## Every other source

For YouTube, TikTok, LinkedIn, Booking and the other sites Stophy has parsers for, use `parsed` in the `stophy` SDK or the hosted MCP server at `https://api.stophy.dev/mcp`.

## Docs

- [Python guide](https://docs.stophy.dev/sdks/python) covers the client these tools call.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

## License

MIT
