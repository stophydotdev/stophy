# crewai-stophy

Give your agents the live web. These are Stophy tools for [CrewAI](https://docs.crewai.com).

```bash
pip install crewai-stophy
```

```python
from crewai import Agent, Crew, Task
from crewai_stophy import StophyReadPageTool, StophyWebSearchTool

researcher = Agent(
    role="Researcher",
    goal="Answer with facts from the live web",
    backstory="You check every claim against a page you read.",
    tools=[StophyWebSearchTool(), StophyReadPageTool()],
)
task = Task(
    description="What changed in the latest Bun release?",
    expected_output="Three bullet points with links",
    agent=researcher,
)
print(Crew(agents=[researcher], tasks=[task]).kickoff())
```

Each tool reads `STOPHY_API_KEY` from the environment, or takes it as `StophyWebSearchTool(api_key="your-key")`. Without a key, web search, page reading, Reddit and Google Maps still work within free limits. The other tools raise an error that says a key is needed. Get a key at [stophy.dev](https://stophy.dev).

## Tools

| Tool                      | What the agent gets                                   | Price per call     |
| ------------------------- | ----------------------------------------------------- | ------------------ |
| `StophyWebSearchTool`     | Ranked pages with title, url and description          | $0.0015            |
| `StophyReadPageTool`      | A page or PDF as markdown                             | $0.0015 to $0.0075 |
| `StophyRedditSearchTool`  | Reddit posts with score and comment count             | $0.0015            |
| `StophyPlaceSearchTool`   | Google Maps places with rating, reviews and hours     | $0.0015            |
| `StophyProductSearchTool` | Amazon products with price, rating and reviews        | $0.0015            |
| `StophyJobSearchTool`     | Indeed jobs with company, location and salary         | $0.0015            |
| `StophyHomeSearchTool`    | Zillow homes for sale or rent with price, beds, baths | $0.003             |

`StophyWebSearchTool` costs $0.0015 per 10 results. `StophyReadPageTool` costs more on pages that are hard to load. A call that fails or finds nothing costs nothing. These prices are for top-ups under $100.

To give an agent every tool with one key: `tools=stophy_tools(api_key="your-key")`.

For YouTube, TikTok, LinkedIn, Booking and the other Stophy endpoints, use the [`stophy`](https://pypi.org/project/stophy/) SDK or the hosted MCP server at `https://api.stophy.dev/mcp`.
