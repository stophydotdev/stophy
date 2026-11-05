from __future__ import annotations

import os
from typing import Any, Mapping

import httpx

from .generated.models import ParserName, ScrapeResponse
from .generated.namespaces import SyncSurface
from .transport import DEFAULT_BASE_URL, SyncTransport, default_headers, request_args


class Stophy(SyncSurface):
    """Calls the Stophy API and returns each response as a dict."""

    def __init__(
        self,
        api_key: str | None = None,
        *,
        base_url: str | None = None,
        headers: Mapping[str, str] | None = None,
        timeout: float = 70.0,
        max_retries: int = 2,
        retry_initial_delay: float = 0.5,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        resolved_key = (api_key or os.getenv("STOPHY_API_KEY", "")).strip()
        resolved_url = base_url or os.getenv("STOPHY_BASE_URL") or DEFAULT_BASE_URL
        self.client = httpx.Client(
            base_url=resolved_url,
            headers=default_headers(resolved_key, headers),
            timeout=timeout,
            transport=transport,
        )
        self._transport = SyncTransport(
            self.client,
            max_retries=max_retries,
            retry_initial_delay=retry_initial_delay,
        )
        super().__init__(self._request)

    def _request(self, method: str, path: str, values: Mapping[str, Any]) -> Any:
        url, kwargs = request_args(method, path, values)
        return self._transport.request(method, url, **kwargs)

    def parsed(self, parser: ParserName, url: str, **options: Any) -> ScrapeResponse:
        """Reads url with a parser from GET /v1/parsers. The data is in data.json."""
        return self.scrape(
            url=url,
            formats=[{"type": "json", "parser": parser, "options": options}]
            if options
            else [{"type": "json", "parser": parser}],
        )

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> Stophy:
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()
