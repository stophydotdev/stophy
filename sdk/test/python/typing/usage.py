from __future__ import annotations

import asyncio

from stophy import AsyncStophy, Stophy
from stophy.generated.models import CrawlCancelResponse, MapResponse, ScrapeResponse


def sync_scrape() -> ScrapeResponse:
    with Stophy() as stophy:
        return stophy.scrape(url="https://example.com", formats=["markdown"])


def sync_parsed() -> ScrapeResponse:
    with Stophy() as stophy:
        return stophy.parsed(
            "google-maps", "https://www.google.com/maps/search/dentists", page=2
        )


def sync_map() -> MapResponse:
    with Stophy() as stophy:
        return stophy.map(url="https://bun.sh")


async def async_cancel() -> CrawlCancelResponse:
    async with AsyncStophy() as stophy:
        return await stophy.crawl.cancel(id="job_1")


def main() -> None:
    print(sync_scrape()["data"])
    print(sync_map()["links"])
    print(asyncio.run(async_cancel())["status"])
