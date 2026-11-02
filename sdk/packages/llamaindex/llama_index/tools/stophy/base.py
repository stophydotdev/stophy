from typing import Optional

from llama_index.core.tools.tool_spec.base import BaseToolSpec

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


class StophyToolSpec(BaseToolSpec):
    """Stophy tools for LlamaIndex agents. Reads STOPHY_API_KEY when api_key is not set."""

    spec_functions = [
        "web_search",
        "read_page",
        "reddit_search",
        "place_search",
        "product_search",
        "job_search",
        "home_search",
    ]

    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key

    def _client(self) -> Stophy:
        return Stophy(self.api_key)

    def web_search(
        self,
        query: str,
        limit: Optional[int] = None,
        time: Optional[WebSearchTime] = None,
        include_domains: Optional[list[str]] = None,
    ):
        """Search the web. Returns ranked pages with title, url and description.

        Use read_page to get the full text of one.

        Args:
            query: What to search for.
            limit: Most results to return, 1 to 100.
            time: Only pages from this period: pastWeek, pastMonth or pastYear.
            include_domains: Only pages from these sites, such as reddit.com.
        """
        with self._client() as stophy:
            return stophy.web.search(
                query=query, limit=limit, time=time, include_domains=include_domains
            )["data"]

    def read_page(self, url: str):
        """Read a web page or PDF and return its text as markdown.

        Args:
            url: The page to read, such as https://bun.com/docs.
        """
        with self._client() as stophy:
            return stophy.web.scrape(url=url)["data"]

    def reddit_search(
        self,
        query: str,
        subreddit: Optional[str] = None,
        sort: Optional[RedditSearchSort] = None,
        time: Optional[RedditSearchTime] = None,
    ):
        """Search Reddit posts to read what people say about a product, place or topic.

        Returns posts with title, url, score and comment count.

        Args:
            query: Words to find.
            subreddit: Only this subreddit, such as typescript.
            sort: relevance, hot, top, newest or mostComments.
            time: pastHour, today, pastWeek, pastMonth, pastYear or allTime.
        """
        with self._client() as stophy:
            return stophy.reddit.search(query=query, subreddit=subreddit, sort=sort, time=time)[
                "data"
            ]

    def place_search(self, query: str, location: str, open_now: Optional[bool] = None):
        """Find places on Google Maps, such as restaurants, shops or clinics near a location.

        Returns name, address, rating, review count and hours.

        Args:
            query: What to find, such as coffee.
            location: Where, such as Austin, TX.
            open_now: Only places open right now.
        """
        with self._client() as stophy:
            return stophy.google.maps.search(query=query, location=location, open_now=open_now)[
                "data"
            ]

    def product_search(
        self,
        query: str,
        max_price: Optional[float] = None,
        sort: Optional[AmazonSearchSort] = None,
    ):
        """Search Amazon products. Returns title, price, rating, review count and url.

        Args:
            query: What to buy, such as wireless earbuds.
            max_price: Highest price in the store's currency.
            sort: relevance, priceLow, priceHigh, avgCustomerReview, newest or bestSelling.
        """
        with self._client() as stophy:
            return stophy.amazon.search(query=query, max_price=max_price, sort=sort)["data"]

    def job_search(
        self,
        query: str,
        location: Optional[str] = None,
        remote: Optional[IndeedSearchRemote] = None,
        date_posted: Optional[IndeedSearchDatePosted] = None,
    ):
        """Search job listings on Indeed.

        Returns title, company, location, salary when listed and url.

        Args:
            query: Role or skill, such as data analyst.
            location: City, region or postal code.
            remote: remote or hybrid.
            date_posted: last24Hours, last3Days, last7Days or last14Days.
        """
        with self._client() as stophy:
            return stophy.indeed.search(
                query=query, location=location, remote=remote, date_posted=date_posted
            )["data"]

    def home_search(
        self,
        location: str,
        status: Optional[ZillowSearchStatus] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        min_bedrooms: Optional[int] = None,
    ):
        """Search US homes for sale or rent on Zillow.

        Returns address, price, beds, baths, size and url.

        Args:
            location: City, ZIP code or neighborhood, such as Austin, TX.
            status: forSale, forRent or sold.
            min_price: Lowest price in US dollars.
            max_price: Highest price in US dollars.
            min_bedrooms: Fewest bedrooms.
        """
        with self._client() as stophy:
            return stophy.zillow.search(
                location=location,
                status=status,
                min_price=min_price,
                max_price=max_price,
                min_bedrooms=min_bedrooms,
            )["data"]
