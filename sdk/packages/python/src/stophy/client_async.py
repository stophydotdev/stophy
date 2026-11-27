from __future__ import annotations

import os
from typing import Any, AsyncIterator, Mapping

import httpx

from .generated.models import ParserName, ScrapeResponse
from .generated.namespaces import AsyncSurface
from .results import OnCheckpoint, async_checkpoint_results
from .transport import DEFAULT_BASE_URL, AsyncTransport, camel_keys, default_headers, request_args


class AsyncStophy(AsyncSurface):
    """Calls the Stophy API with async methods that return dicts."""

    def __init__(
        self,
        api_key: str | None = None,
        *,
        base_url: str | None = None,
        headers: Mapping[str, str] | None = None,
        timeout: float = 70.0,
        max_retries: int = 2,
        retry_initial_delay: float = 0.5,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        resolved_key = (api_key or os.getenv("STOPHY_API_KEY", "")).strip()
        resolved_url = base_url or os.getenv("STOPHY_BASE_URL") or DEFAULT_BASE_URL
        self.client = httpx.AsyncClient(
            base_url=resolved_url,
            headers=default_headers(resolved_key, headers),
            timeout=timeout,
            transport=transport,
        )
        self._transport = AsyncTransport(
            self.client,
            max_retries=max_retries,
            retry_initial_delay=retry_initial_delay,
        )
        super().__init__(self._request)

    async def _request(self, method: str, path: str, values: Mapping[str, Any]) -> Any:
        url, kwargs = request_args(method, path, values)
        return await self._transport.request(method, url, **kwargs)

    async def endpoints(self) -> dict[str, Any]:
        catalog = (await self._request("GET", "/openapi.json", {}))["x-stophy-catalog"]
        return {"sources": catalog["sources"], "endpoints": catalog["endpoints"]}

    async def parsers(self) -> dict[str, Any]:
        catalog = (await self._request("GET", "/openapi.json", {}))["x-stophy-catalog"]
        return {"success": True, "data": {"parsers": catalog["parsers"], "kinds": catalog["kinds"]}}

    async def parsed(
        self, parser: ParserName, url: str, *, idempotency_key: str | None = None, **options: Any
    ) -> ScrapeResponse:
        """Reads url with a parser listed in /openapi.json. The data is in data.json.

        Options can be snake_case or camelCase: min_rating=4.5 or minRating=4.5.
        """
        return await self.scrape(
            url=url,
            idempotency_key=idempotency_key,
            formats=[{"type": "json", "parser": parser, "options": camel_keys(options)}]
            if options
            else [{"type": "json", "parser": parser}],
        )

    def crawl_results(
        self,
        id: str,
        *,
        checkpoint: str | None = None,
        poll_interval: float = 2.0,
        timeout: float = 900.0,
        on_checkpoint: OnCheckpoint | None = None,
    ) -> AsyncIterator[Any]:
        """Yields every finished page of a crawl as it arrives, until the job ends.

        Pass the checkpoint you kept to resume. It reads one status page per pull and
        raises StophyError with code resultsTimeout, and the checkpoint in details, at timeout.
        """
        return async_checkpoint_results(
            lambda checkpoint: self.crawl.status(id=id, checkpoint=checkpoint),
            checkpoint=checkpoint,
            poll_interval=poll_interval,
            timeout=timeout,
            on_checkpoint=on_checkpoint,
        )

    def batch_scrape_results(
        self,
        id: str,
        *,
        checkpoint: str | None = None,
        poll_interval: float = 2.0,
        timeout: float = 900.0,
        on_checkpoint: OnCheckpoint | None = None,
    ) -> AsyncIterator[Any]:
        """Yields every finished page of a batch as it arrives, until the job ends.

        Pass the checkpoint you kept to resume. It reads one status page per pull and
        raises StophyError with code resultsTimeout, and the checkpoint in details, at timeout.
        """
        return async_checkpoint_results(
            lambda checkpoint: self.batch.scrape.status(id=id, checkpoint=checkpoint),
            checkpoint=checkpoint,
            poll_interval=poll_interval,
            timeout=timeout,
            on_checkpoint=on_checkpoint,
        )

    async def close(self) -> None:
        await self.client.aclose()

    async def __aenter__(self) -> AsyncStophy:
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await self.close()
