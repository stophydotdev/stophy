"""Generated from openapi.json by scripts/gen_python.py. Do not edit."""

from __future__ import annotations

from typing import Any, Literal, Mapping, Protocol

from .models import (
    BatchScrapeFormatsItemOption2,
    BatchScrapeFormatsItemOption8,
    BatchScrapeResponse,
    BatchScrapeStatusResponse,
    BatchScrapeWebhookOption1,
    BrowserTaskResponse,
    BrowserTaskStatusResponse,
    CrawlCancelResponse,
    CrawlResponse,
    CrawlScrapeOptions,
    CrawlStatusResponse,
    CrawlWebhookOption1,
    ExtractAgent,
    ExtractResponse,
    ExtractResultResponse,
    ExtractScrapeOptions,
    ExtractWebhookOption1,
    GetLimitsResponse,
    GetLogsResponse,
    GetUsageResponse,
    ListEndpointsResponse,
    ListParsersResponse,
    MapResponse,
    MapSitemap,
    ParseFormatsItemOption0,
    ParseFormatsItemOption1Option0,
    ParseFormatsItemOption1Option1,
    ParseOptions,
    ParseParsersItem,
    ParseResponse,
    PollSignUpResponse,
    RevokeKeyResponse,
    ScrapeFormatsItemOption2,
    ScrapeFormatsItemOption8,
    ScrapeLinkStyle,
    ScrapeResponse,
    SearchCategoriesItemOption0,
    SearchCategoriesItemOption1,
    SearchDeveloperPassagesOption1,
    SearchDeveloperResponse,
    SearchResponse,
    SearchScrapeOptions,
    SearchScrapeOptionsActionsItemOption0,
    SearchScrapeOptionsActionsItemOption1,
    SearchScrapeOptionsActionsItemOption2,
    SearchScrapeOptionsActionsItemOption3,
    SearchScrapeOptionsActionsItemOption4,
    SearchScrapeOptionsActionsItemOption5,
    SearchScrapeOptionsActionsItemOption6,
    SearchScrapeOptionsActionsItemOption7,
    SearchScrapeOptionsActionsItemOption8,
    SearchScrapeOptionsActionsItemOption9,
    SearchScrapeOptionsActionsItemOption10,
    SearchScrapeOptionsFormatsItemOption0,
    SearchScrapeOptionsFormatsItemOption1,
    SearchScrapeOptionsFormatsItemOption3,
    SearchScrapeOptionsFormatsItemOption4,
    SearchScrapeOptionsFormatsItemOption5,
    SearchScrapeOptionsFormatsItemOption6,
    SearchScrapeOptionsFormatsItemOption7,
    SearchScrapeOptionsFormatsItemOption9,
    SearchScrapeOptionsLocation,
    SearchScrapeOptionsParsersItemOption1,
    SearchScrapeOptionsProfile,
    SearchScrapeOptionsProxy,
    SearchScrapeOptionsRedactPIIOption1,
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
        urls: list[str] | None = None,
        schema: dict[str, str | float | bool | None | list[Any] | dict[str, Any]] | None = None,
        prompt: str | None = None,
        system_prompt: str | None = None,
        enable_web_search: bool | None = None,
        allow_external_links: bool | None = None,
        agent: ExtractAgent | None = None,
        webhook: str | ExtractWebhookOption1 | None = None,
        ignore_sitemap: bool | None = None,
        include_subdomains: bool | None = None,
        limit: int | None = None,
        timeout: int | None = None,
        show_sources: bool | None = None,
        scrape_options: ExtractScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        ignore_invalid_urls: bool | None = None,
        idempotency_key: str | None = None,
    ) -> ExtractResponse:
        values = _omit_none(
            {
                "urls": urls,
                "schema": schema,
                "prompt": prompt,
                "systemPrompt": system_prompt,
                "enableWebSearch": enable_web_search,
                "allowExternalLinks": allow_external_links,
                "agent": agent,
                "webhook": webhook,
                "ignoreSitemap": ignore_sitemap,
                "includeSubdomains": include_subdomains,
                "limit": limit,
                "timeout": timeout,
                "showSources": show_sources,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "Idempotency-Key": idempotency_key,
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
    ) -> SignUpResponse:
        return self._call("POST", "/v1/signup", {})


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


class SyncParsers:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> ListParsersResponse:
        return self._call("GET", "/v1/parsers", {})


class SyncEndpoints:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
    ) -> ListEndpointsResponse:
        return self._call("GET", "/v1/endpoints", {})


class SyncSearchDeveloper:
    def __init__(self, call: SyncCall) -> None:
        self._call = call

    def __call__(
        self,
        *,
        query: str,
        k: int | None = None,
        types: str | list[str] | None = None,
        repos: str | list[str] | None = None,
        language: str | None = None,
        min_stars: int | None = None,
        max_stars: int | None = None,
        passages: bool | SearchDeveloperPassagesOption1 | None = None,
    ) -> SearchDeveloperResponse:
        values = _omit_none(
            {
                "query": query,
                "k": k,
                "types": types,
                "repos": repos,
                "language": language,
                "min_stars": min_stars,
                "max_stars": max_stars,
                "passages": passages,
            }
        )
        return self._call("POST", "/v1/search/developer", values)


class SyncSearch:
    developer: SyncSearchDeveloper

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.developer = SyncSearchDeveloper(call)

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
        scrape_limit: int | None = None,
        tbs: str | None = None,
        location: str | None = None,
        country: str | None = None,
        lang: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        safe: bool | None = None,
        timeout: int | None = None,
        ignore_invalid_urls: bool | None = None,
        highlights: bool | None = None,
        scrape_options: SearchScrapeOptions | None = None,
        idempotency_key: str | None = None,
    ) -> SearchResponse:
        values = _omit_none(
            {
                "query": query,
                "sources": sources,
                "categories": categories,
                "maxAge": max_age,
                "limit": limit,
                "scrapeLimit": scrape_limit,
                "tbs": tbs,
                "location": location,
                "country": country,
                "lang": lang,
                "includeDomains": include_domains,
                "excludeDomains": exclude_domains,
                "safe": safe,
                "timeout": timeout,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "highlights": highlights,
                "scrapeOptions": scrape_options,
                "Idempotency-Key": idempotency_key,
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
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | ScrapeFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | ScrapeFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        headers: dict[str, str] | None = None,
        wait_for: int | None = None,
        mobile: bool | None = None,
        skip_tls_verification: bool | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1] | None = None,
        actions: list[
            SearchScrapeOptionsActionsItemOption0
            | SearchScrapeOptionsActionsItemOption1
            | SearchScrapeOptionsActionsItemOption2
            | SearchScrapeOptionsActionsItemOption3
            | SearchScrapeOptionsActionsItemOption4
            | SearchScrapeOptionsActionsItemOption5
            | SearchScrapeOptionsActionsItemOption6
            | SearchScrapeOptionsActionsItemOption7
            | SearchScrapeOptionsActionsItemOption8
            | SearchScrapeOptionsActionsItemOption9
            | SearchScrapeOptionsActionsItemOption10
        ]
        | None = None,
        location: SearchScrapeOptionsLocation | None = None,
        remove_base64_images: bool | None = None,
        block_ads: bool | None = None,
        fast_mode: bool | None = None,
        proxy: SearchScrapeOptionsProxy | None = None,
        store_in_cache: bool | None = None,
        lockdown: bool | None = None,
        check_prompt_injection: bool | None = None,
        redact_pii: bool | SearchScrapeOptionsRedactPIIOption1 | None = None,
        profile: SearchScrapeOptionsProfile | None = None,
        zero_data_retention: bool | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
        offset: int | None = None,
        query: str | None = None,
        idempotency_key: str | None = None,
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
                "headers": headers,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "fastMode": fast_mode,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "linkStyle": link_style,
                "maxChars": max_chars,
                "offset": offset,
                "query": query,
                "Idempotency-Key": idempotency_key,
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
        idempotency_key: str | None = None,
    ) -> BrowserTaskStatusResponse:
        values = _omit_none(
            {
                "id": id,
                "Idempotency-Key": idempotency_key,
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
        schema: dict[str, str | float | bool | None | list[Any] | dict[str, Any]] | None = None,
        max_steps: int | None = None,
        max_cost: float | None = None,
        idempotency_key: str | None = None,
    ) -> BrowserTaskResponse:
        values = _omit_none(
            {
                "url": url,
                "goal": goal,
                "values": values,
                "schema": schema,
                "maxSteps": max_steps,
                "maxCost": max_cost,
                "Idempotency-Key": idempotency_key,
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
        formats: list[
            ParseFormatsItemOption0
            | ParseFormatsItemOption1Option0
            | ParseFormatsItemOption1Option1
        ]
        | None = None,
        parsers: list[ParseParsersItem] | None = None,
        only_main_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        remove_base64_images: bool | None = None,
        zero_data_retention: bool | None = None,
        origin: str | None = None,
        integration: str | None = None,
        fast_mode: Any | None = None,
        mobile: Any | None = None,
        block_ads: Any | None = None,
        skip_tls_verification: Any | None = None,
        timeout: Any | None = None,
        headers: Any | None = None,
        proxy: Any | None = None,
        location: Any | None = None,
        profile: Any | None = None,
        upload_ref: str | None = None,
        file: str | None = None,
        filename: str | None = None,
        max_pages: int | None = None,
        options: ParseOptions | None = None,
        idempotency_key: str | None = None,
    ) -> ParseResponse:
        values = _omit_none(
            {
                "formats": formats,
                "parsers": parsers,
                "onlyMainContent": only_main_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "removeBase64Images": remove_base64_images,
                "zeroDataRetention": zero_data_retention,
                "origin": origin,
                "integration": integration,
                "fastMode": fast_mode,
                "mobile": mobile,
                "blockAds": block_ads,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "headers": headers,
                "proxy": proxy,
                "location": location,
                "profile": profile,
                "uploadRef": upload_ref,
                "file": file,
                "filename": filename,
                "maxPages": max_pages,
                "options": options,
                "Idempotency-Key": idempotency_key,
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
        location: SearchScrapeOptionsLocation | None = None,
        idempotency_key: str | None = None,
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
                "Idempotency-Key": idempotency_key,
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
        deduplicate_similar_urls: bool | None = None,
        allow_external_links: bool | None = None,
        allow_subdomains: bool | None = None,
        delay: float | None = None,
        max_concurrency: int | None = None,
        scrape_options: CrawlScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        webhook: str | CrawlWebhookOption1 | None = None,
        idempotency_key: str | None = None,
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
                "deduplicateSimilarURLs": deduplicate_similar_urls,
                "allowExternalLinks": allow_external_links,
                "allowSubdomains": allow_subdomains,
                "delay": delay,
                "maxConcurrency": max_concurrency,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "webhook": webhook,
                "Idempotency-Key": idempotency_key,
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
        webhook: str | BatchScrapeWebhookOption1 | None = None,
        max_concurrency: int | None = None,
        append_to_id: str | None = None,
        ignore_invalid_urls: bool | None = None,
        formats: list[
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | BatchScrapeFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | BatchScrapeFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        headers: dict[str, str] | None = None,
        wait_for: int | None = None,
        mobile: bool | None = None,
        skip_tls_verification: bool | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1] | None = None,
        actions: list[
            SearchScrapeOptionsActionsItemOption0
            | SearchScrapeOptionsActionsItemOption1
            | SearchScrapeOptionsActionsItemOption2
            | SearchScrapeOptionsActionsItemOption3
            | SearchScrapeOptionsActionsItemOption4
            | SearchScrapeOptionsActionsItemOption5
            | SearchScrapeOptionsActionsItemOption6
            | SearchScrapeOptionsActionsItemOption7
            | SearchScrapeOptionsActionsItemOption8
            | SearchScrapeOptionsActionsItemOption9
            | SearchScrapeOptionsActionsItemOption10
        ]
        | None = None,
        location: SearchScrapeOptionsLocation | None = None,
        remove_base64_images: bool | None = None,
        block_ads: bool | None = None,
        fast_mode: bool | None = None,
        proxy: SearchScrapeOptionsProxy | None = None,
        store_in_cache: bool | None = None,
        lockdown: bool | None = None,
        check_prompt_injection: bool | None = None,
        redact_pii: bool | SearchScrapeOptionsRedactPIIOption1 | None = None,
        profile: SearchScrapeOptionsProfile | None = None,
        zero_data_retention: bool | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
        query: str | None = None,
        idempotency_key: str | None = None,
    ) -> BatchScrapeResponse:
        values = _omit_none(
            {
                "urls": urls,
                "webhook": webhook,
                "maxConcurrency": max_concurrency,
                "appendToId": append_to_id,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "headers": headers,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "fastMode": fast_mode,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "linkStyle": link_style,
                "maxChars": max_chars,
                "query": query,
                "Idempotency-Key": idempotency_key,
            }
        )
        return self._call("POST", "/v1/batch/scrape", values)


class SyncBatch:
    scrape: SyncBatchScrape

    def __init__(self, call: SyncCall) -> None:
        self._call = call
        self.scrape = SyncBatchScrape(call)


class SyncSurface:
    extract: SyncExtract
    signup: SyncSignup
    limits: SyncLimits
    usage: SyncUsage
    logs: SyncLogs
    key: SyncKey
    parsers: SyncParsers
    endpoints: SyncEndpoints
    search: SyncSearch
    scrape: SyncScrape
    browser: SyncBrowser
    parse: SyncParse
    map: SyncMap
    crawl: SyncCrawl
    batch: SyncBatch

    def __init__(self, call: SyncCall) -> None:
        self.extract = SyncExtract(call)
        self.signup = SyncSignup(call)
        self.limits = SyncLimits(call)
        self.usage = SyncUsage(call)
        self.logs = SyncLogs(call)
        self.key = SyncKey(call)
        self.parsers = SyncParsers(call)
        self.endpoints = SyncEndpoints(call)
        self.search = SyncSearch(call)
        self.scrape = SyncScrape(call)
        self.browser = SyncBrowser(call)
        self.parse = SyncParse(call)
        self.map = SyncMap(call)
        self.crawl = SyncCrawl(call)
        self.batch = SyncBatch(call)


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
        urls: list[str] | None = None,
        schema: dict[str, str | float | bool | None | list[Any] | dict[str, Any]] | None = None,
        prompt: str | None = None,
        system_prompt: str | None = None,
        enable_web_search: bool | None = None,
        allow_external_links: bool | None = None,
        agent: ExtractAgent | None = None,
        webhook: str | ExtractWebhookOption1 | None = None,
        ignore_sitemap: bool | None = None,
        include_subdomains: bool | None = None,
        limit: int | None = None,
        timeout: int | None = None,
        show_sources: bool | None = None,
        scrape_options: ExtractScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        ignore_invalid_urls: bool | None = None,
        idempotency_key: str | None = None,
    ) -> ExtractResponse:
        values = _omit_none(
            {
                "urls": urls,
                "schema": schema,
                "prompt": prompt,
                "systemPrompt": system_prompt,
                "enableWebSearch": enable_web_search,
                "allowExternalLinks": allow_external_links,
                "agent": agent,
                "webhook": webhook,
                "ignoreSitemap": ignore_sitemap,
                "includeSubdomains": include_subdomains,
                "limit": limit,
                "timeout": timeout,
                "showSources": show_sources,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "Idempotency-Key": idempotency_key,
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
    ) -> SignUpResponse:
        return await self._call("POST", "/v1/signup", {})


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


class AsyncParsers:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> ListParsersResponse:
        return await self._call("GET", "/v1/parsers", {})


class AsyncEndpoints:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
    ) -> ListEndpointsResponse:
        return await self._call("GET", "/v1/endpoints", {})


class AsyncSearchDeveloper:
    def __init__(self, call: AsyncCall) -> None:
        self._call = call

    async def __call__(
        self,
        *,
        query: str,
        k: int | None = None,
        types: str | list[str] | None = None,
        repos: str | list[str] | None = None,
        language: str | None = None,
        min_stars: int | None = None,
        max_stars: int | None = None,
        passages: bool | SearchDeveloperPassagesOption1 | None = None,
    ) -> SearchDeveloperResponse:
        values = _omit_none(
            {
                "query": query,
                "k": k,
                "types": types,
                "repos": repos,
                "language": language,
                "min_stars": min_stars,
                "max_stars": max_stars,
                "passages": passages,
            }
        )
        return await self._call("POST", "/v1/search/developer", values)


class AsyncSearch:
    developer: AsyncSearchDeveloper

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.developer = AsyncSearchDeveloper(call)

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
        scrape_limit: int | None = None,
        tbs: str | None = None,
        location: str | None = None,
        country: str | None = None,
        lang: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
        safe: bool | None = None,
        timeout: int | None = None,
        ignore_invalid_urls: bool | None = None,
        highlights: bool | None = None,
        scrape_options: SearchScrapeOptions | None = None,
        idempotency_key: str | None = None,
    ) -> SearchResponse:
        values = _omit_none(
            {
                "query": query,
                "sources": sources,
                "categories": categories,
                "maxAge": max_age,
                "limit": limit,
                "scrapeLimit": scrape_limit,
                "tbs": tbs,
                "location": location,
                "country": country,
                "lang": lang,
                "includeDomains": include_domains,
                "excludeDomains": exclude_domains,
                "safe": safe,
                "timeout": timeout,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "highlights": highlights,
                "scrapeOptions": scrape_options,
                "Idempotency-Key": idempotency_key,
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
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | ScrapeFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | ScrapeFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        headers: dict[str, str] | None = None,
        wait_for: int | None = None,
        mobile: bool | None = None,
        skip_tls_verification: bool | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1] | None = None,
        actions: list[
            SearchScrapeOptionsActionsItemOption0
            | SearchScrapeOptionsActionsItemOption1
            | SearchScrapeOptionsActionsItemOption2
            | SearchScrapeOptionsActionsItemOption3
            | SearchScrapeOptionsActionsItemOption4
            | SearchScrapeOptionsActionsItemOption5
            | SearchScrapeOptionsActionsItemOption6
            | SearchScrapeOptionsActionsItemOption7
            | SearchScrapeOptionsActionsItemOption8
            | SearchScrapeOptionsActionsItemOption9
            | SearchScrapeOptionsActionsItemOption10
        ]
        | None = None,
        location: SearchScrapeOptionsLocation | None = None,
        remove_base64_images: bool | None = None,
        block_ads: bool | None = None,
        fast_mode: bool | None = None,
        proxy: SearchScrapeOptionsProxy | None = None,
        store_in_cache: bool | None = None,
        lockdown: bool | None = None,
        check_prompt_injection: bool | None = None,
        redact_pii: bool | SearchScrapeOptionsRedactPIIOption1 | None = None,
        profile: SearchScrapeOptionsProfile | None = None,
        zero_data_retention: bool | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
        offset: int | None = None,
        query: str | None = None,
        idempotency_key: str | None = None,
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
                "headers": headers,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "fastMode": fast_mode,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "linkStyle": link_style,
                "maxChars": max_chars,
                "offset": offset,
                "query": query,
                "Idempotency-Key": idempotency_key,
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
        idempotency_key: str | None = None,
    ) -> BrowserTaskStatusResponse:
        values = _omit_none(
            {
                "id": id,
                "Idempotency-Key": idempotency_key,
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
        schema: dict[str, str | float | bool | None | list[Any] | dict[str, Any]] | None = None,
        max_steps: int | None = None,
        max_cost: float | None = None,
        idempotency_key: str | None = None,
    ) -> BrowserTaskResponse:
        values = _omit_none(
            {
                "url": url,
                "goal": goal,
                "values": values,
                "schema": schema,
                "maxSteps": max_steps,
                "maxCost": max_cost,
                "Idempotency-Key": idempotency_key,
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
        formats: list[
            ParseFormatsItemOption0
            | ParseFormatsItemOption1Option0
            | ParseFormatsItemOption1Option1
        ]
        | None = None,
        parsers: list[ParseParsersItem] | None = None,
        only_main_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        remove_base64_images: bool | None = None,
        zero_data_retention: bool | None = None,
        origin: str | None = None,
        integration: str | None = None,
        fast_mode: Any | None = None,
        mobile: Any | None = None,
        block_ads: Any | None = None,
        skip_tls_verification: Any | None = None,
        timeout: Any | None = None,
        headers: Any | None = None,
        proxy: Any | None = None,
        location: Any | None = None,
        profile: Any | None = None,
        upload_ref: str | None = None,
        file: str | None = None,
        filename: str | None = None,
        max_pages: int | None = None,
        options: ParseOptions | None = None,
        idempotency_key: str | None = None,
    ) -> ParseResponse:
        values = _omit_none(
            {
                "formats": formats,
                "parsers": parsers,
                "onlyMainContent": only_main_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "removeBase64Images": remove_base64_images,
                "zeroDataRetention": zero_data_retention,
                "origin": origin,
                "integration": integration,
                "fastMode": fast_mode,
                "mobile": mobile,
                "blockAds": block_ads,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "headers": headers,
                "proxy": proxy,
                "location": location,
                "profile": profile,
                "uploadRef": upload_ref,
                "file": file,
                "filename": filename,
                "maxPages": max_pages,
                "options": options,
                "Idempotency-Key": idempotency_key,
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
        location: SearchScrapeOptionsLocation | None = None,
        idempotency_key: str | None = None,
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
                "Idempotency-Key": idempotency_key,
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
        deduplicate_similar_urls: bool | None = None,
        allow_external_links: bool | None = None,
        allow_subdomains: bool | None = None,
        delay: float | None = None,
        max_concurrency: int | None = None,
        scrape_options: CrawlScrapeOptions | None = None,
        zero_data_retention: bool | None = None,
        webhook: str | CrawlWebhookOption1 | None = None,
        idempotency_key: str | None = None,
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
                "deduplicateSimilarURLs": deduplicate_similar_urls,
                "allowExternalLinks": allow_external_links,
                "allowSubdomains": allow_subdomains,
                "delay": delay,
                "maxConcurrency": max_concurrency,
                "scrapeOptions": scrape_options,
                "zeroDataRetention": zero_data_retention,
                "webhook": webhook,
                "Idempotency-Key": idempotency_key,
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
        webhook: str | BatchScrapeWebhookOption1 | None = None,
        max_concurrency: int | None = None,
        append_to_id: str | None = None,
        ignore_invalid_urls: bool | None = None,
        formats: list[
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | BatchScrapeFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | BatchScrapeFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
        | None = None,
        only_main_content: bool | None = None,
        only_clean_content: bool | None = None,
        include_tags: list[str] | None = None,
        exclude_tags: list[str] | None = None,
        max_age: int | None = None,
        min_age: int | None = None,
        headers: dict[str, str] | None = None,
        wait_for: int | None = None,
        mobile: bool | None = None,
        skip_tls_verification: bool | None = None,
        timeout: int | None = None,
        parsers: list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1] | None = None,
        actions: list[
            SearchScrapeOptionsActionsItemOption0
            | SearchScrapeOptionsActionsItemOption1
            | SearchScrapeOptionsActionsItemOption2
            | SearchScrapeOptionsActionsItemOption3
            | SearchScrapeOptionsActionsItemOption4
            | SearchScrapeOptionsActionsItemOption5
            | SearchScrapeOptionsActionsItemOption6
            | SearchScrapeOptionsActionsItemOption7
            | SearchScrapeOptionsActionsItemOption8
            | SearchScrapeOptionsActionsItemOption9
            | SearchScrapeOptionsActionsItemOption10
        ]
        | None = None,
        location: SearchScrapeOptionsLocation | None = None,
        remove_base64_images: bool | None = None,
        block_ads: bool | None = None,
        fast_mode: bool | None = None,
        proxy: SearchScrapeOptionsProxy | None = None,
        store_in_cache: bool | None = None,
        lockdown: bool | None = None,
        check_prompt_injection: bool | None = None,
        redact_pii: bool | SearchScrapeOptionsRedactPIIOption1 | None = None,
        profile: SearchScrapeOptionsProfile | None = None,
        zero_data_retention: bool | None = None,
        link_style: ScrapeLinkStyle | None = None,
        max_chars: int | None = None,
        query: str | None = None,
        idempotency_key: str | None = None,
    ) -> BatchScrapeResponse:
        values = _omit_none(
            {
                "urls": urls,
                "webhook": webhook,
                "maxConcurrency": max_concurrency,
                "appendToId": append_to_id,
                "ignoreInvalidURLs": ignore_invalid_urls,
                "formats": formats,
                "onlyMainContent": only_main_content,
                "onlyCleanContent": only_clean_content,
                "includeTags": include_tags,
                "excludeTags": exclude_tags,
                "maxAge": max_age,
                "minAge": min_age,
                "headers": headers,
                "waitFor": wait_for,
                "mobile": mobile,
                "skipTlsVerification": skip_tls_verification,
                "timeout": timeout,
                "parsers": parsers,
                "actions": actions,
                "location": location,
                "removeBase64Images": remove_base64_images,
                "blockAds": block_ads,
                "fastMode": fast_mode,
                "proxy": proxy,
                "storeInCache": store_in_cache,
                "lockdown": lockdown,
                "checkPromptInjection": check_prompt_injection,
                "redactPII": redact_pii,
                "profile": profile,
                "zeroDataRetention": zero_data_retention,
                "linkStyle": link_style,
                "maxChars": max_chars,
                "query": query,
                "Idempotency-Key": idempotency_key,
            }
        )
        return await self._call("POST", "/v1/batch/scrape", values)


class AsyncBatch:
    scrape: AsyncBatchScrape

    def __init__(self, call: AsyncCall) -> None:
        self._call = call
        self.scrape = AsyncBatchScrape(call)


class AsyncSurface:
    extract: AsyncExtract
    signup: AsyncSignup
    limits: AsyncLimits
    usage: AsyncUsage
    logs: AsyncLogs
    key: AsyncKey
    parsers: AsyncParsers
    endpoints: AsyncEndpoints
    search: AsyncSearch
    scrape: AsyncScrape
    browser: AsyncBrowser
    parse: AsyncParse
    map: AsyncMap
    crawl: AsyncCrawl
    batch: AsyncBatch

    def __init__(self, call: AsyncCall) -> None:
        self.extract = AsyncExtract(call)
        self.signup = AsyncSignup(call)
        self.limits = AsyncLimits(call)
        self.usage = AsyncUsage(call)
        self.logs = AsyncLogs(call)
        self.key = AsyncKey(call)
        self.parsers = AsyncParsers(call)
        self.endpoints = AsyncEndpoints(call)
        self.search = AsyncSearch(call)
        self.scrape = AsyncScrape(call)
        self.browser = AsyncBrowser(call)
        self.parse = AsyncParse(call)
        self.map = AsyncMap(call)
        self.crawl = AsyncCrawl(call)
        self.batch = AsyncBatch(call)
