"""Generated from openapi.json by scripts/gen_python.py. Do not edit."""

from __future__ import annotations

from typing import Any, Literal, Mapping, Protocol

from .models import (
    BatchScrapeFormatsItemOption5,
    BatchScrapeResponse,
    BatchScrapeStatusResponse,
    BrowserTaskResponse,
    BrowserTaskSchema,
    BrowserTaskStatusResponse,
    CrawlCancelResponse,
    CrawlResponse,
    CrawlScrapeOptions,
    CrawlStatusResponse,
    CrawlWebhook,
    EndpointCatalog,
    ExtractResponse,
    ExtractResultResponse,
    ExtractSchema,
    ExtractScrapeOptions,
    GetLimitsResponse,
    GetLogsResponse,
    GetUsageResponse,
    ListParsersResponse,
    MapLocation,
    MapResponse,
    MapSitemap,
    ParseResponse,
    PollSignUpResponse,
    RevokeKeyResponse,
    ScrapeActionsItemOption0,
    ScrapeActionsItemOption1,
    ScrapeActionsItemOption2,
    ScrapeActionsItemOption3,
    ScrapeActionsItemOption4,
    ScrapeActionsItemOption5,
    ScrapeActionsItemOption6,
    ScrapeActionsItemOption7,
    ScrapeActionsItemOption8,
    ScrapeActionsItemOption9,
    ScrapeActionsItemOption10,
    ScrapeFormatsItemOption0,
    ScrapeFormatsItemOption1,
    ScrapeFormatsItemOption2,
    ScrapeFormatsItemOption3,
    ScrapeFormatsItemOption4,
    ScrapeFormatsItemOption5,
    ScrapeFormatsItemOption6,
    ScrapeLinkStyle,
    ScrapeLocation,
    ScrapeParsersItemOption1,
    ScrapeProfile,
    ScrapeResponse,
    SearchCategoriesItemOption0,
    SearchCategoriesItemOption1,
    SearchResponse,
    SearchScrapeOptions,
    SearchSourcesItemOption0,
    SearchSourcesItemOption1,
    SearchSourcesItemOption2,
    SignUpResponse,
)


class SyncCall(Protocol):
    def __call__(
        self,
        method: str,
        path: str,
        values: Mapping[str, Any],
    ) -> Any: ...


class AsyncCall(Protocol):
    async def __call__(
        self,
        method: str,
        path: str,
        values: Mapping[str, Any],
    ) -> Any: ...


def _omit_none(values: Mapping[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in values.items() if value is not None}


class SyncEndpoints:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> EndpointCatalog:
        return self._call("GET", "/v1/endpoints", {})


class SyncParsers:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> ListParsersResponse:
        return self._call("GET", "/v1/parsers", {})


class SyncExtractResult:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        id: str,
    ) -> ExtractResultResponse:
        values = _omit_none(
            {
                "id": id,
            }
        )
        return self._call("GET", "/v1/extract/{id}", values)


class SyncExtract:
    result: SyncExtractResult

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.result = SyncExtractResult(call)

    def __call__(
        self,
        *,
        urls: list[str],
        schema: ExtractSchema | None = None,
        prompt: str | None = None,
        enable_web_search: Literal[False] | None = None,
        ignore_sitemap: bool | None = None,
        include_subdomains: bool | None = None,
        show_sources: Literal[False] | None = None,
        scrape_options: ExtractScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        ignore_invalid_urls: bool | None = None,
    ) -> ExtractResponse:
        values = _omit_none(
            {
                "urls": urls,
                "schema": schema,
                "prompt": prompt,
                "enableWebSearch": enable_web_search,
                "ignoreSitemap": ignore_sitemap,
                "includeSubdomains": include_subdomains,
                "showSources": show_sources,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "ignoreInvalidURLs": ignore_invalid_urls,
            }
        )
        return self._call("POST", "/v1/extract", values)


class SyncSignupPoll:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        code: str,
    ) -> PollSignUpResponse:
        values = _omit_none(
            {
                "code": code,
            }
        )
        return self._call("POST", "/v1/signup/poll", values)


class SyncSignup:
    poll: SyncSignupPoll

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.poll = SyncSignupPoll(call)

    def __call__(
        self,
        *,
        scopes: list[Any] | None = None,
    ) -> SignUpResponse:
        values = _omit_none(
            {
                "scopes": scopes,
            }
        )
        return self._call("POST", "/v1/signup", values)


class SyncLimits:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> GetLimitsResponse:
        return self._call("GET", "/v1/limits", {})


class SyncUsage:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> GetUsageResponse:
        return self._call("GET", "/v1/usage", {})


class SyncLogs:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        days: int | None = None,
        page: int | None = None,
        api_key_id: str | None = None,
        endpoint: str | None = None,
    ) -> GetLogsResponse:
        values = _omit_none(
            {
                "days": days,
                "page": page,
                "apiKeyId": api_key_id,
                "endpoint": endpoint,
            }
        )
        return self._call("GET", "/v1/logs", values)


class SyncKeyRevoke:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> RevokeKeyResponse:
        return self._call("DELETE", "/v1/key", {})


class SyncKey:
    revoke: SyncKeyRevoke

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.revoke = SyncKeyRevoke(call)


class SyncSearch:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        query: str,
        sources: list[
            SearchSourcesItemOption0 | SearchSourcesItemOption1 | SearchSourcesItemOption2
        ]
        | None = None,
        categories: list[SearchCategoriesItemOption0 | SearchCategoriesItemOption1] | None = None,
        max_age: int | None = None,
        limit: int | None = None,
        tbs: str | None = None,
        location: str | None = None,
        country: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        safe: bool | None = None,
        timeout: int | None = None,
        ignore_invalid_urls: bool | None = None,
        highlights: bool | None = None,
        domain_tools: Literal[False] | None = None,
        tool_detail: Literal["compact"] | None = None,
        threat_protection: dict[str, Any] | None = None,
        scrape_options: SearchScrapeOptions | None = None,
    ) -> SearchResponse:
        values = _omit_none(
            {
                "query": query,
                "sources": sources,
                "categories": categories,
                "maxAge": max_age,
                "limit": limit,
                "tbs": tbs,
                "location": location,
                "country": country,
                "includeDomains": include_domains,
                "excludeDomains": exclude_domains,
                "safe": safe,
                "timeout": timeout,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "highlights": highlights,
                "domainTools": domain_tools,
                "toolDetail": tool_detail,
                "threatProtection": threat_protection,
                "scrapeOptions": scrape_options,
            }
        )
        return self._call("POST", "/v1/search", values)


class SyncScrape:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        url: str,
        formats: list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | ScrapeFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: Literal[False] | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        wait_for: int | None = None,
        mobile: Literal[False] | None = None,
        skip_tls_verification: Literal[False] | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | ScrapeParsersItemOption1] | None = None,
        actions: list[
            ScrapeActionsItemOption0
            | ScrapeActionsItemOption1
            | ScrapeActionsItemOption2
            | ScrapeActionsItemOption3
            | ScrapeActionsItemOption4
            | ScrapeActionsItemOption5
            | ScrapeActionsItemOption6
            | ScrapeActionsItemOption7
            | ScrapeActionsItemOption8
            | ScrapeActionsItemOption9
            | ScrapeActionsItemOption10
        ]
        | None = None,
        location: ScrapeLocation | None = None,
        remove_base64_images: Literal[True] | None = None,
        block_ads: Literal[True] | None = None,
        proxy: Literal["auto"] | None = None,
        store_in_cache: bool | None = None,
        lockdown: Literal[False] | None = None,
        check_prompt_injection: Literal[False] | None = None,
        redact_pii: Literal[False] | None = None,
        profile: ScrapeProfile | None = None,
        zero_data_retention: bool | None = None,
        domain_tools: Literal[False] | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
    ) -> ScrapeResponse:
        values = _omit_none(
            {
                "url": url,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "domainTools": domain_tools,
                "linkStyle": link_style,
                "maxChars": max_chars,
            }
        )
        return self._call("POST", "/v1/scrape", values)


class SyncBrowserTaskStatus:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        id: str,
    ) -> BrowserTaskStatusResponse:
        values = _omit_none(
            {
                "id": id,
            }
        )
        return self._call("POST", "/v1/browser/task/status", values)


class SyncBrowserTask:
    status: SyncBrowserTaskStatus

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.status = SyncBrowserTaskStatus(call)

    def __call__(
        self,
        *,
        url: str,
        goal: str,
        values: str | None = None,
        schema: BrowserTaskSchema | None = None,
        max_steps: int | None = None,
        max_cost: float | None = None,
    ) -> BrowserTaskResponse:
        values = _omit_none(
            {
                "url": url,
                "goal": goal,
                "values": values,
                "schema": schema,
                "maxSteps": max_steps,
                "maxCost": max_cost,
            }
        )
        return self._call("POST", "/v1/browser/task", values)


class SyncBrowser:
    task: SyncBrowserTask

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.task = SyncBrowserTask(call)


class SyncParse:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        file: str,
        filename: str | None = None,
        max_pages: int | None = None,
        zero_data_retention: bool | None = None,
    ) -> ParseResponse:
        values = _omit_none(
            {
                "file": file,
                "filename": filename,
                "maxPages": max_pages,
                "zeroDataRetention": zero_data_retention,
            }
        )
        return self._call("POST", "/v1/parse", values)


class SyncMap:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        url: str,
        search: str | None = None,
        sitemap: MapSitemap | None = None,
        include_subdomains: bool | None = None,
        ignore_query_parameters: bool | None = None,
        ignore_cache: bool | None = None,
        limit: int | None = None,
        timeout: int | None = None,
        location: MapLocation | None = None,
    ) -> MapResponse:
        values = _omit_none(
            {
                "url": url,
                "search": search,
                "sitemap": sitemap,
                "includeSubdomains": include_subdomains,
                "ignoreQueryParameters": ignore_query_parameters,
                "ignoreCache": ignore_cache,
                "limit": limit,
                "timeout": timeout,
                "location": location,
            }
        )
        return self._call("POST", "/v1/map", values)


class SyncCrawlStatus:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
        cursor: str | None = None,
    ) -> CrawlStatusResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
                "cursor": cursor,
            }
        )
        return self._call("GET", "/v1/crawl/{id}", values)


class SyncCrawlCancel:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
    ) -> CrawlCancelResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
            }
        )
        return self._call("DELETE", "/v1/crawl/{id}", values)


class SyncCrawl:
    status: SyncCrawlStatus
    cancel: SyncCrawlCancel

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.status = SyncCrawlStatus(call)
        self.cancel = SyncCrawlCancel(call)

    def __call__(
        self,
        *,
        url: str,
        prompt: str | None = None,
        include_paths: list[str] | None = None,
        exclude_paths: list[str] | None = None,
        max_discovery_depth: int | None = None,
        sitemap: MapSitemap | None = None,
        ignore_query_parameters: bool | None = None,
        regex_on_full_url: bool | None = None,
        limit: int | None = None,
        crawl_entire_domain: bool | None = None,
        allow_external_links: Literal[False] | None = None,
        allow_subdomains: bool | None = None,
        ignore_robots_txt: Literal[False] | None = None,
        scrape_options: CrawlScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        webhook: CrawlWebhook | None = None,
    ) -> CrawlResponse:
        values = _omit_none(
            {
                "url": url,
                "prompt": prompt,
                "includePaths": include_paths,
                "excludePaths": exclude_paths,
                "maxDiscoveryDepth": max_discovery_depth,
                "sitemap": sitemap,
                "ignoreQueryParameters": ignore_query_parameters,
                "regexOnFullURL": regex_on_full_url,
                "limit": limit,
                "crawlEntireDomain": crawl_entire_domain,
                "allowExternalLinks": allow_external_links,
                "allowSubdomains": allow_subdomains,
                "ignoreRobotsTxt": ignore_robots_txt,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "webhook": webhook,
            }
        )
        return self._call("POST", "/v1/crawl", values)


class SyncBatchScrapeStatus:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
        cursor: str | None = None,
    ) -> BatchScrapeStatusResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
                "cursor": cursor,
            }
        )
        return self._call("GET", "/v1/batch/scrape/{id}", values)


class SyncBatchScrapeCancel:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
    ) -> CrawlCancelResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
            }
        )
        return self._call("DELETE", "/v1/batch/scrape/{id}", values)


class SyncBatchScrape:
    status: SyncBatchScrapeStatus
    cancel: SyncBatchScrapeCancel

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.status = SyncBatchScrapeStatus(call)
        self.cancel = SyncBatchScrapeCancel(call)

    def __call__(
        self,
        *,
        urls: list[str],
        webhook: CrawlWebhook | None = None,
        ignore_invalid_urls: bool | None = None,
        formats: list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | BatchScrapeFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: Literal[False] | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        wait_for: int | None = None,
        mobile: Literal[False] | None = None,
        skip_tls_verification: Literal[False] | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | ScrapeParsersItemOption1] | None = None,
        actions: list[
            ScrapeActionsItemOption0
            | ScrapeActionsItemOption1
            | ScrapeActionsItemOption2
            | ScrapeActionsItemOption3
            | ScrapeActionsItemOption4
            | ScrapeActionsItemOption5
            | ScrapeActionsItemOption6
            | ScrapeActionsItemOption7
            | ScrapeActionsItemOption8
            | ScrapeActionsItemOption9
            | ScrapeActionsItemOption10
        ]
        | None = None,
        location: ScrapeLocation | None = None,
        remove_base64_images: Literal[True] | None = None,
        block_ads: Literal[True] | None = None,
        proxy: Literal["auto"] | None = None,
        store_in_cache: bool | None = None,
        lockdown: Literal[False] | None = None,
        check_prompt_injection: Literal[False] | None = None,
        redact_pii: Literal[False] | None = None,
        profile: ScrapeProfile | None = None,
        zero_data_retention: bool | None = None,
        domain_tools: Literal[False] | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
    ) -> BatchScrapeResponse:
        values = _omit_none(
            {
                "urls": urls,
                "webhook": webhook,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "domainTools": domain_tools,
                "linkStyle": link_style,
                "maxChars": max_chars,
            }
        )
        return self._call("POST", "/v1/batch/scrape", values)


class SyncBatch:
    scrape: SyncBatchScrape

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.scrape = SyncBatchScrape(call)


class SyncSurface:
    endpoints: SyncEndpoints
    parsers: SyncParsers
    extract: SyncExtract
    signup: SyncSignup
    limits: SyncLimits
    usage: SyncUsage
    logs: SyncLogs
    key: SyncKey
    search: SyncSearch
    scrape: SyncScrape
    browser: SyncBrowser
    parse: SyncParse
    map: SyncMap
    crawl: SyncCrawl
    batch: SyncBatch

    def __init__(self, call: SyncCall) -> None:
        self.endpoints = SyncEndpoints(call)
        self.parsers = SyncParsers(call)
        self.extract = SyncExtract(call)
        self.signup = SyncSignup(call)
        self.limits = SyncLimits(call)
        self.usage = SyncUsage(call)
        self.logs = SyncLogs(call)
        self.key = SyncKey(call)
        self.search = SyncSearch(call)
        self.scrape = SyncScrape(call)
        self.browser = SyncBrowser(call)
        self.parse = SyncParse(call)
        self.map = SyncMap(call)
        self.crawl = SyncCrawl(call)
        self.batch = SyncBatch(call)


class AsyncEndpoints:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> EndpointCatalog:
        return await self._call("GET", "/v1/endpoints", {})


class AsyncParsers:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> ListParsersResponse:
        return await self._call("GET", "/v1/parsers", {})


class AsyncExtractResult:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        id: str,
    ) -> ExtractResultResponse:
        values = _omit_none(
            {
                "id": id,
            }
        )
        return await self._call("GET", "/v1/extract/{id}", values)


class AsyncExtract:
    result: AsyncExtractResult

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.result = AsyncExtractResult(call)

    async def __call__(
        self,
        *,
        urls: list[str],
        schema: ExtractSchema | None = None,
        prompt: str | None = None,
        enable_web_search: Literal[False] | None = None,
        ignore_sitemap: bool | None = None,
        include_subdomains: bool | None = None,
        show_sources: Literal[False] | None = None,
        scrape_options: ExtractScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        ignore_invalid_urls: bool | None = None,
    ) -> ExtractResponse:
        values = _omit_none(
            {
                "urls": urls,
                "schema": schema,
                "prompt": prompt,
                "enableWebSearch": enable_web_search,
                "ignoreSitemap": ignore_sitemap,
                "includeSubdomains": include_subdomains,
                "showSources": show_sources,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "ignoreInvalidURLs": ignore_invalid_urls,
            }
        )
        return await self._call("POST", "/v1/extract", values)


class AsyncSignupPoll:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        code: str,
    ) -> PollSignUpResponse:
        values = _omit_none(
            {
                "code": code,
            }
        )
        return await self._call("POST", "/v1/signup/poll", values)


class AsyncSignup:
    poll: AsyncSignupPoll

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.poll = AsyncSignupPoll(call)

    async def __call__(
        self,
        *,
        scopes: list[Any] | None = None,
    ) -> SignUpResponse:
        values = _omit_none(
            {
                "scopes": scopes,
            }
        )
        return await self._call("POST", "/v1/signup", values)


class AsyncLimits:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> GetLimitsResponse:
        return await self._call("GET", "/v1/limits", {})


class AsyncUsage:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> GetUsageResponse:
        return await self._call("GET", "/v1/usage", {})


class AsyncLogs:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        days: int | None = None,
        page: int | None = None,
        api_key_id: str | None = None,
        endpoint: str | None = None,
    ) -> GetLogsResponse:
        values = _omit_none(
            {
                "days": days,
                "page": page,
                "apiKeyId": api_key_id,
                "endpoint": endpoint,
            }
        )
        return await self._call("GET", "/v1/logs", values)


class AsyncKeyRevoke:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> RevokeKeyResponse:
        return await self._call("DELETE", "/v1/key", {})


class AsyncKey:
    revoke: AsyncKeyRevoke

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.revoke = AsyncKeyRevoke(call)


class AsyncSearch:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        query: str,
        sources: list[
            SearchSourcesItemOption0 | SearchSourcesItemOption1 | SearchSourcesItemOption2
        ]
        | None = None,
        categories: list[SearchCategoriesItemOption0 | SearchCategoriesItemOption1] | None = None,
        max_age: int | None = None,
        limit: int | None = None,
        tbs: str | None = None,
        location: str | None = None,
        country: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        safe: bool | None = None,
        timeout: int | None = None,
        ignore_invalid_urls: bool | None = None,
        highlights: bool | None = None,
        domain_tools: Literal[False] | None = None,
        tool_detail: Literal["compact"] | None = None,
        threat_protection: dict[str, Any] | None = None,
        scrape_options: SearchScrapeOptions | None = None,
    ) -> SearchResponse:
        values = _omit_none(
            {
                "query": query,
                "sources": sources,
                "categories": categories,
                "maxAge": max_age,
                "limit": limit,
                "tbs": tbs,
                "location": location,
                "country": country,
                "includeDomains": include_domains,
                "excludeDomains": exclude_domains,
                "safe": safe,
                "timeout": timeout,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "highlights": highlights,
                "domainTools": domain_tools,
                "toolDetail": tool_detail,
                "threatProtection": threat_protection,
                "scrapeOptions": scrape_options,
            }
        )
        return await self._call("POST", "/v1/search", values)


class AsyncScrape:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        url: str,
        formats: list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | ScrapeFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: Literal[False] | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        wait_for: int | None = None,
        mobile: Literal[False] | None = None,
        skip_tls_verification: Literal[False] | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | ScrapeParsersItemOption1] | None = None,
        actions: list[
            ScrapeActionsItemOption0
            | ScrapeActionsItemOption1
            | ScrapeActionsItemOption2
            | ScrapeActionsItemOption3
            | ScrapeActionsItemOption4
            | ScrapeActionsItemOption5
            | ScrapeActionsItemOption6
            | ScrapeActionsItemOption7
            | ScrapeActionsItemOption8
            | ScrapeActionsItemOption9
            | ScrapeActionsItemOption10
        ]
        | None = None,
        location: ScrapeLocation | None = None,
        remove_base64_images: Literal[True] | None = None,
        block_ads: Literal[True] | None = None,
        proxy: Literal["auto"] | None = None,
        store_in_cache: bool | None = None,
        lockdown: Literal[False] | None = None,
        check_prompt_injection: Literal[False] | None = None,
        redact_pii: Literal[False] | None = None,
        profile: ScrapeProfile | None = None,
        zero_data_retention: bool | None = None,
        domain_tools: Literal[False] | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
    ) -> ScrapeResponse:
        values = _omit_none(
            {
                "url": url,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "domainTools": domain_tools,
                "linkStyle": link_style,
                "maxChars": max_chars,
            }
        )
        return await self._call("POST", "/v1/scrape", values)


class AsyncBrowserTaskStatus:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        id: str,
    ) -> BrowserTaskStatusResponse:
        values = _omit_none(
            {
                "id": id,
            }
        )
        return await self._call("POST", "/v1/browser/task/status", values)


class AsyncBrowserTask:
    status: AsyncBrowserTaskStatus

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.status = AsyncBrowserTaskStatus(call)

    async def __call__(
        self,
        *,
        url: str,
        goal: str,
        values: str | None = None,
        schema: BrowserTaskSchema | None = None,
        max_steps: int | None = None,
        max_cost: float | None = None,
    ) -> BrowserTaskResponse:
        values = _omit_none(
            {
                "url": url,
                "goal": goal,
                "values": values,
                "schema": schema,
                "maxSteps": max_steps,
                "maxCost": max_cost,
            }
        )
        return await self._call("POST", "/v1/browser/task", values)


class AsyncBrowser:
    task: AsyncBrowserTask

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.task = AsyncBrowserTask(call)


class AsyncParse:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        file: str,
        filename: str | None = None,
        max_pages: int | None = None,
        zero_data_retention: bool | None = None,
    ) -> ParseResponse:
        values = _omit_none(
            {
                "file": file,
                "filename": filename,
                "maxPages": max_pages,
                "zeroDataRetention": zero_data_retention,
            }
        )
        return await self._call("POST", "/v1/parse", values)


class AsyncMap:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        url: str,
        search: str | None = None,
        sitemap: MapSitemap | None = None,
        include_subdomains: bool | None = None,
        ignore_query_parameters: bool | None = None,
        ignore_cache: bool | None = None,
        limit: int | None = None,
        timeout: int | None = None,
        location: MapLocation | None = None,
    ) -> MapResponse:
        values = _omit_none(
            {
                "url": url,
                "search": search,
                "sitemap": sitemap,
                "includeSubdomains": include_subdomains,
                "ignoreQueryParameters": ignore_query_parameters,
                "ignoreCache": ignore_cache,
                "limit": limit,
                "timeout": timeout,
                "location": location,
            }
        )
        return await self._call("POST", "/v1/map", values)


class AsyncCrawlStatus:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
        cursor: str | None = None,
    ) -> CrawlStatusResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
                "cursor": cursor,
            }
        )
        return await self._call("GET", "/v1/crawl/{id}", values)


class AsyncCrawlCancel:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
    ) -> CrawlCancelResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
            }
        )
        return await self._call("DELETE", "/v1/crawl/{id}", values)


class AsyncCrawl:
    status: AsyncCrawlStatus
    cancel: AsyncCrawlCancel

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.status = AsyncCrawlStatus(call)
        self.cancel = AsyncCrawlCancel(call)

    async def __call__(
        self,
        *,
        url: str,
        prompt: str | None = None,
        include_paths: list[str] | None = None,
        exclude_paths: list[str] | None = None,
        max_discovery_depth: int | None = None,
        sitemap: MapSitemap | None = None,
        ignore_query_parameters: bool | None = None,
        regex_on_full_url: bool | None = None,
        limit: int | None = None,
        crawl_entire_domain: bool | None = None,
        allow_external_links: Literal[False] | None = None,
        allow_subdomains: bool | None = None,
        ignore_robots_txt: Literal[False] | None = None,
        scrape_options: CrawlScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        webhook: CrawlWebhook | None = None,
    ) -> CrawlResponse:
        values = _omit_none(
            {
                "url": url,
                "prompt": prompt,
                "includePaths": include_paths,
                "excludePaths": exclude_paths,
                "maxDiscoveryDepth": max_discovery_depth,
                "sitemap": sitemap,
                "ignoreQueryParameters": ignore_query_parameters,
                "regexOnFullURL": regex_on_full_url,
                "limit": limit,
                "crawlEntireDomain": crawl_entire_domain,
                "allowExternalLinks": allow_external_links,
                "allowSubdomains": allow_subdomains,
                "ignoreRobotsTxt": ignore_robots_txt,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "webhook": webhook,
            }
        )
        return await self._call("POST", "/v1/crawl", values)


class AsyncBatchScrapeStatus:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
        cursor: str | None = None,
    ) -> BatchScrapeStatusResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
                "cursor": cursor,
            }
        )
        return await self._call("GET", "/v1/batch/scrape/{id}", values)


class AsyncBatchScrapeCancel:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        max_text_length: int | None = None,
        id: str,
    ) -> CrawlCancelResponse:
        values = _omit_none(
            {
                "maxTextLength": max_text_length,
                "id": id,
            }
        )
        return await self._call("DELETE", "/v1/batch/scrape/{id}", values)


class AsyncBatchScrape:
    status: AsyncBatchScrapeStatus
    cancel: AsyncBatchScrapeCancel

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.status = AsyncBatchScrapeStatus(call)
        self.cancel = AsyncBatchScrapeCancel(call)

    async def __call__(
        self,
        *,
        urls: list[str],
        webhook: CrawlWebhook | None = None,
        ignore_invalid_urls: bool | None = None,
        formats: list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | BatchScrapeFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: Literal[False] | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        wait_for: int | None = None,
        mobile: Literal[False] | None = None,
        skip_tls_verification: Literal[False] | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | ScrapeParsersItemOption1] | None = None,
        actions: list[
            ScrapeActionsItemOption0
            | ScrapeActionsItemOption1
            | ScrapeActionsItemOption2
            | ScrapeActionsItemOption3
            | ScrapeActionsItemOption4
            | ScrapeActionsItemOption5
            | ScrapeActionsItemOption6
            | ScrapeActionsItemOption7
            | ScrapeActionsItemOption8
            | ScrapeActionsItemOption9
            | ScrapeActionsItemOption10
        ]
        | None = None,
        location: ScrapeLocation | None = None,
        remove_base64_images: Literal[True] | None = None,
        block_ads: Literal[True] | None = None,
        proxy: Literal["auto"] | None = None,
        store_in_cache: bool | None = None,
        lockdown: Literal[False] | None = None,
        check_prompt_injection: Literal[False] | None = None,
        redact_pii: Literal[False] | None = None,
        profile: ScrapeProfile | None = None,
        zero_data_retention: bool | None = None,
        domain_tools: Literal[False] | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
    ) -> BatchScrapeResponse:
        values = _omit_none(
            {
                "urls": urls,
                "webhook": webhook,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "domainTools": domain_tools,
                "linkStyle": link_style,
                "maxChars": max_chars,
            }
        )
        return await self._call("POST", "/v1/batch/scrape", values)


class AsyncBatch:
    scrape: AsyncBatchScrape

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.scrape = AsyncBatchScrape(call)


class AsyncSurface:
    endpoints: AsyncEndpoints
    parsers: AsyncParsers
    extract: AsyncExtract
    signup: AsyncSignup
    limits: AsyncLimits
    usage: AsyncUsage
    logs: AsyncLogs
    key: AsyncKey
    search: AsyncSearch
    scrape: AsyncScrape
    browser: AsyncBrowser
    parse: AsyncParse
    map: AsyncMap
    crawl: AsyncCrawl
    batch: AsyncBatch

    def __init__(self, call: AsyncCall) -> None:
        self.endpoints = AsyncEndpoints(call)
        self.parsers = AsyncParsers(call)
        self.extract = AsyncExtract(call)
        self.signup = AsyncSignup(call)
        self.limits = AsyncLimits(call)
        self.usage = AsyncUsage(call)
        self.logs = AsyncLogs(call)
        self.key = AsyncKey(call)
        self.search = AsyncSearch(call)
        self.scrape = AsyncScrape(call)
        self.browser = AsyncBrowser(call)
        self.parse = AsyncParse(call)
        self.map = AsyncMap(call)
        self.crawl = AsyncCrawl(call)
        self.batch = AsyncBatch(call)
