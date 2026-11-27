from __future__ import annotations

import os
from typing import Any, Iterator, Mapping

import httpx

from .generated.models import ParserName, ScrapeResponse
from .generated.namespaces import SyncSurface
from .results import OnCheckpoint, checkpoint_results
from .transport import DEFAULT_BASE_URL, SyncTransport, camel_keys, default_headers, request_args


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

    def endpoints(self) -> dict[str, Any]:
        catalog = self._request("GET", "/openapi.json", {})["x-stophy-catalog"]
        return {"sources": catalog["sources"], "endpoints": catalog["endpoints"]}

    def parsers(self) -> dict[str, Any]:
        catalog = self._request("GET", "/openapi.json", {})["x-stophy-catalog"]
        return {"success": True, "data": {"parsers": catalog["parsers"], "kinds": catalog["kinds"]}}

    def parsed(
        self, parser: ParserName, url: str, *, idempotency_key: str | None = None, **options: Any
    ) -> ScrapeResponse:
        """Reads url with a parser from the parser catalog in /openapi.json. The data is in data.json.

        Options can be snake_case or camelCase: min_rating=4.5 or minRating=4.5.
        """
        return self.scrape(
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
    ) -> Iterator[Any]:
        """Yields every finished page of a crawl as it arrives, until the job ends.

        Pass the checkpoint you kept to resume. It reads one status page per pull and
        raises StophyError with code resultsTimeout, and the checkpoint in details, at timeout.
        An in-flight status request uses the client's HTTP timeout.
        """
        return checkpoint_results(
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
    ) -> Iterator[Any]:
        """Yields every finished page of a batch as it arrives, until the job ends.

        Pass the checkpoint you kept to resume. It reads one status page per pull and
        raises StophyError with code resultsTimeout, and the checkpoint in details, at timeout.
        An in-flight status request uses the client's HTTP timeout.
        """
        return checkpoint_results(
            lambda checkpoint: self.batch.scrape.status(id=id, checkpoint=checkpoint),
            checkpoint=checkpoint,
            poll_interval=poll_interval,
            timeout=timeout,
            on_checkpoint=on_checkpoint,
        )

    def close(self) -> None:
        self.client.close()

    def __enter__(self) -> Stophy:
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()
