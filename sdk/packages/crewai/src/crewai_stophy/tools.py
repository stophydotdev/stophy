import json
from typing import Callable, Optional, TypeVar

from crewai.tools import BaseTool, EnvVar
from pydantic import BaseModel, Field
from stophy import Stophy
from stophy.generated.models import (
    AmazonSearchSort,
    IndeedSearchDatePosted,
    IndeedSearchRemote,
    RedditSearchSort,
    RedditSearchTime,
    WebSearchTime,
    ZillowSearchStatus,
)

Response = TypeVar("Response")


class StophyTool(BaseTool):
    """Base for Stophy tools. Reads STOPHY_API_KEY when api_key is not set."""

    api_key: Optional[str] = Field(default=None, exclude=True)
    env_vars: list[EnvVar] = Field(
        default_factory=lambda: [
            EnvVar(
                name="STOPHY_API_KEY",
                description=(
                    "Stophy API key from stophy.dev. Web search, page reading, Reddit and "
                    "Google Maps work without one within free limits."
                ),
                required=False,
            )
        ]
    )

    def _call(self, endpoint: Callable[[Stophy], Response]) -> Response:
        with Stophy(self.api_key) as stophy:
            return endpoint(stophy)


class WebSearchInput(BaseModel):
    query: str = Field(min_length=1, max_length=400, description="What to search for.")
    limit: Optional[int] = Field(default=None, ge=1, le=100, description="Most results to return.")
    time: Optional[WebSearchTime] = Field(
        default=None, description="Only pages from this period. Leave out for any time."
    )
    include_domains: Optional[list[str]] = Field(
        default=None, max_length=10, description="Only pages from these sites, such as reddit.com."
    )


class StophyWebSearchTool(StophyTool):
    name: str = "Stophy web search"
    description: str = (
        "Search the web. Returns ranked pages with title, url and description as JSON. "
        "Use Stophy read page to get the full text of one."
    )
    args_schema: type[BaseModel] = WebSearchInput

    def _run(
        self,
        query: str,
        limit: Optional[int] = None,
        time: Optional[WebSearchTime] = None,
        include_domains: Optional[list[str]] = None,
    ) -> str:
        data = self._call(
            lambda stophy: stophy.web.search(
                query=query, limit=limit, time=time, include_domains=include_domains
            )["data"]
        )
        return json.dumps(data, ensure_ascii=False)


class ReadPageInput(BaseModel):
    url: str = Field(description="The page to read, such as https://bun.com/docs.")


class StophyReadPageTool(StophyTool):
    name: str = "Stophy read page"
    description: str = "Read a web page or PDF and return its text as markdown, as JSON."
    args_schema: type[BaseModel] = ReadPageInput

    def _run(self, url: str) -> str:
        data = self._call(lambda stophy: stophy.web.scrape(url=url)["data"])
        return json.dumps(data, ensure_ascii=False)


class RedditSearchInput(BaseModel):
    query: str = Field(min_length=1, description="Words to find.")
    subreddit: Optional[str] = Field(
        default=None, description="Only this subreddit, such as typescript."
    )
    sort: Optional[RedditSearchSort] = None
    time: Optional[RedditSearchTime] = None


class StophyRedditSearchTool(StophyTool):
    name: str = "Stophy Reddit search"
    description: str = (
        "Search Reddit posts to read what people say about a product, place or topic. "
        "Returns posts with title, url, score and comment count as JSON."
    )
    args_schema: type[BaseModel] = RedditSearchInput

    def _run(
        self,
        query: str,
        subreddit: Optional[str] = None,
        sort: Optional[RedditSearchSort] = None,
        time: Optional[RedditSearchTime] = None,
    ) -> str:
        data = self._call(
            lambda stophy: stophy.reddit.search(
                query=query, subreddit=subreddit, sort=sort, time=time
            )["data"]
        )
        return json.dumps(data, ensure_ascii=False)


class PlaceSearchInput(BaseModel):
    query: str = Field(min_length=1, description="What to find, such as coffee.")
    location: str = Field(min_length=1, description="Where, such as Austin, TX.")
    open_now: Optional[bool] = Field(default=None, description="Only places open right now.")


class StophyPlaceSearchTool(StophyTool):
    name: str = "Stophy place search"
    description: str = (
        "Find places on Google Maps, such as restaurants, shops or clinics near a location. "
        "Returns name, address, rating, review count and hours as JSON."
    )
    args_schema: type[BaseModel] = PlaceSearchInput

    def _run(self, query: str, location: str, open_now: Optional[bool] = None) -> str:
        data = self._call(
            lambda stophy: stophy.google.maps.search(
                query=query, location=location, open_now=open_now
            )["data"]
        )
        return json.dumps(data, ensure_ascii=False)


class ProductSearchInput(BaseModel):
    query: str = Field(min_length=1, description="What to buy, such as wireless earbuds.")
    max_price: Optional[float] = Field(
        default=None, gt=0, description="Highest price in the store's currency."
    )
    sort: Optional[AmazonSearchSort] = None


class StophyProductSearchTool(StophyTool):
    name: str = "Stophy product search"
    description: str = (
        "Search Amazon products. Returns title, price, rating, review count and url as JSON."
    )
    args_schema: type[BaseModel] = ProductSearchInput

    def _run(
        self,
        query: str,
        max_price: Optional[float] = None,
        sort: Optional[AmazonSearchSort] = None,
    ) -> str:
        data = self._call(
            lambda stophy: stophy.amazon.search(query=query, max_price=max_price, sort=sort)["data"]
        )
        return json.dumps(data, ensure_ascii=False)


class JobSearchInput(BaseModel):
    query: str = Field(min_length=1, description="Role or skill, such as data analyst.")
    location: Optional[str] = Field(default=None, description="City, region or postal code.")
    remote: Optional[IndeedSearchRemote] = None
    date_posted: Optional[IndeedSearchDatePosted] = None


class StophyJobSearchTool(StophyTool):
    name: str = "Stophy job search"
    description: str = (
        "Search job listings on Indeed. "
        "Returns title, company, location, salary when listed and url as JSON."
    )
    args_schema: type[BaseModel] = JobSearchInput

    def _run(
        self,
        query: str,
        location: Optional[str] = None,
        remote: Optional[IndeedSearchRemote] = None,
        date_posted: Optional[IndeedSearchDatePosted] = None,
    ) -> str:
        data = self._call(
            lambda stophy: stophy.indeed.search(
                query=query, location=location, remote=remote, date_posted=date_posted
            )["data"]
        )
        return json.dumps(data, ensure_ascii=False)


class HomeSearchInput(BaseModel):
    location: str = Field(
        min_length=1, description="City, ZIP code or neighborhood, such as Austin, TX."
    )
    status: Optional[ZillowSearchStatus] = None
    min_price: Optional[float] = Field(
        default=None, ge=0, description="Lowest price in US dollars."
    )
    max_price: Optional[float] = Field(
        default=None, ge=0, description="Highest price in US dollars."
    )
    min_bedrooms: Optional[int] = Field(default=None, ge=0)


class StophyHomeSearchTool(StophyTool):
    name: str = "Stophy home search"
    description: str = (
        "Search US homes for sale or rent on Zillow. "
        "Returns address, price, beds, baths, size and url as JSON."
    )
    args_schema: type[BaseModel] = HomeSearchInput

    def _run(
        self,
        location: str,
        status: Optional[ZillowSearchStatus] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_bedrooms: Optional[int] = None,
    ) -> str:
        data = self._call(
            lambda stophy: stophy.zillow.search(
                location=location,
                status=status,
                min_price=min_price,
                max_price=max_price,
                min_bedrooms=min_bedrooms,
            )["data"]
        )
        return json.dumps(data, ensure_ascii=False)


def stophy_tools(api_key: Optional[str] = None) -> list[BaseTool]:
    """Every Stophy tool, sharing one API key."""
    return [
        tool(api_key=api_key)
        for tool in (
            StophyWebSearchTool,
            StophyReadPageTool,
            StophyRedditSearchTool,
            StophyPlaceSearchTool,
            StophyProductSearchTool,
            StophyJobSearchTool,
            StophyHomeSearchTool,
        )
    ]
