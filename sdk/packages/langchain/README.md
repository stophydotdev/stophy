# langchain-stophy

Give your agents the live web. These are Stophy tools for [LangChain](https://docs.langchain.com).

```bash
pip install langchain-stophy
```

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

Each tool reads `STOPHY_API_KEY` from the environment. Without it, web search, page reading, Reddit and Google Maps still work within free limits. The other tools send the model an error that says a key is needed. Get a key at [stophy.dev](https://stophy.dev).

## Tools

| Tool                  | What the model gets                                   | Credits per call       |
| --------------------- | ----------------------------------------------------- | ---------------------- |
| `StophyWebSearch`     | Ranked pages with title, url and description          | 2 for each 10 results  |
| `StophyReadPage`      | A page or PDF as markdown                             | 1, plus 1 per PDF page |
| `StophyRedditSearch`  | Reddit posts with score and comment count             | 1                      |
| `StophyPlaceSearch`   | Google Maps places with rating, reviews and hours     | 1                      |
| `StophyProductSearch` | Amazon products with price, rating and reviews        | 1                      |
| `StophyJobSearch`     | Indeed jobs with company, location and salary         | 1                      |
| `StophyHomeSearch`    | Zillow homes for sale or rent with price, beds, baths | 2                      |

A credit is $0.002. The five site tools read the site's search page with a Stophy parser and return its JSON. A page that cannot be read costs nothing.

To give an agent every tool with one key:

```python
from langchain_stophy import StophyToolkit

tools = StophyToolkit(api_key="your-key").get_tools()
```

When a call fails, the tool returns the API's message as an error `ToolMessage`, so the agent can read it and recover.

For YouTube, TikTok, LinkedIn, Booking and the other sites Stophy has parsers for, use `parsed` in the [`stophy`](https://pypi.org/project/stophy/) SDK or the hosted MCP server at `https://api.stophy.dev/mcp`.
