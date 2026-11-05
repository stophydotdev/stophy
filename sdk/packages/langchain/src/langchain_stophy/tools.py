from __future__ import annotations

from typing import Any, Callable, Literal, Optional, TypeVar
from urllib.parse import quote, urlencode

from langchain_core.tools import ArgsSchema, BaseTool, BaseToolkit, ToolException
from langchain_core.tools.base import ToolExceptionHandlerOutput
from pydantic import BaseModel, Field, SecretStr
from stophy import ParserName, Stophy, StophyError

Response = TypeVar("Response")

WebSearchTime = Literal["pastWeek", "pastMonth", "pastYear"]
RedditSearchSort = Literal["relevance", "hot", "top", "newest", "mostComments"]
RedditSearchTime = Literal["pastHour", "today", "pastWeek", "pastMonth", "pastYear", "allTime"]
AmazonSearchSort = Literal[
    "relevance", "priceLow", "priceHigh", "avgCustomerReview", "newest", "bestSelling"
]
IndeedSearchRemote = Literal["remote", "hybrid"]
IndeedSearchDatePosted = Literal["last24Hours", "last3Days", "last7Days", "last14Days"]
ZillowSearchStatus = Literal["forSale", "forRent", "sold"]

PERIODS: dict[str, str] = {"pastWeek": "qdr:w", "pastMonth": "qdr:m", "pastYear": "qdr:y"}
REDDIT_SORTS: dict[str, str] = {
    "relevance": "relevance",
    "hot": "hot",
    "top": "top",
    "newest": "new",
    "mostComments": "comments",
}
REDDIT_TIMES: dict[str, str] = {
    "pastHour": "hour",
    "today": "day",
    "pastWeek": "week",
    "pastMonth": "month",
    "pastYear": "year",
    "allTime": "all",
}
AMAZON_SORTS: dict[str, str] = {
    "priceLow": "price-asc-rank",
    "priceHigh": "price-desc-rank",
    "avgCustomerReview": "review-rank",
    "newest": "date-desc-rank",
    "bestSelling": "exact-aware-popularity-rank",
}


def _page(base: str, **params: Any) -> str:
    query = urlencode({key: value for key, value in params.items() if value is not None})
    return f"{base}?{query}" if query else base


def _defined(**values: Any) -> dict[str, Any]:
    return {key: value for key, value in values.items() if value is not None}


def _number(value: Optional[float]) -> Optional[str]:
    return None if value is None else f"{value:g}"


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

    def _parsed(self, parser: ParserName, url: str, **options: Any) -> Any:
        return self._call(lambda stophy: stophy.parsed(parser, url, **options))["data"].get("json")


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
            lambda stophy: stophy.search(
                query=query,
                limit=limit,
                tbs=None if time is None else PERIODS[time],
                include_domains=include_domains,
            )
        ).get("data")


class ReadPageInput(BaseModel):
    url: str = Field(description="The page to read, such as https://bun.com/docs.")


class StophyReadPage(StophyTool):
    """Read a web page or PDF as markdown with Stophy."""

    name: str = "stophy_read_page"
    description: str = "Read a web page or PDF and return its text as markdown."
    args_schema: Optional[ArgsSchema] = ReadPageInput

    def _run(self, url: str):
        return self._call(lambda stophy: stophy.scrape(url=url, formats=["markdown"]))["data"]


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
        url = _page(
            "https://www.reddit.com/search/",
            q=query,
            sort=None if sort is None else REDDIT_SORTS[sort],
            t=None if time is None else REDDIT_TIMES[time],
        )
        return self._parsed("reddit-search", url, **_defined(subreddit=subreddit))


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
        url = "https://www.google.com/maps/search/" + quote(f"{query} in {location}", safe="")
        return self._parsed("google-maps", url, **_defined(openNow=open_now))


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
        url = _page(
            "https://www.amazon.com/s",
            k=query,
            **{"high-price": _number(max_price)},
            s=None if sort is None else AMAZON_SORTS.get(sort),
        )
        return self._parsed("amazon-search", url)


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
        url = _page("https://www.indeed.com/jobs", q=query, l=location)
        return self._parsed("indeed-search", url, **_defined(remote=remote, datePosted=date_posted))


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
        url = "https://www.zillow.com/homes/" + quote(location.replace(" ", "-"), safe="") + "_rb/"
        return self._parsed(
            "zillow-search",
            url,
            **_defined(
                status=status, minPrice=min_price, maxPrice=max_price, minBedrooms=min_bedrooms
            ),
        )


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
