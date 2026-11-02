from __future__ import annotations

from typing import Callable, Optional, TypeVar

from langchain_core.tools import ArgsSchema, BaseTool, BaseToolkit, ToolException
from langchain_core.tools.base import ToolExceptionHandlerOutput
from pydantic import BaseModel, Field, SecretStr
from stophy import Stophy, StophyError
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

    api_key: Optional[SecretStr] = None
    handle_tool_error: bool | str | Callable[[ToolException], ToolExceptionHandlerOutput] | None = (
        True
    )

    def _call(self, endpoint: Callable[[Stophy], Response]) -> Response:
        key = self.api_key.get_secret_value() if self.api_key else None
        with Stophy(key) as stophy:
            try:
                return endpoint(stophy)
            except StophyError as error:
                raise ToolException(str(error)) from error


class WebSearchInput(BaseModel):
    query: str = Field(min_length=1, max_length=400, description="What to search for.")
    limit: Optional[int] = Field(default=None, ge=1, le=100, description="Most results to return.")
    time: Optional[WebSearchTime] = Field(
        default=None, description="Only pages from this period. Leave out for any time."
    )
    include_domains: Optional[list[str]] = Field(
        default=None, max_length=10, description="Only pages from these sites, such as reddit.com."
    )


class StophyWebSearch(StophyTool):
    """Search the web with Stophy."""

    name: str = "stophy_web_search"
    description: str = (
        "Search the web. Returns ranked pages with title, url and description. "
        "Use stophy_read_page to get the full text of one."
    )
    args_schema: Optional[ArgsSchema] = WebSearchInput

    def _run(
        self,
        query: str,
        limit: Optional[int] = None,
        time: Optional[WebSearchTime] = None,
        include_domains: Optional[list[str]] = None,
    ):
        return self._call(
            lambda stophy: stophy.web.search(
                query=query, limit=limit, time=time, include_domains=include_domains
            )
        )["data"]


class ReadPageInput(BaseModel):
    url: str = Field(description="The page to read, such as https://bun.com/docs.")


class StophyReadPage(StophyTool):
    """Read a web page or PDF as markdown with Stophy."""

    name: str = "stophy_read_page"
    description: str = "Read a web page or PDF and return its text as markdown."
    args_schema: Optional[ArgsSchema] = ReadPageInput

    def _run(self, url: str):
        return self._call(lambda stophy: stophy.web.scrape(url=url))["data"]


class RedditSearchInput(BaseModel):
    query: str = Field(min_length=1, description="Words to find.")
    subreddit: Optional[str] = Field(
        default=None, description="Only this subreddit, such as typescript."
    )
    sort: Optional[RedditSearchSort] = None
    time: Optional[RedditSearchTime] = None


class StophyRedditSearch(StophyTool):
    """Search Reddit posts with Stophy."""

    name: str = "stophy_reddit_search"
    description: str = (
        "Search Reddit posts to read what people say about a product, place or topic. "
        "Returns posts with title, url, score and comment count."
    )
    args_schema: Optional[ArgsSchema] = RedditSearchInput

    def _run(
        self,
        query: str,
        subreddit: Optional[str] = None,
        sort: Optional[RedditSearchSort] = None,
        time: Optional[RedditSearchTime] = None,
    ):
        return self._call(
            lambda stophy: stophy.reddit.search(
                query=query, subreddit=subreddit, sort=sort, time=time
            )
        )["data"]


class PlaceSearchInput(BaseModel):
    query: str = Field(min_length=1, description="What to find, such as coffee.")
    location: str = Field(min_length=1, description="Where, such as Austin, TX.")
    open_now: Optional[bool] = Field(default=None, description="Only places open right now.")


class StophyPlaceSearch(StophyTool):
    """Find places on Google Maps with Stophy."""

    name: str = "stophy_place_search"
    description: str = (
        "Find places on Google Maps, such as restaurants, shops or clinics near a location. "
        "Returns name, address, rating, review count and hours."
    )
    args_schema: Optional[ArgsSchema] = PlaceSearchInput

    def _run(self, query: str, location: str, open_now: Optional[bool] = None):
        return self._call(
            lambda stophy: stophy.google.maps.search(
                query=query, location=location, open_now=open_now
            )
        )["data"]


class ProductSearchInput(BaseModel):
    query: str = Field(min_length=1, description="What to buy, such as wireless earbuds.")
    max_price: Optional[float] = Field(
        default=None, gt=0, description="Highest price in the store's currency."
    )
    sort: Optional[AmazonSearchSort] = None


class StophyProductSearch(StophyTool):
    """Search Amazon products with Stophy."""

    name: str = "stophy_product_search"
    description: str = "Search Amazon products. Returns title, price, rating, review count and url."
    args_schema: Optional[ArgsSchema] = ProductSearchInput

    def _run(
        self,
        query: str,
        max_price: Optional[float] = None,
        sort: Optional[AmazonSearchSort] = None,
    ):
        return self._call(
            lambda stophy: stophy.amazon.search(query=query, max_price=max_price, sort=sort)
        )["data"]


class JobSearchInput(BaseModel):
    query: str = Field(min_length=1, description="Role or skill, such as data analyst.")
    location: Optional[str] = Field(default=None, description="City, region or postal code.")
    remote: Optional[IndeedSearchRemote] = None
    date_posted: Optional[IndeedSearchDatePosted] = None


class StophyJobSearch(StophyTool):
    """Search Indeed jobs with Stophy."""

    name: str = "stophy_job_search"
    description: str = (
        "Search job listings on Indeed. "
        "Returns title, company, location, salary when listed and url."
    )
    args_schema: Optional[ArgsSchema] = JobSearchInput

    def _run(
        self,
        query: str,
        location: Optional[str] = None,
        remote: Optional[IndeedSearchRemote] = None,
        date_posted: Optional[IndeedSearchDatePosted] = None,
    ):
        return self._call(
            lambda stophy: stophy.indeed.search(
                query=query, location=location, remote=remote, date_posted=date_posted
            )
        )["data"]


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


class StophyHomeSearch(StophyTool):
    """Search US homes on Zillow with Stophy."""

    name: str = "stophy_home_search"
    description: str = (
        "Search US homes for sale or rent on Zillow. "
        "Returns address, price, beds, baths, size and url."
    )
    args_schema: Optional[ArgsSchema] = HomeSearchInput

    def _run(
        self,
        location: str,
        status: Optional[ZillowSearchStatus] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_bedrooms: Optional[int] = None,
    ):
        return self._call(
            lambda stophy: stophy.zillow.search(
                location=location,
                status=status,
                min_price=min_price,
                max_price=max_price,
                min_bedrooms=min_bedrooms,
            )
        )["data"]


class StophyToolkit(BaseToolkit):
    """Every Stophy tool, sharing one API key."""

    api_key: Optional[SecretStr] = None

    def get_tools(self) -> list[BaseTool]:
        return [
            tool(api_key=self.api_key)
            for tool in (
                StophyWebSearch,
                StophyReadPage,
                StophyRedditSearch,
                StophyPlaceSearch,
                StophyProductSearch,
                StophyJobSearch,
                StophyHomeSearch,
            )
        ]
