"""Generated from openapi.json by scripts/gen_python.py. Do not edit."""

from __future__ import annotations

from typing import Any, Literal

from typing_extensions import NotRequired, TypedDict

ExtractResultResponseStatus = Literal[
    "completed",
    "failed",
]

GetLimitsResponseDataTier = Literal[
    "free",
    "paid",
]

ListEndpointsResponseSourcesItemKind = Literal[
    "site",
    "aiAnswers",
]

SearchDeveloperPassagesOption1 = Literal[
    "true",
    "false",
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
    "research",
    "pdf",
    "videos",
]

SearchScrapeOptionsFormatsItemOption0 = Literal[
    "markdown",
    "summary",
    "html",
    "rawHtml",
    "rawBase64",
    "links",
    "images",
    "network",
    "branding",
    "audio",
    "video",
    "screenshot",
    "changeTracking",
    "product",
    "menu",
]

SearchScrapeOptionsFormatsItemOption1Type = Literal[
    "markdown",
    "summary",
    "html",
    "rawHtml",
    "rawBase64",
    "links",
    "images",
    "network",
    "branding",
    "audio",
    "video",
]

SearchScrapeOptionsFormatsItemOption2ModesItem = Literal[
    "git-diff",
    "json",
]

SearchScrapeOptionsParsersItemOption1Mode = Literal[
    "fast",
    "auto",
    "ocr",
]

SearchScrapeOptionsActionsItemOption5Direction = Literal[
    "up",
    "down",
    "left",
    "right",
]

SearchScrapeOptionsActionsItemOption5AmountOption1 = Literal[
    "viewport",
    "max",
]

SearchScrapeOptionsActionsItemOption9Format = Literal[
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

SearchScrapeOptionsProxy = Literal[
    "auto",
    "basic",
    "enhanced",
    "stealth",
]

SearchScrapeOptionsRedactPIIOption1Mode = Literal[
    "accurate",
    "aggressive",
    "fast",
]

SearchScrapeOptionsRedactPIIOption1EntitiesItem = Literal[
    "PERSON",
    "EMAIL",
    "PHONE",
    "LOCATION",
    "FINANCIAL",
    "SECRET",
]

SearchScrapeOptionsRedactPIIOption1ReplaceStyle = Literal[
    "tag",
    "mask",
    "remove",
]

SearchResponseDataWebItemBrandingColorScheme = Literal[
    "light",
    "dark",
]

SearchResponseDataWebItemChangeTrackingStatus = Literal[
    "new",
    "same",
    "changed",
]

SearchResponseDataWebItemCategory = Literal[
    "github",
    "research",
    "pdf",
]

ScrapeLinkStyle = Literal[
    "inline",
    "numbered",
    "none",
]

ScrapeResponseDataMetadataCacheState = Literal[
    "hit",
    "miss",
    "stale",
]

ExtractWebhookOption1EventsItem = Literal[
    "started",
    "page",
    "action",
    "completed",
    "failed",
    "cancelled",
]

BrowserTaskResponseDataStatus = Literal[
    "running",
    "done",
]

ParseFormatsItemOption1Option0 = Literal[
    "markdown",
    "summary",
    "html",
    "rawHtml",
    "links",
    "images",
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
    "bsky-post",
    "bsky-profile",
    "careers-job",
    "careers-jobs",
    "craigslist-listing",
    "craigslist-search",
    "crunchbase-company",
    "ebay-item",
    "ebay-search",
    "emails",
    "expedia-hotels",
    "facebook-comments",
    "facebook-group",
    "facebook-marketplace",
    "facebook-page",
    "facebook-post",
    "g2-reviews",
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
    "google-trends",
    "indeed-job",
    "indeed-search",
    "instagram-comments",
    "instagram-feed",
    "instagram-post",
    "instagram-profile",
    "instagram-transcript",
    "link-in-bio",
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
    "tiktok-live",
    "tiktok-profile",
    "tiktok-search",
    "tiktok-shop",
    "tiktok-sound",
    "tiktok-transcript",
    "tiktok-trending",
    "tiktok-video",
    "tripadvisor-place",
    "tripadvisor-reviews",
    "tripadvisor-search",
    "trustpilot-company",
    "trustpilot-reviews",
    "trustpilot-search",
    "twitch-clips",
    "twitch-profile",
    "upwork-job",
    "upwork-search",
    "x-community",
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


class ExtractResultResponse(TypedDict):
    success: bool
    status: ExtractResultResponseStatus
    data: dict[str, str | float | bool | None | list[Any] | dict[str, Any]]
    confidence: dict[str, float]
    warning: NotRequired[str]
    error: NotRequired[str]
    urls: list[str]
    sources: NotRequired[dict[str, list[str]]]
    creditsUsed: int
    costUsd: float
    expiresAt: str
    tokensUsed: NotRequired[int]


class SignUpResponseData(TypedDict):
    claimUrl: str
    code: str
    expiresAt: str


class SignUpResponse(TypedDict):
    success: Literal[True]
    data: SignUpResponseData
    creditsUsed: Literal[0]
    costUsd: float
    requestId: str


class PollSignUpResponseData(TypedDict):
    status: NotRequired[Literal["waiting"]]
    claimUrl: NotRequired[str]
    apiKey: NotRequired[str]


class PollSignUpResponse(TypedDict):
    success: Literal[True]
    data: PollSignUpResponseData
    creditsUsed: Literal[0]
    costUsd: float
    requestId: str


class GetLimitsResponseDataRateLimit(TypedDict):
    limitPerMinute: NotRequired[int]
    remaining: NotRequired[int]
    resetsAt: NotRequired[str]


class GetLimitsResponseDataPerMinute(TypedDict):
    calls: NotRequired[int]
    jobs: NotRequired[int]
    interact: NotRequired[int]
    reads: NotRequired[int]


class GetLimitsResponseDataConcurrency(TypedDict):
    limit: NotRequired[int]
    inUse: NotRequired[int | None]


class GetLimitsResponseDataPaidLimits(TypedDict):
    perMinute: NotRequired[GetLimitsResponseDataPerMinute]
    concurrency: NotRequired[int]
    jobsAtOnce: NotRequired[int]
    queuedJobs: NotRequired[int]
    sessionsAtOnce: NotRequired[int]


class GetLimitsResponseData(TypedDict):
    tier: GetLimitsResponseDataTier
    balanceCredits: float
    balanceUsd: float
    rateLimit: GetLimitsResponseDataRateLimit | None
    perMinute: GetLimitsResponseDataPerMinute
    concurrency: GetLimitsResponseDataConcurrency
    jobsAtOnce: int
    queuedJobs: int
    sessionsAtOnce: int
    paidLimits: NotRequired[GetLimitsResponseDataPaidLimits | None]
    keyExpiresAt: str | None
    billingUrl: Literal["https://stophy.dev/billing"]


class GetLimitsResponse(TypedDict):
    success: Literal[True]
    data: GetLimitsResponseData
    creditsUsed: Literal[0]
    costUsd: float
    requestId: str


class GetUsageResponse(TypedDict):
    balanceMicros: int
    balanceUsd: float
    creditsUsed: float
    costUsd: float
    requestCount: int


class GetLogsResponseLogsItem(TypedDict):
    id: NotRequired[str]
    requestId: NotRequired[str]
    createdAt: NotRequired[str]
    endpoint: NotRequired[str]
    method: NotRequired[str]
    status: NotRequired[int]
    response: NotRequired[str]
    credits: NotRequired[float]
    costUsd: NotRequired[float]
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


class ListEndpointsResponseSourcesItem(TypedDict):
    id: str
    name: str
    summary: str
    kind: ListEndpointsResponseSourcesItemKind


class ListEndpointsResponseEndpointsItem(TypedDict):
    id: str
    title: str
    summary: str
    bestWhen: str | None
    method: Literal["POST"]
    path: str
    credits: int
    maxCredits: int
    costUsd: NotRequired[float]
    maxCostUsd: NotRequired[float]
    pricing: str | None
    keyless: bool
    cacheTtlSeconds: int
    input: dict[str, str | float | bool | None | list[Any] | dict[str, Any]]
    example: dict[str, str | float | bool | None | list[Any] | dict[str, Any]] | None


class ListEndpointsResponse(TypedDict):
    sources: list[ListEndpointsResponseSourcesItem]
    endpoints: list[ListEndpointsResponseEndpointsItem]


class SearchDeveloperResponseResultsItem(TypedDict):
    id: NotRequired[str]
    url: NotRequired[str]
    title: NotRequired[str]
    passages: NotRequired[list[dict[str, Any]]]
    type: NotRequired[str]
    repo: NotRequired[str | None]
    stars: NotRequired[int | None]
    language: NotRequired[str | None]
    date: NotRequired[str | None]
    state: NotRequired[str | None]


class SearchDeveloperResponse(TypedDict):
    success: Literal[True]
    partial: NotRequired[bool]
    results: NotRequired[list[SearchDeveloperResponseResultsItem]]
    repos: NotRequired[list[dict[str, Any]]]
    creditsUsed: int
    costUsd: float
    requestId: str


class SearchSourcesItemOption1(TypedDict):
    type: Literal["web"]
    tbs: NotRequired[str]
    location: NotRequired[str]
    country: NotRequired[str]
    lang: NotRequired[str]


class SearchSourcesItemOption2(TypedDict):
    type: SearchSourcesItemOption2Type


class SearchCategoriesItemOption1(TypedDict):
    type: SearchCategoriesItemOption0


class SearchScrapeOptionsFormatsItemOption1(TypedDict):
    type: SearchScrapeOptionsFormatsItemOption1Type


class SearchScrapeOptionsFormatsItemOption2(TypedDict):
    type: Literal["changeTracking"]
    modes: NotRequired[list[SearchScrapeOptionsFormatsItemOption2ModesItem]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    tag: NotRequired[None]


class SearchScrapeOptionsFormatsItemOption3(TypedDict):
    type: Literal["question"]
    question: str


class SearchScrapeOptionsFormatsItemOption4(TypedDict):
    type: Literal["product"]


class SearchScrapeOptionsFormatsItemOption5(TypedDict):
    type: Literal["menu"]


class SearchScrapeOptionsFormatsItemOption6Viewport(TypedDict):
    width: int
    height: int


class SearchScrapeOptionsFormatsItemOption6(TypedDict):
    type: Literal["screenshot"]
    fullPage: NotRequired[bool]
    quality: NotRequired[int]
    viewport: NotRequired[SearchScrapeOptionsFormatsItemOption6Viewport]


class SearchScrapeOptionsFormatsItemOption7(TypedDict):
    type: Literal["highlights"]
    query: str
    count: NotRequired[int]


class SearchScrapeOptionsFormatsItemOption8(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[bool]


class SearchScrapeOptionsFormatsItemOption9SelectorsItem(TypedDict):
    selector: str
    attribute: str


class SearchScrapeOptionsFormatsItemOption9(TypedDict):
    type: Literal["attributes"]
    selectors: list[SearchScrapeOptionsFormatsItemOption9SelectorsItem]


class SearchScrapeOptionsParsersItemOption1(TypedDict):
    type: Literal["pdf"]
    mode: NotRequired[SearchScrapeOptionsParsersItemOption1Mode]
    maxPages: NotRequired[int]
    pages: NotRequired[bool]
    blocks: NotRequired[bool]
    pageMarkers: NotRequired[bool]


class SearchScrapeOptionsActionsItemOption0(TypedDict):
    type: Literal["wait"]
    milliseconds: int


class SearchScrapeOptionsActionsItemOption1(TypedDict):
    type: Literal["wait"]
    selector: str


class SearchScrapeOptionsActionsItemOption2(TypedDict):
    type: Literal["click"]
    selector: str
    all: NotRequired[Literal[False]]


class SearchScrapeOptionsActionsItemOption3(TypedDict):
    type: Literal["write"]
    text: str


class SearchScrapeOptionsActionsItemOption4(TypedDict):
    type: Literal["press"]
    key: str


class SearchScrapeOptionsActionsItemOption5(TypedDict):
    type: Literal["scroll"]
    direction: NotRequired[SearchScrapeOptionsActionsItemOption5Direction]
    amount: NotRequired[int | SearchScrapeOptionsActionsItemOption5AmountOption1]
    maxScrolls: NotRequired[int]
    selector: NotRequired[str]


class SearchScrapeOptionsActionsItemOption6Viewport(TypedDict):
    width: int
    height: int


class SearchScrapeOptionsActionsItemOption6(TypedDict):
    type: Literal["screenshot"]
    fullPage: NotRequired[bool]
    quality: NotRequired[int]
    viewport: NotRequired[SearchScrapeOptionsActionsItemOption6Viewport]


class SearchScrapeOptionsActionsItemOption7(TypedDict):
    type: Literal["scrape"]


class SearchScrapeOptionsActionsItemOption8(TypedDict):
    type: Literal["executeJavascript"]
    script: str


class SearchScrapeOptionsActionsItemOption9(TypedDict):
    type: Literal["pdf"]
    format: NotRequired[SearchScrapeOptionsActionsItemOption9Format]
    landscape: NotRequired[bool]
    scale: NotRequired[float]


class SearchScrapeOptionsActionsItemOption10(TypedDict):
    type: Literal["perform"]
    action: str


class SearchScrapeOptionsLocation(TypedDict):
    country: NotRequired[str]
    languages: NotRequired[list[str]]


class SearchScrapeOptionsRedactPIIOption1(TypedDict):
    mode: NotRequired[SearchScrapeOptionsRedactPIIOption1Mode]
    entities: NotRequired[list[SearchScrapeOptionsRedactPIIOption1EntitiesItem]]
    replaceStyle: NotRequired[SearchScrapeOptionsRedactPIIOption1ReplaceStyle]


class SearchScrapeOptionsProfile(TypedDict):
    name: str
    saveChanges: NotRequired[bool]


class SearchScrapeOptions(TypedDict):
    formats: NotRequired[
        list[
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | SearchScrapeOptionsFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | SearchScrapeOptionsFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
    ]
    onlyMainContent: NotRequired[bool]
    onlyCleanContent: NotRequired[bool]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    maxAge: NotRequired[int]
    minAge: NotRequired[int]
    headers: NotRequired[dict[str, str]]
    waitFor: NotRequired[int]
    mobile: NotRequired[bool]
    skipTlsVerification: NotRequired[bool]
    timeout: NotRequired[int]
    parsers: NotRequired[list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1]]
    actions: NotRequired[
        list[
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
    ]
    location: NotRequired[SearchScrapeOptionsLocation]
    removeBase64Images: NotRequired[bool]
    blockAds: NotRequired[bool]
    fastMode: NotRequired[bool]
    proxy: NotRequired[SearchScrapeOptionsProxy]
    storeInCache: NotRequired[bool]
    lockdown: NotRequired[bool]
    checkPromptInjection: NotRequired[bool]
    redactPII: NotRequired[bool | SearchScrapeOptionsRedactPIIOption1]
    profile: NotRequired[SearchScrapeOptionsProfile]
    zeroDataRetention: NotRequired[bool]


class SearchResponseDataWebItemPagesItem(TypedDict):
    pageNumber: int
    markdown: NotRequired[str]


class SearchResponseDataWebItemHighlightsItem(TypedDict):
    section: NotRequired[str]
    text: NotRequired[str]


class SearchResponseDataWebItemNetworkItem(TypedDict):
    url: NotRequired[str]
    method: NotRequired[str]
    status: int
    contentType: NotRequired[str]
    body: NotRequired[str]


class SearchResponseDataWebItemBrandingColors(TypedDict):
    primary: NotRequired[str]
    secondary: NotRequired[str]
    accent: NotRequired[str]
    background: NotRequired[str]
    textPrimary: NotRequired[str]
    textSecondary: NotRequired[str]
    link: NotRequired[str]
    success: NotRequired[str]
    warning: NotRequired[str]
    error: NotRequired[str]


class SearchResponseDataWebItemBrandingFontsItem(TypedDict):
    family: str


class SearchResponseDataWebItemBrandingTypographyFontFamilies(TypedDict):
    primary: NotRequired[str]
    heading: NotRequired[str]
    code: NotRequired[str]


class SearchResponseDataWebItemBrandingTypographyFontSizes(TypedDict):
    h1: NotRequired[str]
    h2: NotRequired[str]
    h3: NotRequired[str]
    body: NotRequired[str]


class SearchResponseDataWebItemBrandingTypographyFontWeights(TypedDict):
    light: NotRequired[int]
    regular: NotRequired[int]
    medium: NotRequired[int]
    bold: NotRequired[int]


class SearchResponseDataWebItemBrandingTypographyLineHeights(TypedDict):
    heading: NotRequired[str]
    body: NotRequired[str]


class SearchResponseDataWebItemBrandingTypography(TypedDict):
    fontFamilies: NotRequired[SearchResponseDataWebItemBrandingTypographyFontFamilies]
    fontSizes: NotRequired[SearchResponseDataWebItemBrandingTypographyFontSizes]
    fontWeights: NotRequired[SearchResponseDataWebItemBrandingTypographyFontWeights]
    lineHeights: NotRequired[SearchResponseDataWebItemBrandingTypographyLineHeights]


class SearchResponseDataWebItemBrandingSpacing(TypedDict):
    baseUnit: NotRequired[int]
    borderRadius: NotRequired[str]
    padding: NotRequired[dict[str, str]]
    margins: NotRequired[dict[str, str]]


class SearchResponseDataWebItemBrandingComponentsButtonPrimary(TypedDict):
    background: NotRequired[str]
    textColor: NotRequired[str]
    borderRadius: NotRequired[str]


class SearchResponseDataWebItemBrandingComponentsButtonSecondary(TypedDict):
    background: NotRequired[str]
    textColor: NotRequired[str]
    borderColor: NotRequired[str]
    borderRadius: NotRequired[str]


class SearchResponseDataWebItemBrandingComponents(TypedDict):
    buttonPrimary: NotRequired[SearchResponseDataWebItemBrandingComponentsButtonPrimary]
    buttonSecondary: NotRequired[SearchResponseDataWebItemBrandingComponentsButtonSecondary]
    input: NotRequired[dict[str, str]]


class SearchResponseDataWebItemBrandingImages(TypedDict):
    logo: NotRequired[str]
    favicon: NotRequired[str]
    ogImage: NotRequired[str]


class SearchResponseDataWebItemBranding(TypedDict):
    colorScheme: SearchResponseDataWebItemBrandingColorScheme
    logo: NotRequired[str]
    colors: NotRequired[SearchResponseDataWebItemBrandingColors]
    fonts: NotRequired[list[SearchResponseDataWebItemBrandingFontsItem]]
    typography: NotRequired[SearchResponseDataWebItemBrandingTypography]
    spacing: NotRequired[SearchResponseDataWebItemBrandingSpacing]
    components: NotRequired[SearchResponseDataWebItemBrandingComponents]
    icons: NotRequired[dict[str, str]]
    images: NotRequired[SearchResponseDataWebItemBrandingImages]
    animations: NotRequired[dict[str, str]]
    layout: NotRequired[dict[str, str]]
    personality: NotRequired[dict[str, str]]


class SearchResponseDataWebItemChangeTrackingJsonValue(TypedDict):
    previous: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    current: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class SearchResponseDataWebItemChangeTracking(TypedDict):
    status: SearchResponseDataWebItemChangeTrackingStatus
    previousAt: NotRequired[str]
    diff: NotRequired[str]
    json: NotRequired[dict[str, SearchResponseDataWebItemChangeTrackingJsonValue]]


class SearchResponseDataWebItemAttributesItem(TypedDict):
    selector: NotRequired[str]
    attribute: NotRequired[str]
    values: NotRequired[list[str]]


class SearchResponseDataWebItemActionsScrapesItem(TypedDict):
    url: NotRequired[str]
    html: NotRequired[str]


class SearchResponseDataWebItemActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[Any]


class SearchResponseDataWebItemActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[SearchResponseDataWebItemActionsScrapesItem]]
    javascriptReturns: NotRequired[list[SearchResponseDataWebItemActionsJavascriptReturnsItem]]
    pdfs: NotRequired[list[str]]


class SearchResponseDataWebItem(TypedDict):
    pages: NotRequired[list[SearchResponseDataWebItemPagesItem]]
    blocks: NotRequired[list[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]]
    summary: NotRequired[str]
    answer: NotRequired[str]
    product: NotRequired[dict[str, Any]]
    menu: NotRequired[dict[str, Any]]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    audio: NotRequired[str]
    video: NotRequired[str]
    rawBase64: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    screenshot: NotRequired[str]
    screenshotCropped: NotRequired[bool]
    highlights: NotRequired[list[SearchResponseDataWebItemHighlightsItem]]
    network: NotRequired[list[SearchResponseDataWebItemNetworkItem]]
    branding: NotRequired[SearchResponseDataWebItemBranding]
    networkDropped: NotRequired[int]
    json: NotRequired[dict[str, Any]]
    changeTracking: NotRequired[SearchResponseDataWebItemChangeTracking]
    attributes: NotRequired[list[SearchResponseDataWebItemAttributesItem]]
    actions: NotRequired[SearchResponseDataWebItemActions]
    warning: NotRequired[str]
    nextOffset: NotRequired[int]
    url: str
    title: NotRequired[str]
    description: NotRequired[str]
    position: int
    markdown: NotRequired[str]
    metadata: NotRequired[dict[str, str | float | list[str]]]
    category: NotRequired[SearchResponseDataWebItemCategory]
    date: NotRequired[str]


class SearchResponseDataNewsItem(TypedDict):
    pages: NotRequired[list[SearchResponseDataWebItemPagesItem]]
    blocks: NotRequired[list[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]]
    summary: NotRequired[str]
    answer: NotRequired[str]
    product: NotRequired[dict[str, Any]]
    menu: NotRequired[dict[str, Any]]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    audio: NotRequired[str]
    video: NotRequired[str]
    rawBase64: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    screenshot: NotRequired[str]
    screenshotCropped: NotRequired[bool]
    highlights: NotRequired[list[SearchResponseDataWebItemHighlightsItem]]
    network: NotRequired[list[SearchResponseDataWebItemNetworkItem]]
    branding: NotRequired[SearchResponseDataWebItemBranding]
    networkDropped: NotRequired[int]
    json: NotRequired[dict[str, Any]]
    changeTracking: NotRequired[SearchResponseDataWebItemChangeTracking]
    attributes: NotRequired[list[SearchResponseDataWebItemAttributesItem]]
    actions: NotRequired[SearchResponseDataWebItemActions]
    warning: NotRequired[str]
    nextOffset: NotRequired[int]
    title: NotRequired[str]
    url: str
    snippet: NotRequired[str]
    date: NotRequired[str]
    imageUrl: NotRequired[str]
    position: int
    markdown: NotRequired[str]
    metadata: NotRequired[dict[str, str | float | list[str]]]


class SearchResponseDataImagesItem(TypedDict):
    title: NotRequired[str]
    imageUrl: str
    imageWidth: int
    imageHeight: int
    url: str
    position: int


class SearchResponseDataResearchItem(TypedDict):
    title: NotRequired[str]
    url: str
    doi: NotRequired[str]
    snippet: NotRequired[str]
    authors: NotRequired[list[str]]
    year: NotRequired[int]
    venue: NotRequired[str]
    type: NotRequired[str]
    citedByCount: int
    openAccessUrl: NotRequired[str]
    position: int


class SearchResponseDataVideosItem(TypedDict):
    url: str
    title: NotRequired[str]
    channel: NotRequired[str]
    channelUrl: NotRequired[str]
    publishedAt: NotRequired[str]
    durationSeconds: NotRequired[int]
    views: NotRequired[int]
    snippet: NotRequired[str]
    startSeconds: NotRequired[int]
    position: int


class SearchResponseData(TypedDict):
    web: NotRequired[list[SearchResponseDataWebItem]]
    news: NotRequired[list[SearchResponseDataNewsItem]]
    images: NotRequired[list[SearchResponseDataImagesItem]]
    research: NotRequired[list[SearchResponseDataResearchItem]]
    videos: NotRequired[list[SearchResponseDataVideosItem]]


class SearchResponse(TypedDict):
    success: Literal[True]
    data: NotRequired[SearchResponseData]
    warning: NotRequired[str]


class ScrapeFormatsItemOption2(TypedDict):
    type: Literal["changeTracking"]
    modes: NotRequired[list[SearchScrapeOptionsFormatsItemOption2ModesItem]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    tag: NotRequired[None]


class ScrapeFormatsItemOption8(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[bool]


class ScrapeResponseDataChangeTracking(TypedDict):
    previousScrapeAt: NotRequired[str]
    changeStatus: NotRequired[SearchResponseDataWebItemChangeTrackingStatus]
    visibility: NotRequired[str]
    diff: NotRequired[str]


class ScrapeResponseDataActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class ScrapeResponseDataActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[SearchResponseDataWebItemActionsScrapesItem]]
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
    costUsd: NotRequired[float]


class ScrapeResponseData(TypedDict):
    markdown: NotRequired[str]
    summary: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    attributes: NotRequired[list[SearchResponseDataWebItemAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    isTruncated: bool
    nextOffset: NotRequired[int]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[ScrapeResponseDataActions]
    warning: NotRequired[str]
    metadata: ScrapeResponseDataMetadata


class ScrapeResponse(TypedDict):
    success: Literal[True]
    data: ScrapeResponseData


class ExtractAgent(TypedDict):
    model: str


class ExtractWebhookOption1(TypedDict):
    url: str
    headers: NotRequired[dict[str, str]]
    metadata: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    events: NotRequired[list[ExtractWebhookOption1EventsItem]]


class ExtractScrapeOptions(TypedDict):
    onlyMainContent: NotRequired[bool]
    onlyCleanContent: NotRequired[bool]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    maxAge: NotRequired[int]
    minAge: NotRequired[int]
    headers: NotRequired[dict[str, str]]
    waitFor: NotRequired[int]
    mobile: NotRequired[bool]
    skipTlsVerification: NotRequired[bool]
    timeout: NotRequired[int]
    parsers: NotRequired[list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1]]
    actions: NotRequired[
        list[
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
    ]
    location: NotRequired[SearchScrapeOptionsLocation]
    removeBase64Images: NotRequired[bool]
    blockAds: NotRequired[bool]
    fastMode: NotRequired[bool]
    proxy: NotRequired[SearchScrapeOptionsProxy]
    storeInCache: NotRequired[bool]
    lockdown: NotRequired[bool]
    checkPromptInjection: NotRequired[bool]
    redactPII: NotRequired[bool | SearchScrapeOptionsRedactPIIOption1]
    profile: NotRequired[SearchScrapeOptionsProfile]
    zeroDataRetention: NotRequired[bool]


class ExtractResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    invalidURLs: list[str]


class BrowserTaskResponseData(TypedDict):
    id: NotRequired[str]
    status: BrowserTaskResponseDataStatus


class BrowserTaskResponse(TypedDict):
    success: Literal[True]
    data: BrowserTaskResponseData
    creditsUsed: int
    costUsd: float
    requestId: str


class BrowserTaskStatusResponseDataResult(TypedDict):
    done: bool
    answer: NotRequired[str]
    reason: NotRequired[str]
    steps: NotRequired[list[str]]
    url: NotRequired[str]
    title: NotRequired[str]
    pageText: NotRequired[str]
    seconds: NotRequired[float]
    fields: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    confidence: NotRequired[dict[str, float]]


class BrowserTaskStatusResponseData(TypedDict):
    status: BrowserTaskResponseDataStatus
    result: NotRequired[BrowserTaskStatusResponseDataResult]
    creditsUsed: int
    costUsd: float


class BrowserTaskStatusResponse(TypedDict):
    success: Literal[True]
    data: BrowserTaskStatusResponseData
    creditsUsed: int
    costUsd: float
    requestId: str


class ParseFormatsItemOption0(TypedDict):
    type: Literal["json"]
    prompt: NotRequired[str]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]


class ParseFormatsItemOption1Option1(TypedDict):
    type: ParseFormatsItemOption1Option0


class ParseParsersItem(TypedDict):
    type: Literal["pdf"]
    mode: NotRequired[SearchScrapeOptionsParsersItemOption1Mode]
    maxPages: NotRequired[int]
    pages: NotRequired[bool]
    blocks: NotRequired[bool]
    pageMarkers: NotRequired[bool]


class ParseOptions(TypedDict):
    formats: NotRequired[
        list[
            ParseFormatsItemOption0
            | ParseFormatsItemOption1Option0
            | ParseFormatsItemOption1Option1
        ]
    ]
    parsers: NotRequired[list[ParseParsersItem]]
    onlyMainContent: NotRequired[bool]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    removeBase64Images: NotRequired[bool]
    zeroDataRetention: NotRequired[bool]
    origin: NotRequired[str]
    integration: NotRequired[str]
    fastMode: NotRequired[Any]
    mobile: NotRequired[Any]
    blockAds: NotRequired[Any]
    skipTlsVerification: NotRequired[Any]
    timeout: NotRequired[Any]
    headers: NotRequired[Any]
    proxy: NotRequired[Any]
    location: NotRequired[Any]
    profile: NotRequired[Any]


class ParseResponseDataMetadata(TypedDict):
    title: NotRequired[str]
    contentType: NotRequired[str]
    numPages: NotRequired[int]
    ocrPages: NotRequired[int]
    costUsd: float


class ParseResponseData(TypedDict):
    markdown: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    summary: NotRequired[str]
    json: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    pages: NotRequired[list[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]]
    blocks: NotRequired[list[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]]
    warning: NotRequired[str]
    metadata: ParseResponseDataMetadata


class ParseResponse(TypedDict):
    success: Literal[True]
    data: ParseResponseData


class MapResponseLinksItem(TypedDict):
    url: NotRequired[str]
    title: NotRequired[str]
    description: NotRequired[str]


class MapResponse(TypedDict):
    success: Literal[True]
    links: list[MapResponseLinksItem]


class CrawlScrapeOptionsFormatsItemOption2(TypedDict):
    type: Literal["changeTracking"]
    modes: NotRequired[list[SearchScrapeOptionsFormatsItemOption2ModesItem]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    tag: NotRequired[None]


class CrawlScrapeOptionsFormatsItemOption8(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[bool]


class CrawlScrapeOptions(TypedDict):
    formats: NotRequired[
        list[
            SearchScrapeOptionsFormatsItemOption0
            | SearchScrapeOptionsFormatsItemOption1
            | CrawlScrapeOptionsFormatsItemOption2
            | SearchScrapeOptionsFormatsItemOption3
            | SearchScrapeOptionsFormatsItemOption4
            | SearchScrapeOptionsFormatsItemOption5
            | SearchScrapeOptionsFormatsItemOption6
            | SearchScrapeOptionsFormatsItemOption7
            | CrawlScrapeOptionsFormatsItemOption8
            | SearchScrapeOptionsFormatsItemOption9
        ]
    ]
    onlyMainContent: NotRequired[bool]
    onlyCleanContent: NotRequired[bool]
    includeTags: NotRequired[list[str]]
    excludeTags: NotRequired[list[str]]
    maxAge: NotRequired[int]
    minAge: NotRequired[int]
    headers: NotRequired[dict[str, str]]
    waitFor: NotRequired[int]
    mobile: NotRequired[bool]
    skipTlsVerification: NotRequired[bool]
    timeout: NotRequired[int]
    parsers: NotRequired[list[Literal["pdf"] | SearchScrapeOptionsParsersItemOption1]]
    actions: NotRequired[
        list[
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
    ]
    location: NotRequired[SearchScrapeOptionsLocation]
    removeBase64Images: NotRequired[bool]
    blockAds: NotRequired[bool]
    fastMode: NotRequired[bool]
    proxy: NotRequired[SearchScrapeOptionsProxy]
    storeInCache: NotRequired[bool]
    lockdown: NotRequired[bool]
    checkPromptInjection: NotRequired[bool]
    redactPII: NotRequired[bool | SearchScrapeOptionsRedactPIIOption1]
    profile: NotRequired[SearchScrapeOptionsProfile]
    zeroDataRetention: NotRequired[bool]


class CrawlWebhookOption1(TypedDict):
    url: str
    headers: NotRequired[dict[str, str]]
    metadata: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    events: NotRequired[list[ExtractWebhookOption1EventsItem]]


class CrawlResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    url: NotRequired[str]
    status: NotRequired[Literal["scraping"]]
    queuePosition: NotRequired[int]


class CrawlStatusResponseErrorsItem(TypedDict):
    id: NotRequired[str]
    timestamp: NotRequired[str]
    url: NotRequired[str]
    error: NotRequired[str]
    code: NotRequired[str]
    message: NotRequired[str]
    retryable: bool
    at: NotRequired[str]


class CrawlStatusResponseDataItemActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class CrawlStatusResponseDataItemActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[SearchResponseDataWebItemActionsScrapesItem]]
    javascriptReturns: NotRequired[list[CrawlStatusResponseDataItemActionsJavascriptReturnsItem]]
    pdfs: NotRequired[list[str]]


class CrawlStatusResponseDataItemMetadata(TypedDict):
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
    costUsd: NotRequired[float]


class CrawlStatusResponseDataItem(TypedDict):
    markdown: NotRequired[str]
    summary: NotRequired[str]
    html: NotRequired[str]
    rawHtml: NotRequired[str]
    links: NotRequired[list[str]]
    images: NotRequired[list[str]]
    attributes: NotRequired[list[SearchResponseDataWebItemAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    isTruncated: bool
    nextOffset: NotRequired[int]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[CrawlStatusResponseDataItemActions]
    warning: NotRequired[str]
    metadata: CrawlStatusResponseDataItemMetadata


class CrawlStatusResponse(TypedDict):
    success: Literal[True]
    status: CrawlStatusResponseStatus
    queuePosition: NotRequired[int]
    total: int
    completed: int
    failed: int
    error: NotRequired[str]
    errors: list[CrawlStatusResponseErrorsItem]
    creditsUsed: int
    costUsd: float
    createdAt: NotRequired[str]
    completedAt: NotRequired[str]
    duration: NotRequired[float]
    expiresAt: NotRequired[str]
    next: NotRequired[str]
    checkpoint: NotRequired[str]
    message: NotRequired[str]
    data: list[CrawlStatusResponseDataItem]


class CrawlCancelResponse(TypedDict):
    status: Literal["cancelled"]
    success: Literal[True]


class BatchScrapeWebhookOption1(TypedDict):
    url: str
    headers: NotRequired[dict[str, str]]
    metadata: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    events: NotRequired[list[ExtractWebhookOption1EventsItem]]


class BatchScrapeFormatsItemOption2(TypedDict):
    type: Literal["changeTracking"]
    modes: NotRequired[list[SearchScrapeOptionsFormatsItemOption2ModesItem]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    tag: NotRequired[None]


class BatchScrapeFormatsItemOption8(TypedDict):
    type: Literal["json"]
    parser: NotRequired[str]
    options: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    schema: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    prompt: NotRequired[str]
    rules: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    checkPromptInjection: NotRequired[bool]


class BatchScrapeResponse(TypedDict):
    success: Literal[True]
    id: NotRequired[str]
    url: NotRequired[str]
    status: NotRequired[Literal["scraping"]]
    queuePosition: NotRequired[int]
    invalidURLs: list[str]


class BatchScrapeStatusResponseDataItemActionsJavascriptReturnsItem(TypedDict):
    type: NotRequired[str]
    value: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]


class BatchScrapeStatusResponseDataItemActions(TypedDict):
    screenshots: NotRequired[list[str]]
    scrapes: NotRequired[list[SearchResponseDataWebItemActionsScrapesItem]]
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
    attributes: NotRequired[list[SearchResponseDataWebItemAttributesItem]]
    screenshot: NotRequired[str]
    json: NotRequired[str | float | bool | None | list[Any] | dict[str, Any]]
    highlights: NotRequired[str]
    isTruncated: bool
    nextOffset: NotRequired[int]
    changeTracking: NotRequired[ScrapeResponseDataChangeTracking]
    branding: NotRequired[dict[str, str | float | bool | None | list[Any] | dict[str, Any]]]
    actions: NotRequired[BatchScrapeStatusResponseDataItemActions]
    warning: NotRequired[str]
    metadata: CrawlStatusResponseDataItemMetadata


class BatchScrapeStatusResponse(TypedDict):
    success: Literal[True]
    status: CrawlStatusResponseStatus
    queuePosition: NotRequired[int]
    total: int
    completed: int
    failed: int
    error: NotRequired[str]
    errors: list[CrawlStatusResponseErrorsItem]
    creditsUsed: int
    costUsd: float
    createdAt: NotRequired[str]
    completedAt: NotRequired[str]
    duration: NotRequired[float]
    expiresAt: NotRequired[str]
    next: NotRequired[str]
    checkpoint: NotRequired[str]
    data: list[BatchScrapeStatusResponseDataItem]
