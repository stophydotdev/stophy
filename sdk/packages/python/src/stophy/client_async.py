from __future__ import annotations

import os
from typing import Any, Mapping

import httpx

from .generated.models import ParserName, ScrapeResponse
from .generated.namespaces import AsyncSurface
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

    async def parsed(self, parser: ParserName, url: str, **options: Any) -> ScrapeResponse:
        """Reads url with a parser from GET /v1/parsers. The data is in data.json.

        Options can be snake_case or camelCase: min_rating=4.5 or minRating=4.5.
        """
        return await self.scrape(
            url=url,
            formats=[{"type": "json", "parser": parser, "options": camel_keys(options)}]
            if options
            else [{"type": "json", "parser": parser}],
        )

    async def close(self) -> None:
        await self.client.aclose()

    async def __aenter__(self) -> AsyncStophy:
        return self

    async def __aexit__(self, *exc: Any) -> None:
        await self.close()
