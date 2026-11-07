"""Generated from openapi.json by scripts/gen_python.py. Do not edit."""

from __future__ import annotations

from typing import Any, Literal

from typing_extensions import NotRequired, TypedDict

EndpointCatalogSourcesItemKind = Literal[
    "site",
    "aiAnswers",
]

GetLimitsResponseDataTier = Literal[
    "free",
    "paid",
]

SearchSourcesItemOption0 = Literal[
    "web",
    "news",
    "images",
]

SearchSourcesItemOption2Type = Literal[
    "news",
    "images",
]

SearchCategoriesItemOption0 = Literal[
    "developer",
    "gov",
    "research",
    "pdf",
]

ScrapeFormatsItemOption0 = Literal[
    "markdown",
    "summary",
    "html",
    "rawHtml",
    "links",
    "images",
    "network",
    "branding",
    "screenshot",
    "changeTracking",
]

ScrapeFormatsItemOption1Type = Literal[
    "markdown",
    "summary",
    "html",
    "rawHtml",
    "links",
    "images",
    "network",
    "branding",
]

ScrapeInputSchema1Option0Type = Literal[
    "string",
    "number",
    "integer",
    "boolean",
]

ScrapeActionsItemOption5Direction = Literal[
    "up",
    "down",
    "left",
    "right",
]

ScrapeActionsItemOption5AmountOption1 = Literal[
    "viewport",
    "max",
]

ScrapeActionsItemOption9Format = Literal[
    "Letter",
    "Legal",
    "Tabloid",
    "Ledger",
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
]

ScrapeLinkStyle = Literal[
    "inline",
    "numbered",
    "none",
]

ScrapeResponseDataChangeTrackingChangeStatus = Literal[
    "new",
    "same",
    "changed",
]

ScrapeResponseDataMetadataCacheState = Literal[
    "hit",
    "miss",
]

BrowserTaskResponseDataStatus = Literal[
    "running",
    "done",
]

MapSitemap = Literal[
    "skip",
    "include",
    "only",
]

CrawlStatusResponseStatus = Literal[
    "scraping",
    "completed",
    "failed",
    "cancelled",
]

ParserName = Literal[
    "airbnb-listing",
    "airbnb-reviews",
    "airbnb-search",
    "amazon-bestsellers",
    "amazon-product",
    "amazon-reviews",
    "amazon-search",
    "appstore-app",
    "appstore-reviews",
    "appstore-search",
    "appstore-top",
    "booking-hotel",
    "booking-reviews",
    "booking-search",
    "careers-job",
    "careers-jobs",
    "company",
    "craigslist-search",
    "ebay-item",
    "ebay-search",
    "emails",
    "expedia-hotels",
    "facebook-comments",
    "facebook-marketplace",
    "facebook-page",
    "facebook-post",
    "glassdoor-company",
    "glassdoor-reviews",
    "glassdoor-salaries",
    "google-ads",
    "google-flights",
    "google-hotels",
    "google-maps",
    "google-maps-place",
    "google-maps-reviews",
    "google-patents",
    "google-play-app",
    "google-play-reviews",
    "google-play-search",
    "google-scholar",
    "google-trends",
    "indeed-job",
    "indeed-search",
    "instagram-comments",
    "instagram-feed",
    "instagram-post",
    "instagram-profile",
    "instagram-transcript",
    "linkedin-ads",
    "linkedin-company",
    "linkedin-job",
    "linkedin-jobs",
    "linkedin-posts",
    "linkedin-profile",
    "luma-event",
    "luma-events",
    "meta-ads",
    "phone-numbers",
    "pinterest-board",
    "pinterest-pin",
    "pinterest-profile",
    "pinterest-search",
    "realtor-property",
    "realtor-search",
    "reddit-post",
    "reddit-search",
    "reddit-subreddit",
    "reddit-subreddits",
    "reddit-user",
    "threads-post",
    "threads-profile",
    "tiktok-ads",
    "tiktok-comments",
    "tiktok-followers",
    "tiktok-following",
    "tiktok-hashtag",
    "tiktok-profile",
    "tiktok-search",
    "tiktok-shop",
    "tiktok-sound",
    "tiktok-transcript",
    "tiktok-video",
    "tripadvisor-place",
    "tripadvisor-reviews",
    "tripadvisor-search",
    "trustpilot-company",
    "trustpilot-reviews",
    "trustpilot-search",
    "upwork-job",
    "upwork-search",
    "x-post",
    "x-profile",
    "yelp-business",
    "yelp-reviews",
    "yelp-search",
    "youtube-channel",
    "youtube-comments",
    "youtube-playlist",
    "youtube-post",
    "youtube-search",
    "youtube-transcript",
    "youtube-video",
    "zillow-property",
    "zillow-search",
]


class EndpointCatalogSourcesItem(TypedDict):
    id: str
    name: str
    summary: str
    kind: EndpointCatalogSourcesItemKind


class EndpointCatalogEndpointsItem(TypedDict):
    id: str
    title: str
    summary: str
    bestWhen: str | None
    method: Literal["POST"]
    path: str
    credits: int
    maxCredits: int
    pricing: NotRequired[str | None]
    keyless: bool
    cacheTtlSeconds: int
    input: NotRequired[dict[str, Any]]
    example: dict[str, Any] | None


class EndpointCatalog(TypedDict):
    sources: list[EndpointCatalogSourcesItem]
    endpoints: list[EndpointCatalogEndpointsItem]


class ListParsersResponseDataParsersItem(TypedDict):
    name: NotRequired[str]
    takes: NotRequired[str]
    example: NotRequired[str]
    options: NotRequired[list[dict[str, Any]]]
    returns: NotRequired[list[str]]
    price: NotRequired[str]
    credits: NotRequired[int]
    keyless: NotRequired[bool]


class ListParsersResponseData(TypedDict):
    parsers: NotRequired[list[ListParsersResponseDataParsersItem]]


class ListParsersResponse(TypedDict):
    success: NotRequired[bool]
    data: NotRequired[ListParsersResponseData]


class ExtractResultResponse(TypedDict):
    success: Literal[True]
    status: Literal["completed"]
    data: dict[str, str | float | bool | None | list[Any] | dict[str, Any]]
    confidence: dict[str, float]
    expiresAt: str


class SignUpResponseData(TypedDict):
    claimUrl: str
    code: str
    expiresAt: str


class SignUpResponse(TypedDict):
    success: Literal[True]
    data: SignUpResponseData
    creditsUsed: Literal[0]
    requestId: str


class PollSignUpResponseData(TypedDict):
    status: NotRequired[Literal["waiting"]]
    claimUrl: NotRequired[str]
    apiKey: NotRequired[str]


class PollSignUpResponse(TypedDict):
    success: Literal[True]
    data: PollSignUpResponseData
    creditsUsed: Literal[0]
    requestId: str


class GetLimitsResponseDataRateLimit(TypedDict):
    limitPerMinute: NotRequired[int]
    remaining: NotRequired[int]
    resetsAt: NotRequired[str]


class GetLimitsResponseData(TypedDict):
    tier: GetLimitsResponseDataTier
    balanceCredits: float
    rateLimit: GetLimitsResponseDataRateLimit | None
    keyExpiresAt: str | None
    billingUrl: Literal["https://stophy.dev/billing"]


class GetLimitsResponse(TypedDict):
    success: Literal[True]
    data: GetLimitsResponseData
    creditsUsed: Literal[0]
    requestId: str


class GetUsageResponse(TypedDict):
    balanceMicros: int
    creditsUsed: float
    requestCount: int


class GetLogsResponseLogsItem(TypedDict):
    id: NotRequired[str]
    requestId: NotRequired[str]
    createdAt: NotRequired[str]
    endpoint: NotRequired[str]
    credits: NotRequired[float]
    durationMs: NotRequired[int | None]
    apiKeyId: NotRequired[str | None]
    apiKeyName: NotRequired[str | None]


class GetLogsResponse(TypedDict):
    endpoints: list[str]
    logs: list[GetLogsResponseLogsItem]
    page: int
    pageSize: int
    total: int
    totalPages: int


class RevokeKeyResponse(TypedDict):
    success: Literal[True]


class SearchSourcesItemOption1(TypedDict):
    type: Literal["web"]
    tbs: NotRequired[str]
    location: NotRequired[str]


class SearchSourcesItemOption2(TypedDict):
    type: SearchSourcesItemOption2Type


class SearchCategoriesItemOption1(TypedDict):
    type: SearchCategoriesItemOption0


class SearchScrapeOptionsFormatsItemOption1(TypedDict):
    type: str


class SearchScrapeOptions(TypedDict):
    formats: NotRequired[list[str | SearchScrapeOptionsFormatsItemOption1]]
    onlyMainContent: NotRequired[Literal[True]]
    onlyCleanContent: NotRequired[Literal[False]]
    maxAge: NotRequired[Literal[172800000]]
    zeroDataRetention: NotRequired[bool]
    headers: NotRequired[dict[str, Any]]
    waitFor: NotRequired[Literal[0]]
    mobile: NotRequired[Literal[False]]
    skipTlsVerification: NotRequired[Literal[False]]
    timeout: NotRequired[Literal[60000]]
    removeBase64Images: NotRequired[Literal[True]]
    blockAds: NotRequired[Literal[True]]
    proxy: NotRequired[Literal["auto"]]
    storeInCache: NotRequired[Literal[True]]
    lockdown: NotRequired[Literal[False]]
    checkPromptInjection: NotRequired[Literal[False]]
    redactPII: NotRequired[Literal[False]]


class SearchResponseDataWebItem(TypedDict):
    url: NotRequired[str]
    title: NotRequired[str]
    description: NotRequired[str]
    position: int
    markdown: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    screenshot: NotRequired[str]
    metadata: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    scrapeError: NotRequired[str]


class SearchResponseDataNewsItem(TypedDict):
    url: NotRequired[str]
    title: NotRequired[str]
    snippet: NotRequired[str]
    date: NotRequired[str]
    imageUrl: NotRequired[str]
    position: int
    markdown: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    screenshot: NotRequired[str]
    metadata: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    scrapeError: NotRequired[str]


class SearchResponseDataImagesItem(TypedDict):
    url: NotRequired[str]
    imageUrl: NotRequired[str]
    imageWidth: NotRequired[int]
    imageHeight: NotRequired[int]
    position: int


class SearchResponseData(TypedDict):
    web: NotRequired[list[SearchResponseDataWebItem]]
    news: NotRequired[list[SearchResponseDataNewsItem]]
    images: NotRequired[list[SearchResponseDataImagesItem]]


class SearchResponse(TypedDict):
    success: Literal[True]
    data: NotRequired[SearchResponseData]
    warning: NotRequired[str]
    creditsUsed: int


class ScrapeFormatsItemOption1(TypedDict):
    type: ScrapeFormatsItemOption1Type


class ScrapeFormatsItemOption2(TypedDict):
    type: Literal["changeTracking"]
    modes: NotRequired[list[Literal["git-diff"]]]
    tag: NotRequired[None]


class ScrapeFormatsItemOption3(TypedDict):
    type: Literal["screenshot"]
    fullPage: NotRequired[bool]


class ScrapeFormatsItemOption4(TypedDict):
    type: Literal["highlights"]
    query: str
    count: NotRequired[int]


class ScrapeInputSchema1Option0(TypedDict):
    type: ScrapeInputSchema1Option0Type
    description: NotRequired[str]


class ScrapeInputSchema1Option1(TypedDict):
    type: Literal["array"]
    items: Any
    description: NotRequired[str]


class ScrapeInputSchema1Option2(TypedDict):
    type: Literal["object"]
    properties: dict[str, Any]
    description: NotRequired[str]


class ScrapeFormatsItemOption5Schema(TypedDict):
    type: Literal["object"]
    properties: dict[
        str, ScrapeInputSchema1Option0 | ScrapeInputSchema1Option1 | ScrapeInputSchema1Option2
    ]


class ScrapeFormatsItemOption5(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[ScrapeFormatsItemOption5Schema]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[Literal[False]]


class ScrapeFormatsItemOption6SelectorsItem(TypedDict):
    selector: str
    attribute: str


class ScrapeFormatsItemOption6(TypedDict):
    type: Literal["attributes"]
    selectors: list[ScrapeFormatsItemOption6SelectorsItem]


class ScrapeParsersItemOption1(TypedDict):
    type: Literal["pdf"]
    mode: NotRequired[Literal["auto"]]
    pages: NotRequired[Literal[False]]
    blocks: NotRequired[Literal[False]]
    pageMarkers: NotRequired[Literal[False]]


class ScrapeActionsItemOption0(TypedDict):
    type: Literal["wait"]
    milliseconds: int


class ScrapeActionsItemOption1(TypedDict):
    type: Literal["wait"]
    selector: str


class ScrapeActionsItemOption2(TypedDict):
    type: Literal["click"]
    selector: str
    all: NotRequired[Literal[False]]


class ScrapeActionsItemOption3(TypedDict):
    type: Literal["write"]
    text: str


class ScrapeActionsItemOption4(TypedDict):
    type: Literal["press"]
    key: str


class ScrapeActionsItemOption5(TypedDict):
    type: Literal["scroll"]
    direction: NotRequired[ScrapeActionsItemOption5Direction]
    amount: NotRequired[int | ScrapeActionsItemOption5AmountOption1]
    maxScrolls: NotRequired[int]
    selector: NotRequired[str]


class ScrapeActionsItemOption6Viewport(TypedDict):
    width: int
    height: int


class ScrapeActionsItemOption6(TypedDict):
    type: Literal["screenshot"]
    fullPage: NotRequired[bool]
    quality: NotRequired[int]
    viewport: NotRequired[ScrapeActionsItemOption6Viewport]


class ScrapeActionsItemOption7(TypedDict):
    type: Literal["scrape"]


class ScrapeActionsItemOption8(TypedDict):
    type: Literal["executeJavascript"]
    script: str


class ScrapeActionsItemOption9(TypedDict):
    type: Literal["pdf"]
    format: NotRequired[ScrapeActionsItemOption9Format]
    landscape: NotRequired[bool]
    scale: NotRequired[float]


class ScrapeActionsItemOption10(TypedDict):
    type: Literal["perform"]
    action: str


class ScrapeLocation(TypedDict):
    country: NotRequired[str]


class ScrapeProfile(TypedDict):
    name: str
    saveChanges: NotRequired[bool]


class ScrapeResponseDataAttributesItem(TypedDict):
    selector: NotRequired[str]
    attribute: NotRequired[str]
    values: NotRequired[list[str]]


class ScrapeResponseDataChangeTracking(TypedDict):
    previousScrapeAt: NotRequired[str]
    changeStatus: NotRequired[ScrapeResponseDataChangeTrackingChangeStatus]
    visibility: NotRequired[str]
    diff: NotRequired[str]


class ScrapeResponseDataActionsScrapesItem(TypedDict):
    url: NotRequired[str]
    html: NotRequired[str]


class ScrapeResponseDataActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class ScrapeResponseDataActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[ScrapeResponseDataActionsScrapesItem]]
    javascriptReturns: NotRequired[list[ScrapeResponseDataActionsJavascriptReturnsItem]]
    pdfs: NotRequired[list[str]]


class ScrapeResponseDataMetadata(TypedDict):
    title: NotRequired[str]
    description: NotRequired[str]
    language: NotRequired[str]
    ogImage: NotRequired[str]
    sourceURL: NotRequired[str]
    url: NotRequired[str]
    statusCode: int
    contentType: NotRequired[str]
    numPages: NotRequired[int]
    totalPages: NotRequired[int]
    cacheState: NotRequired[ScrapeResponseDataMetadataCacheState]
    cachedAt: NotRequired[str]
    scrapeId: NotRequired[str]
    creditsUsed: NotRequired[int]


class ScrapeResponseData(TypedDict):
    markdown: NotRequired[str]
    summary: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    attributes: NotRequired[list[ScrapeResponseDataAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[ScrapeResponseDataActions]
    warning: NotRequired[str]
    metadata: ScrapeResponseDataMetadata


class ScrapeResponse(TypedDict):
    success: Literal[True]
    data: ScrapeResponseData


class ExtractInputSchema0Option1(TypedDict):
    type: Literal["array"]
    items: Any
    description: NotRequired[str]


class ExtractInputSchema0Option2(TypedDict):
    type: Literal["object"]
    properties: dict[str, Any]
    description: NotRequired[str]


class ExtractSchema(TypedDict):
    type: Literal["object"]
    properties: dict[
        str, ScrapeInputSchema1Option0 | ExtractInputSchema0Option1 | ExtractInputSchema0Option2
    ]


class ExtractScrapeOptionsFormatsItemOption5(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[ExtractSchema]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[Literal[False]]


class ExtractScrapeOptions(TypedDict):
    onlyMainContent: NotRequired[bool]
    onlyCleanContent: NotRequired[Literal[False]]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    maxAge: NotRequired[int]
    minAge: NotRequired[int]
    waitFor: NotRequired[int]
    mobile: NotRequired[Literal[False]]
    skipTlsVerification: NotRequired[Literal[False]]
    timeout: NotRequired[int]
    parsers: NotRequired[list[Literal["pdf"] | ScrapeParsersItemOption1]]
    actions: NotRequired[
        list[
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
    ]
    location: NotRequired[ScrapeLocation]
    removeBase64Images: NotRequired[Literal[True]]
    blockAds: NotRequired[Literal[True]]
    proxy: NotRequired[Literal["auto"]]
    storeInCache: NotRequired[bool]
    lockdown: NotRequired[Literal[False]]
    checkPromptInjection: NotRequired[Literal[False]]
    redactPII: NotRequired[Literal[False]]
    profile: NotRequired[ScrapeProfile]
    zeroDataRetention: NotRequired[bool]
    domainTools: NotRequired[Literal[False]]
    formats: NotRequired[
        list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | ExtractScrapeOptionsFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
    ]


class ExtractResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    invalidURLs: list[str]


class BrowserTaskInputSchema0Option1(TypedDict):
    type: Literal["array"]
    items: Any
    description: NotRequired[str]


class BrowserTaskInputSchema0Option2(TypedDict):
    type: Literal["object"]
    properties: dict[str, Any]
    description: NotRequired[str]


class BrowserTaskSchema(TypedDict):
    type: Literal["object"]
    properties: dict[
        str,
        ScrapeInputSchema1Option0 | BrowserTaskInputSchema0Option1 | BrowserTaskInputSchema0Option2,
    ]


class BrowserTaskResponseData(TypedDict):
    id: NotRequired[str]
    status: BrowserTaskResponseDataStatus


class BrowserTaskResponse(TypedDict):
    success: Literal[True]
    data: BrowserTaskResponseData
    creditsUsed: int
    requestId: str


class BrowserTaskStatusResponseDataResult(TypedDict):
    done: bool
    reason: NotRequired[str]
    steps: NotRequired[list[str]]
    url: NotRequired[str]
    title: NotRequired[str]
    seconds: NotRequired[float]
    fields: NotRequired[dict[str, str | float | bool | list[str | float | bool]]]
    confidence: NotRequired[dict[str, float]]


class BrowserTaskStatusResponseData(TypedDict):
    status: BrowserTaskResponseDataStatus
    result: NotRequired[BrowserTaskStatusResponseDataResult]
    creditsUsed: int


class BrowserTaskStatusResponse(TypedDict):
    success: Literal[True]
    data: BrowserTaskStatusResponseData
    creditsUsed: int
    requestId: str


class ParseResponseDataMetadata(TypedDict):
    title: NotRequired[str]
    contentType: NotRequired[str]
    numPages: NotRequired[int]


class ParseResponseData(TypedDict):
    markdown: NotRequired[str]
    warning: NotRequired[str]
    metadata: NotRequired[ParseResponseDataMetadata]


class ParseResponse(TypedDict):
    success: Literal[True]
    data: NotRequired[ParseResponseData]


class MapLocation(TypedDict):
    country: NotRequired[str]


class MapResponseLinksItem(TypedDict):
    url: NotRequired[str]
    title: NotRequired[str]


class MapResponse(TypedDict):
    success: Literal[True]
    links: list[MapResponseLinksItem]


class CrawlInputSchema1Option1(TypedDict):
    type: Literal["array"]
    items: Any
    description: NotRequired[str]


class CrawlInputSchema1Option2(TypedDict):
    type: Literal["object"]
    properties: dict[str, Any]
    description: NotRequired[str]


class CrawlScrapeOptionsFormatsItemOption5Schema(TypedDict):
    type: Literal["object"]
    properties: dict[
        str, ScrapeInputSchema1Option0 | CrawlInputSchema1Option1 | CrawlInputSchema1Option2
    ]


class CrawlScrapeOptionsFormatsItemOption5(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[CrawlScrapeOptionsFormatsItemOption5Schema]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[Literal[False]]


class CrawlScrapeOptions(TypedDict):
    onlyMainContent: NotRequired[bool]
    onlyCleanContent: NotRequired[Literal[False]]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    maxAge: NotRequired[int]
    minAge: NotRequired[int]
    waitFor: NotRequired[int]
    mobile: NotRequired[Literal[False]]
    skipTlsVerification: NotRequired[Literal[False]]
    timeout: NotRequired[int]
    parsers: NotRequired[list[Literal["pdf"] | ScrapeParsersItemOption1]]
    actions: NotRequired[
        list[
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
    ]
    location: NotRequired[ScrapeLocation]
    removeBase64Images: NotRequired[Literal[True]]
    blockAds: NotRequired[Literal[True]]
    proxy: NotRequired[Literal["auto"]]
    storeInCache: NotRequired[bool]
    lockdown: NotRequired[Literal[False]]
    checkPromptInjection: NotRequired[Literal[False]]
    redactPII: NotRequired[Literal[False]]
    profile: NotRequired[ScrapeProfile]
    zeroDataRetention: NotRequired[bool]
    domainTools: NotRequired[Literal[False]]
    formats: NotRequired[
        list[
            ScrapeFormatsItemOption0
            | ScrapeFormatsItemOption1
            | ScrapeFormatsItemOption2
            | ScrapeFormatsItemOption3
            | ScrapeFormatsItemOption4
            | CrawlScrapeOptionsFormatsItemOption5
            | ScrapeFormatsItemOption6
        ]
    ]


class CrawlWebhook(TypedDict):
    url: str


class CrawlResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    url: NotRequired[str]


class CrawlStatusResponseDataItemActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class CrawlStatusResponseDataItemActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[ScrapeResponseDataActionsScrapesItem]]
    javascriptReturns: NotRequired[list[CrawlStatusResponseDataItemActionsJavascriptReturnsItem]]
    pdfs: NotRequired[list[str]]


class CrawlStatusResponseDataItem(TypedDict):
    markdown: NotRequired[str]
    summary: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    attributes: NotRequired[list[ScrapeResponseDataAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[CrawlStatusResponseDataItemActions]
    warning: NotRequired[str]
    metadata: ScrapeResponseDataMetadata


class CrawlStatusResponse(TypedDict):
    success: Literal[True]
    status: CrawlStatusResponseStatus
    total: int
    completed: int
    creditsUsed: int
    createdAt: NotRequired[str]
    completedAt: NotRequired[str]
    duration: NotRequired[float]
    expiresAt: NotRequired[str]
    next: NotRequired[str]
    data: list[CrawlStatusResponseDataItem]


class CrawlCancelResponse(TypedDict):
    status: Literal["cancelled"]


class BatchScrapeInputSchema1Option1(TypedDict):
    type: Literal["array"]
    items: Any
    description: NotRequired[str]


class BatchScrapeInputSchema1Option2(TypedDict):
    type: Literal["object"]
    properties: dict[str, Any]
    description: NotRequired[str]


class BatchScrapeFormatsItemOption5Schema(TypedDict):
    type: Literal["object"]
    properties: dict[
        str,
        ScrapeInputSchema1Option0 | BatchScrapeInputSchema1Option1 | BatchScrapeInputSchema1Option2,
    ]


class BatchScrapeFormatsItemOption5(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[BatchScrapeFormatsItemOption5Schema]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[Literal[False]]


class BatchScrapeResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    url: NotRequired[str]
    invalidURLs: list[str]


class BatchScrapeStatusResponseDataItemActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class BatchScrapeStatusResponseDataItemActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[ScrapeResponseDataActionsScrapesItem]]
    javascriptReturns: NotRequired[
        list[BatchScrapeStatusResponseDataItemActionsJavascriptReturnsItem]
    ]
    pdfs: NotRequired[list[str]]


class BatchScrapeStatusResponseDataItem(TypedDict):
    markdown: NotRequired[str]
    summary: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    attributes: NotRequired[list[ScrapeResponseDataAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[BatchScrapeStatusResponseDataItemActions]
    warning: NotRequired[str]
    metadata: ScrapeResponseDataMetadata


class BatchScrapeStatusResponse(TypedDict):
    success: Literal[True]
    status: CrawlStatusResponseStatus
    total: int
    completed: int
    creditsUsed: int
    createdAt: NotRequired[str]
    completedAt: NotRequired[str]
    duration: NotRequired[float]
    expiresAt: NotRequired[str]
    next: NotRequired[str]
    data: list[BatchScrapeStatusResponseDataItem]
