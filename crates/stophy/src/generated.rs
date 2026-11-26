use crate::{Client, Error, RequestOptions, Response};
use reqwest::Method;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;

pub type SearchInputSchema0Schema = Value;

pub type SearchInputSchema1Schema = Value;

pub type SearchInputSchema2Schema = Value;

pub type SearchSchema0Schema = Value;

pub type ScrapeInputSchema0Schema = Value;

pub type ScrapeInputSchema1Schema = Value;

pub type ScrapeInputSchema2Schema = Value;

pub type ScrapeSchema0Schema = Value;

pub type ExtractInputSchema0Schema = Value;

pub type BrowserTaskInputSchema0Schema = Value;

pub type BrowserTaskStatusSchema0Schema = Value;

pub type ParseInputSchema0Schema = Value;

pub type ParseSchema0Schema = Value;

pub type CrawlInputSchema0Schema = Value;

pub type CrawlInputSchema1Schema = Value;

pub type CrawlInputSchema2Schema = Value;

pub type CrawlStatusSchema0Schema = Value;

pub type BatchScrapeInputSchema0Schema = Value;

pub type BatchScrapeInputSchema1Schema = Value;

pub type BatchScrapeInputSchema2Schema = Value;

pub type BatchScrapeStatusSchema0Schema = Value;

pub type ExtractResultSchema0Schema = Value;

pub type ListEndpoints26Schema0Schema = Value;

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractResultResponseStatus {
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractResultResponse {
    pub success: bool,
    pub status: ExtractResultResponseStatus,
    pub data: BTreeMap<String, ExtractResultSchema0Schema>,
    pub confidence: BTreeMap<String, f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub urls: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sources: Option<BTreeMap<String, Vec<String>>>,
    #[serde(rename = "expiresAt")]
    pub expires_at: String,
    #[serde(
        rename = "tokensUsed",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub tokens_used: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SignUpResponseData {
    #[serde(rename = "claimUrl")]
    pub claim_url: String,
    pub code: String,
    #[serde(rename = "expiresAt")]
    pub expires_at: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SignUpResponse {
    pub success: bool,
    pub data: SignUpResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct PollSignUpRequest {
    pub code: String,
}
impl PollSignUpRequest {
    pub fn new(code: String) -> Self {
        Self { code }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub enum PollSignUpResponseDataStatus {
    #[serde(rename = "waiting")]
    Waiting,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct PollSignUpResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<PollSignUpResponseDataStatus>,
    #[serde(rename = "claimUrl", default, skip_serializing_if = "Option::is_none")]
    pub claim_url: Option<String>,
    #[serde(rename = "apiKey", default, skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct PollSignUpResponse {
    pub success: bool,
    pub data: PollSignUpResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum GetLimitsResponseDataTier {
    #[serde(rename = "free")]
    Free,
    #[serde(rename = "paid")]
    Paid,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLimitsResponseDataRateLimit {
    #[serde(
        rename = "limitPerMinute",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub limit_per_minute: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub remaining: Option<i64>,
    #[serde(rename = "resetsAt", default, skip_serializing_if = "Option::is_none")]
    pub resets_at: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLimitsResponseDataPerMinute {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub calls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub jobs: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub interact: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reads: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLimitsResponseDataConcurrency {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(rename = "inUse", default, skip_serializing_if = "Option::is_none")]
    pub in_use: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLimitsResponseDataPaidLimitsPerMinute {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub calls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub jobs: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub interact: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reads: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLimitsResponseDataPaidLimits {
    #[serde(rename = "perMinute", default, skip_serializing_if = "Option::is_none")]
    pub per_minute: Option<GetLimitsResponseDataPaidLimitsPerMinute>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub concurrency: Option<i64>,
    #[serde(
        rename = "jobsAtOnce",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub jobs_at_once: Option<i64>,
    #[serde(
        rename = "queuedJobs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub queued_jobs: Option<i64>,
    #[serde(
        rename = "sessionsAtOnce",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub sessions_at_once: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum GetLimitsResponseDataBillingUrl {
    #[serde(rename = "https://stophy.dev/billing")]
    HttpsStophyDevBilling,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct GetLimitsResponseData {
    pub tier: GetLimitsResponseDataTier,
    #[serde(rename = "balanceUsd")]
    pub balance_usd: f64,
    #[serde(rename = "rateLimit")]
    pub rate_limit: Option<GetLimitsResponseDataRateLimit>,
    #[serde(rename = "perMinute")]
    pub per_minute: GetLimitsResponseDataPerMinute,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub concurrency: Option<GetLimitsResponseDataConcurrency>,
    #[serde(rename = "jobsAtOnce")]
    pub jobs_at_once: i64,
    #[serde(rename = "queuedJobs")]
    pub queued_jobs: i64,
    #[serde(rename = "sessionsAtOnce")]
    pub sessions_at_once: i64,
    #[serde(
        rename = "paidLimits",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub paid_limits: Option<GetLimitsResponseDataPaidLimits>,
    #[serde(rename = "keyExpiresAt")]
    pub key_expires_at: Option<String>,
    #[serde(rename = "billingUrl")]
    pub billing_url: GetLimitsResponseDataBillingUrl,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct GetLimitsResponse {
    pub success: bool,
    pub data: GetLimitsResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct GetUsageResponse {
    #[serde(rename = "balanceMicros")]
    pub balance_micros: i64,
    #[serde(rename = "balanceUsd")]
    pub balance_usd: f64,
    #[serde(rename = "costUsd")]
    pub cost_usd: f64,
    #[serde(rename = "requestCount")]
    pub request_count: i64,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLogsQuery {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub days: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub page: Option<i64>,
    #[serde(rename = "apiKeyId", default, skip_serializing_if = "Option::is_none")]
    pub api_key_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct GetLogsResponseLogsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "requestId", default, skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    #[serde(rename = "createdAt", default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub endpoint: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub method: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub response: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub credits: Option<f64>,
    #[serde(rename = "costUsd", default, skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(
        rename = "durationMs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub duration_ms: Option<i64>,
    #[serde(rename = "apiKeyId", default, skip_serializing_if = "Option::is_none")]
    pub api_key_id: Option<String>,
    #[serde(
        rename = "apiKeyName",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub api_key_name: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct GetLogsResponse {
    pub endpoints: Vec<String>,
    pub logs: Vec<GetLogsResponseLogsItem>,
    pub page: i64,
    #[serde(rename = "pageSize")]
    pub page_size: i64,
    pub total: i64,
    #[serde(rename = "totalPages")]
    pub total_pages: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct RevokeKeyResponse {
    pub success: bool,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ListParsersResponseDataParsersItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub takes: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub example: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<Vec<BTreeMap<String, Value>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub returns: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub price: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub credits: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub keyless: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ListParsersResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<ListParsersResponseDataParsersItem>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ListParsersResponse {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub success: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data: Option<ListParsersResponseData>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ListEndpointsResponseSourcesItemKind {
    #[serde(rename = "site")]
    Site,
    #[serde(rename = "aiAnswers")]
    AiAnswers,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ListEndpointsResponseSourcesItem {
    pub id: String,
    pub name: String,
    pub summary: String,
    pub kind: ListEndpointsResponseSourcesItemKind,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ListEndpointsResponseEndpointsItemMethod {
    #[serde(rename = "POST")]
    Post,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ListEndpointsResponseEndpointsItem {
    pub id: String,
    pub title: String,
    pub summary: String,
    #[serde(rename = "bestWhen")]
    pub best_when: Option<String>,
    pub method: ListEndpointsResponseEndpointsItemMethod,
    pub path: String,
    pub credits: i64,
    #[serde(rename = "costUsd", default, skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(
        rename = "maxCostUsd",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_cost_usd: Option<f64>,
    pub pricing: Option<String>,
    pub keyless: bool,
    #[serde(rename = "cacheTtlSeconds")]
    pub cache_ttl_seconds: i64,
    pub input: BTreeMap<String, ListEndpoints26Schema0Schema>,
    pub example: Option<BTreeMap<String, ListEndpoints26Schema0Schema>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ListEndpointsResponse {
    pub sources: Vec<ListEndpointsResponseSourcesItem>,
    pub endpoints: Vec<ListEndpointsResponseEndpointsItem>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchDeveloperRequestTypes {
    String(String),
    Array(Vec<String>),
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchDeveloperRequestRepos {
    String(String),
    Array(Vec<String>),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchDeveloperRequestPassagesString {
    #[serde(rename = "true")]
    True,
    #[serde(rename = "false")]
    False,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchDeveloperRequestPassages {
    Boolean(bool),
    String(SearchDeveloperRequestPassagesString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchDeveloperRequest {
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub k: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub types: Option<SearchDeveloperRequestTypes>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repos: Option<SearchDeveloperRequestRepos>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub min_stars: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub max_stars: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub passages: Option<SearchDeveloperRequestPassages>,
}
impl SearchDeveloperRequest {
    pub fn new(query: String) -> Self {
        Self {
            query,
            k: None,
            types: None,
            repos: None,
            language: None,
            min_stars: None,
            max_stars: None,
            passages: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchDeveloperResponseResultsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub passages: Option<Vec<BTreeMap<String, Value>>>,
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub stars: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub state: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchDeveloperResponse {
    pub success: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub partial: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub results: Option<Vec<SearchDeveloperResponseResultsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repos: Option<Vec<BTreeMap<String, Value>>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestSourcesItemString {
    #[serde(rename = "web")]
    Web,
    #[serde(rename = "news")]
    News,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestSourcesItemWebType {
    #[serde(rename = "web")]
    Web,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestSourcesItemWeb {
    #[serde(rename = "type")]
    pub type_: SearchRequestSourcesItemWebType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tbs: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lang: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestSourcesItemObjectType {
    #[serde(rename = "news")]
    News,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestSourcesItemObject {
    #[serde(rename = "type")]
    pub type_: SearchRequestSourcesItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestSourcesItem {
    String(SearchRequestSourcesItemString),
    Web(SearchRequestSourcesItemWeb),
    Object(SearchRequestSourcesItemObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestCategoriesItemString {
    #[serde(rename = "research")]
    Research,
    #[serde(rename = "pdf")]
    Pdf,
    #[serde(rename = "videos")]
    Videos,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestCategoriesItemObjectType {
    #[serde(rename = "research")]
    Research,
    #[serde(rename = "pdf")]
    Pdf,
    #[serde(rename = "videos")]
    Videos,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestCategoriesItemObject {
    #[serde(rename = "type")]
    pub type_: SearchRequestCategoriesItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestCategoriesItem {
    String(SearchRequestCategoriesItemString),
    Object(SearchRequestCategoriesItemObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
    #[serde(rename = "screenshot")]
    Screenshot,
    #[serde(rename = "changeTracking")]
    ChangeTracking,
    #[serde(rename = "product")]
    Product,
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemObject {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemChangeTrackingType {
    #[serde(rename = "changeTracking")]
    ChangeTracking,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemChangeTrackingModesItem {
    #[serde(rename = "git-diff")]
    GitDiff,
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemChangeTracking {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemChangeTrackingType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modes: Option<Vec<SearchRequestScrapeOptionsFormatsItemChangeTrackingModesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, SearchInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tag: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemQuestionType {
    #[serde(rename = "question")]
    Question,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemQuestion {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemQuestionType,
    pub question: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemProductType {
    #[serde(rename = "product")]
    Product,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemProduct {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemProductType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemMenuType {
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemMenu {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemMenuType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<SearchRequestScrapeOptionsFormatsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemHighlightsType {
    #[serde(rename = "highlights")]
    Highlights,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemHighlights {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemHighlightsType,
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub count: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parser: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<BTreeMap<String, SearchInputSchema1Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, SearchInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rules: Option<BTreeMap<String, SearchInputSchema2Schema>>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsFormatsItemAttributesType {
    #[serde(rename = "attributes")]
    Attributes,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemAttributesSelectorsItem {
    pub selector: String,
    pub attribute: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsFormatsItemAttributes {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsFormatsItemAttributesType,
    pub selectors: Vec<SearchRequestScrapeOptionsFormatsItemAttributesSelectorsItem>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestScrapeOptionsFormatsItem {
    String(SearchRequestScrapeOptionsFormatsItemString),
    Object(SearchRequestScrapeOptionsFormatsItemObject),
    ChangeTracking(SearchRequestScrapeOptionsFormatsItemChangeTracking),
    Question(SearchRequestScrapeOptionsFormatsItemQuestion),
    Product(SearchRequestScrapeOptionsFormatsItemProduct),
    Menu(SearchRequestScrapeOptionsFormatsItemMenu),
    Screenshot(SearchRequestScrapeOptionsFormatsItemScreenshot),
    Highlights(SearchRequestScrapeOptionsFormatsItemHighlights),
    Json(SearchRequestScrapeOptionsFormatsItemJson),
    Attributes(SearchRequestScrapeOptionsFormatsItemAttributes),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsParsersItemPdf {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsParsersItemPdf2Type {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsParsersItemPdf2Mode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsParsersItemPdf2 {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsParsersItemPdf2Type,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<SearchRequestScrapeOptionsParsersItemPdf2Mode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestScrapeOptionsParsersItem {
    Pdf(SearchRequestScrapeOptionsParsersItemPdf),
    Pdf2(SearchRequestScrapeOptionsParsersItemPdf2),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemWaitType {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemWait {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemWaitType,
    pub milliseconds: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemWait2Type {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemWait2 {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemWait2Type,
    pub selector: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemClickType {
    #[serde(rename = "click")]
    Click,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemClick {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemClickType,
    pub selector: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemWriteType {
    #[serde(rename = "write")]
    Write,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemWrite {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemWriteType,
    pub text: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemPressType {
    #[serde(rename = "press")]
    Press,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemPress {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemPressType,
    pub key: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemScrollType {
    #[serde(rename = "scroll")]
    Scroll,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemScrollDirection {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "left")]
    Left,
    #[serde(rename = "right")]
    Right,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemScrollAmountString {
    #[serde(rename = "viewport")]
    Viewport,
    #[serde(rename = "max")]
    Max,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestScrapeOptionsActionsItemScrollAmount {
    Integer(i64),
    String(SearchRequestScrapeOptionsActionsItemScrollAmountString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemScroll {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemScrollType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub direction: Option<SearchRequestScrapeOptionsActionsItemScrollDirection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub amount: Option<SearchRequestScrapeOptionsActionsItemScrollAmount>,
    #[serde(
        rename = "maxScrolls",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_scrolls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<SearchRequestScrapeOptionsActionsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemScrapeType {
    #[serde(rename = "scrape")]
    Scrape,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemScrape {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemScrapeType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemExecuteJavascriptType {
    #[serde(rename = "executeJavascript")]
    ExecuteJavascript,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemExecuteJavascript {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemExecuteJavascriptType,
    pub script: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemPdfType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemPdfFormat {
    #[serde(rename = "Letter")]
    Letter,
    #[serde(rename = "Legal")]
    Legal,
    #[serde(rename = "Tabloid")]
    Tabloid,
    #[serde(rename = "Ledger")]
    Ledger,
    #[serde(rename = "A0")]
    A0,
    #[serde(rename = "A1")]
    A1,
    #[serde(rename = "A2")]
    A2,
    #[serde(rename = "A3")]
    A3,
    #[serde(rename = "A4")]
    A4,
    #[serde(rename = "A5")]
    A5,
    #[serde(rename = "A6")]
    A6,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemPdf {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemPdfType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<SearchRequestScrapeOptionsActionsItemPdfFormat>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub landscape: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<f64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsActionsItemPerformType {
    #[serde(rename = "perform")]
    Perform,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsActionsItemPerform {
    #[serde(rename = "type")]
    pub type_: SearchRequestScrapeOptionsActionsItemPerformType,
    pub action: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestScrapeOptionsActionsItem {
    Wait(SearchRequestScrapeOptionsActionsItemWait),
    Wait2(SearchRequestScrapeOptionsActionsItemWait2),
    Click(SearchRequestScrapeOptionsActionsItemClick),
    Write(SearchRequestScrapeOptionsActionsItemWrite),
    Press(SearchRequestScrapeOptionsActionsItemPress),
    Scroll(SearchRequestScrapeOptionsActionsItemScroll),
    Screenshot(SearchRequestScrapeOptionsActionsItemScreenshot),
    Scrape(SearchRequestScrapeOptionsActionsItemScrape),
    ExecuteJavascript(SearchRequestScrapeOptionsActionsItemExecuteJavascript),
    Pdf(SearchRequestScrapeOptionsActionsItemPdf),
    Perform(SearchRequestScrapeOptionsActionsItemPerform),
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchRequestScrapeOptionsLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsRedactPiiObjectMode {
    #[serde(rename = "accurate")]
    Accurate,
    #[serde(rename = "aggressive")]
    Aggressive,
    #[serde(rename = "fast")]
    Fast,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsRedactPiiObjectEntitiesItem {
    #[serde(rename = "PERSON")]
    Person,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "LOCATION")]
    Location,
    #[serde(rename = "FINANCIAL")]
    Financial,
    #[serde(rename = "SECRET")]
    Secret,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchRequestScrapeOptionsRedactPiiObjectReplaceStyle {
    #[serde(rename = "tag")]
    Tag,
    #[serde(rename = "mask")]
    Mask,
    #[serde(rename = "remove")]
    Remove,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchRequestScrapeOptionsRedactPiiObject {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<SearchRequestScrapeOptionsRedactPiiObjectMode>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub entities: Option<Vec<SearchRequestScrapeOptionsRedactPiiObjectEntitiesItem>>,
    #[serde(
        rename = "replaceStyle",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub replace_style: Option<SearchRequestScrapeOptionsRedactPiiObjectReplaceStyle>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchRequestScrapeOptionsRedactPii {
    Boolean(bool),
    Object(SearchRequestScrapeOptionsRedactPiiObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequestScrapeOptionsProfile {
    pub name: String,
    #[serde(
        rename = "saveChanges",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub save_changes: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchRequestScrapeOptions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<SearchRequestScrapeOptionsFormatsItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "onlyCleanContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_clean_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(rename = "minAge", default, skip_serializing_if = "Option::is_none")]
    pub min_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(rename = "waitFor", default, skip_serializing_if = "Option::is_none")]
    pub wait_for: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<bool>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<SearchRequestScrapeOptionsParsersItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<SearchRequestScrapeOptionsActionsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<SearchRequestScrapeOptionsLocation>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<bool>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<bool>,
    #[serde(
        rename = "storeInCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub store_in_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lockdown: Option<bool>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
    #[serde(rename = "redactPII", default, skip_serializing_if = "Option::is_none")]
    pub redact_pii: Option<SearchRequestScrapeOptionsRedactPii>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<SearchRequestScrapeOptionsProfile>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchRequest {
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sources: Option<Vec<SearchRequestSourcesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub categories: Option<Vec<SearchRequestCategoriesItem>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(
        rename = "scrapeLimit",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub scrape_limit: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tbs: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lang: Option<String>,
    #[serde(
        rename = "includeDomains",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_domains: Option<Vec<String>>,
    #[serde(
        rename = "excludeDomains",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_domains: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub safe: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(
        rename = "ignoreInvalidURLs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_invalid_ur_ls: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<bool>,
    #[serde(
        rename = "scrapeOptions",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub scrape_options: Option<SearchRequestScrapeOptions>,
}
impl SearchRequest {
    pub fn new(query: String) -> Self {
        Self {
            query,
            sources: None,
            categories: None,
            max_age: None,
            limit: None,
            scrape_limit: None,
            tbs: None,
            location: None,
            country: None,
            lang: None,
            include_domains: None,
            exclude_domains: None,
            safe: None,
            timeout: None,
            ignore_invalid_ur_ls: None,
            highlights: None,
            scrape_options: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItemPagesItem {
    #[serde(rename = "pageNumber")]
    pub page_number: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemHighlightsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItemNetworkItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub method: Option<String>,
    pub status: i64,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchResponseDataWebItemBrandingColorScheme {
    #[serde(rename = "light")]
    Light,
    #[serde(rename = "dark")]
    Dark,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingColors {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub secondary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub accent: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(
        rename = "textPrimary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub text_primary: Option<String>,
    #[serde(
        rename = "textSecondary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub text_secondary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub success: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItemBrandingFontsItem {
    pub family: String,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingTypographyFontFamilies {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heading: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingTypographyFontSizes {
    #[serde(rename = "h1", default, skip_serializing_if = "Option::is_none")]
    pub h_1: Option<String>,
    #[serde(rename = "h2", default, skip_serializing_if = "Option::is_none")]
    pub h_2: Option<String>,
    #[serde(rename = "h3", default, skip_serializing_if = "Option::is_none")]
    pub h_3: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingTypographyFontWeights {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub light: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub regular: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub medium: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bold: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingTypographyLineHeights {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heading: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingTypography {
    #[serde(
        rename = "fontFamilies",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub font_families: Option<SearchResponseDataWebItemBrandingTypographyFontFamilies>,
    #[serde(rename = "fontSizes", default, skip_serializing_if = "Option::is_none")]
    pub font_sizes: Option<SearchResponseDataWebItemBrandingTypographyFontSizes>,
    #[serde(
        rename = "fontWeights",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub font_weights: Option<SearchResponseDataWebItemBrandingTypographyFontWeights>,
    #[serde(
        rename = "lineHeights",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub line_heights: Option<SearchResponseDataWebItemBrandingTypographyLineHeights>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingSpacing {
    #[serde(rename = "baseUnit", default, skip_serializing_if = "Option::is_none")]
    pub base_unit: Option<i64>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub padding: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub margins: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingComponentsButtonPrimary {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(rename = "textColor", default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingComponentsButtonSecondary {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(rename = "textColor", default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    #[serde(
        rename = "borderColor",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_color: Option<String>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingComponents {
    #[serde(
        rename = "buttonPrimary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub button_primary: Option<SearchResponseDataWebItemBrandingComponentsButtonPrimary>,
    #[serde(
        rename = "buttonSecondary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub button_secondary: Option<SearchResponseDataWebItemBrandingComponentsButtonSecondary>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub input: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemBrandingImages {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub favicon: Option<String>,
    #[serde(rename = "ogImage", default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItemBranding {
    #[serde(rename = "colorScheme")]
    pub color_scheme: SearchResponseDataWebItemBrandingColorScheme,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub colors: Option<SearchResponseDataWebItemBrandingColors>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fonts: Option<Vec<SearchResponseDataWebItemBrandingFontsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub typography: Option<SearchResponseDataWebItemBrandingTypography>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacing: Option<SearchResponseDataWebItemBrandingSpacing>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub components: Option<SearchResponseDataWebItemBrandingComponents>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub icons: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<SearchResponseDataWebItemBrandingImages>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub animations: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub layout: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub personality: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchResponseDataWebItemChangeTrackingStatus {
    #[serde(rename = "new")]
    New,
    #[serde(rename = "same")]
    Same,
    #[serde(rename = "changed")]
    Changed,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemChangeTrackingJsonValue {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub previous: Option<SearchSchema0Schema>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub current: Option<SearchSchema0Schema>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItemChangeTracking {
    pub status: SearchResponseDataWebItemChangeTrackingStatus,
    #[serde(
        rename = "previousAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub previous_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diff: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BTreeMap<String, SearchResponseDataWebItemChangeTrackingJsonValue>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemAttributesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemActionsScrapesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemActionsJavascriptReturnsItem {
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataWebItemActions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scrapes: Option<Vec<SearchResponseDataWebItemActionsScrapesItem>>,
    #[serde(
        rename = "javascriptReturns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub javascript_returns: Option<Vec<SearchResponseDataWebItemActionsJavascriptReturnsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pdfs: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchResponseDataWebItemMetadataValue {
    String(String),
    Number(f64),
    Array(Vec<String>),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchResponseDataWebItemCategory {
    #[serde(rename = "github")]
    Github,
    #[serde(rename = "research")]
    Research,
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataWebItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<Vec<SearchResponseDataWebItemPagesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<Vec<BTreeMap<String, SearchSchema0Schema>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub answer: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub product: Option<BTreeMap<String, Value>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub menu: Option<BTreeMap<String, Value>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub audio: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub video: Option<String>,
    #[serde(rename = "rawBase64", default, skip_serializing_if = "Option::is_none")]
    pub raw_base_64: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshot: Option<String>,
    #[serde(
        rename = "screenshotCropped",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub screenshot_cropped: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<Vec<SearchResponseDataWebItemHighlightsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub network: Option<Vec<SearchResponseDataWebItemNetworkItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branding: Option<SearchResponseDataWebItemBranding>,
    #[serde(
        rename = "networkDropped",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub network_dropped: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BTreeMap<String, Value>>,
    #[serde(
        rename = "changeTracking",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_tracking: Option<SearchResponseDataWebItemChangeTracking>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<SearchResponseDataWebItemAttributesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<SearchResponseDataWebItemActions>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    #[serde(
        rename = "nextOffset",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub next_offset: Option<i64>,
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub position: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, SearchResponseDataWebItemMetadataValue>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub category: Option<SearchResponseDataWebItemCategory>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItemPagesItem {
    #[serde(rename = "pageNumber")]
    pub page_number: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemHighlightsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItemNetworkItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub method: Option<String>,
    pub status: i64,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchResponseDataNewsItemBrandingColorScheme {
    #[serde(rename = "light")]
    Light,
    #[serde(rename = "dark")]
    Dark,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingColors {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub secondary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub accent: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(
        rename = "textPrimary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub text_primary: Option<String>,
    #[serde(
        rename = "textSecondary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub text_secondary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub success: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItemBrandingFontsItem {
    pub family: String,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingTypographyFontFamilies {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub primary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heading: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingTypographyFontSizes {
    #[serde(rename = "h1", default, skip_serializing_if = "Option::is_none")]
    pub h_1: Option<String>,
    #[serde(rename = "h2", default, skip_serializing_if = "Option::is_none")]
    pub h_2: Option<String>,
    #[serde(rename = "h3", default, skip_serializing_if = "Option::is_none")]
    pub h_3: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingTypographyFontWeights {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub light: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub regular: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub medium: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub bold: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingTypographyLineHeights {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heading: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingTypography {
    #[serde(
        rename = "fontFamilies",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub font_families: Option<SearchResponseDataNewsItemBrandingTypographyFontFamilies>,
    #[serde(rename = "fontSizes", default, skip_serializing_if = "Option::is_none")]
    pub font_sizes: Option<SearchResponseDataNewsItemBrandingTypographyFontSizes>,
    #[serde(
        rename = "fontWeights",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub font_weights: Option<SearchResponseDataNewsItemBrandingTypographyFontWeights>,
    #[serde(
        rename = "lineHeights",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub line_heights: Option<SearchResponseDataNewsItemBrandingTypographyLineHeights>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingSpacing {
    #[serde(rename = "baseUnit", default, skip_serializing_if = "Option::is_none")]
    pub base_unit: Option<i64>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub padding: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub margins: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingComponentsButtonPrimary {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(rename = "textColor", default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingComponentsButtonSecondary {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background: Option<String>,
    #[serde(rename = "textColor", default, skip_serializing_if = "Option::is_none")]
    pub text_color: Option<String>,
    #[serde(
        rename = "borderColor",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_color: Option<String>,
    #[serde(
        rename = "borderRadius",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub border_radius: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingComponents {
    #[serde(
        rename = "buttonPrimary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub button_primary: Option<SearchResponseDataNewsItemBrandingComponentsButtonPrimary>,
    #[serde(
        rename = "buttonSecondary",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub button_secondary: Option<SearchResponseDataNewsItemBrandingComponentsButtonSecondary>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub input: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemBrandingImages {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub favicon: Option<String>,
    #[serde(rename = "ogImage", default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItemBranding {
    #[serde(rename = "colorScheme")]
    pub color_scheme: SearchResponseDataNewsItemBrandingColorScheme,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub logo: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub colors: Option<SearchResponseDataNewsItemBrandingColors>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fonts: Option<Vec<SearchResponseDataNewsItemBrandingFontsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub typography: Option<SearchResponseDataNewsItemBrandingTypography>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub spacing: Option<SearchResponseDataNewsItemBrandingSpacing>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub components: Option<SearchResponseDataNewsItemBrandingComponents>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub icons: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<SearchResponseDataNewsItemBrandingImages>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub animations: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub layout: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub personality: Option<BTreeMap<String, String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum SearchResponseDataNewsItemChangeTrackingStatus {
    #[serde(rename = "new")]
    New,
    #[serde(rename = "same")]
    Same,
    #[serde(rename = "changed")]
    Changed,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemChangeTrackingJsonValue {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub previous: Option<SearchSchema0Schema>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub current: Option<SearchSchema0Schema>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItemChangeTracking {
    pub status: SearchResponseDataNewsItemChangeTrackingStatus,
    #[serde(
        rename = "previousAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub previous_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diff: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BTreeMap<String, SearchResponseDataNewsItemChangeTrackingJsonValue>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemAttributesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemActionsScrapesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemActionsJavascriptReturnsItem {
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseDataNewsItemActions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scrapes: Option<Vec<SearchResponseDataNewsItemActionsScrapesItem>>,
    #[serde(
        rename = "javascriptReturns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub javascript_returns: Option<Vec<SearchResponseDataNewsItemActionsJavascriptReturnsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pdfs: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum SearchResponseDataNewsItemMetadataValue {
    String(String),
    Number(f64),
    Array(Vec<String>),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataNewsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<Vec<SearchResponseDataNewsItemPagesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<Vec<BTreeMap<String, SearchSchema0Schema>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub answer: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub product: Option<BTreeMap<String, Value>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub menu: Option<BTreeMap<String, Value>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub audio: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub video: Option<String>,
    #[serde(rename = "rawBase64", default, skip_serializing_if = "Option::is_none")]
    pub raw_base_64: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshot: Option<String>,
    #[serde(
        rename = "screenshotCropped",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub screenshot_cropped: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<Vec<SearchResponseDataNewsItemHighlightsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub network: Option<Vec<SearchResponseDataNewsItemNetworkItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branding: Option<SearchResponseDataNewsItemBranding>,
    #[serde(
        rename = "networkDropped",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub network_dropped: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BTreeMap<String, Value>>,
    #[serde(
        rename = "changeTracking",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_tracking: Option<SearchResponseDataNewsItemChangeTracking>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<SearchResponseDataNewsItemAttributesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<SearchResponseDataNewsItemActions>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    #[serde(
        rename = "nextOffset",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub next_offset: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub snippet: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub date: Option<String>,
    #[serde(rename = "imageUrl", default, skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,
    pub position: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, SearchResponseDataNewsItemMetadataValue>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataImagesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
    #[serde(rename = "imageWidth")]
    pub image_width: i64,
    #[serde(rename = "imageHeight")]
    pub image_height: i64,
    pub url: String,
    pub position: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataResearchItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub doi: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub snippet: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub authors: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub year: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub venue: Option<String>,
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(rename = "citedByCount")]
    pub cited_by_count: i64,
    #[serde(
        rename = "openAccessUrl",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub open_access_url: Option<String>,
    pub position: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponseDataVideosItem {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub channel: Option<String>,
    #[serde(
        rename = "channelUrl",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub channel_url: Option<String>,
    #[serde(
        rename = "publishedAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub published_at: Option<String>,
    #[serde(
        rename = "durationSeconds",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub duration_seconds: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub views: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub snippet: Option<String>,
    #[serde(
        rename = "startSeconds",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub start_seconds: Option<i64>,
    pub position: i64,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct SearchResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub web: Option<Vec<SearchResponseDataWebItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub news: Option<Vec<SearchResponseDataNewsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<SearchResponseDataImagesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub research: Option<Vec<SearchResponseDataResearchItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub videos: Option<Vec<SearchResponseDataVideosItem>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct SearchResponse {
    pub success: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub data: Option<SearchResponseData>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
    #[serde(rename = "screenshot")]
    Screenshot,
    #[serde(rename = "changeTracking")]
    ChangeTracking,
    #[serde(rename = "product")]
    Product,
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemObject {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemChangeTrackingType {
    #[serde(rename = "changeTracking")]
    ChangeTracking,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemChangeTrackingModesItem {
    #[serde(rename = "git-diff")]
    GitDiff,
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemChangeTracking {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemChangeTrackingType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modes: Option<Vec<ScrapeRequestFormatsItemChangeTrackingModesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, ScrapeInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tag: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemQuestionType {
    #[serde(rename = "question")]
    Question,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemQuestion {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemQuestionType,
    pub question: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemProductType {
    #[serde(rename = "product")]
    Product,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemProduct {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemProductType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemMenuType {
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemMenu {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemMenuType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<ScrapeRequestFormatsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemHighlightsType {
    #[serde(rename = "highlights")]
    Highlights,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemHighlights {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemHighlightsType,
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub count: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parser: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<BTreeMap<String, ScrapeInputSchema1Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, ScrapeInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rules: Option<BTreeMap<String, ScrapeInputSchema2Schema>>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestFormatsItemAttributesType {
    #[serde(rename = "attributes")]
    Attributes,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemAttributesSelectorsItem {
    pub selector: String,
    pub attribute: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestFormatsItemAttributes {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestFormatsItemAttributesType,
    pub selectors: Vec<ScrapeRequestFormatsItemAttributesSelectorsItem>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ScrapeRequestFormatsItem {
    String(ScrapeRequestFormatsItemString),
    Object(ScrapeRequestFormatsItemObject),
    ChangeTracking(ScrapeRequestFormatsItemChangeTracking),
    Question(ScrapeRequestFormatsItemQuestion),
    Product(ScrapeRequestFormatsItemProduct),
    Menu(ScrapeRequestFormatsItemMenu),
    Screenshot(ScrapeRequestFormatsItemScreenshot),
    Highlights(ScrapeRequestFormatsItemHighlights),
    Json(ScrapeRequestFormatsItemJson),
    Attributes(ScrapeRequestFormatsItemAttributes),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestParsersItemPdf {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestParsersItemPdf2Type {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestParsersItemPdf2Mode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestParsersItemPdf2 {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestParsersItemPdf2Type,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ScrapeRequestParsersItemPdf2Mode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ScrapeRequestParsersItem {
    Pdf(ScrapeRequestParsersItemPdf),
    Pdf2(ScrapeRequestParsersItemPdf2),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemWaitType {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemWait {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemWaitType,
    pub milliseconds: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemWait2Type {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemWait2 {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemWait2Type,
    pub selector: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemClickType {
    #[serde(rename = "click")]
    Click,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemClick {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemClickType,
    pub selector: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemWriteType {
    #[serde(rename = "write")]
    Write,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemWrite {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemWriteType,
    pub text: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemPressType {
    #[serde(rename = "press")]
    Press,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemPress {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemPressType,
    pub key: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemScrollType {
    #[serde(rename = "scroll")]
    Scroll,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemScrollDirection {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "left")]
    Left,
    #[serde(rename = "right")]
    Right,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemScrollAmountString {
    #[serde(rename = "viewport")]
    Viewport,
    #[serde(rename = "max")]
    Max,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ScrapeRequestActionsItemScrollAmount {
    Integer(i64),
    String(ScrapeRequestActionsItemScrollAmountString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemScroll {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemScrollType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub direction: Option<ScrapeRequestActionsItemScrollDirection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub amount: Option<ScrapeRequestActionsItemScrollAmount>,
    #[serde(
        rename = "maxScrolls",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_scrolls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<ScrapeRequestActionsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemScrapeType {
    #[serde(rename = "scrape")]
    Scrape,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemScrape {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemScrapeType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemExecuteJavascriptType {
    #[serde(rename = "executeJavascript")]
    ExecuteJavascript,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemExecuteJavascript {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemExecuteJavascriptType,
    pub script: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemPdfType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemPdfFormat {
    #[serde(rename = "Letter")]
    Letter,
    #[serde(rename = "Legal")]
    Legal,
    #[serde(rename = "Tabloid")]
    Tabloid,
    #[serde(rename = "Ledger")]
    Ledger,
    #[serde(rename = "A0")]
    A0,
    #[serde(rename = "A1")]
    A1,
    #[serde(rename = "A2")]
    A2,
    #[serde(rename = "A3")]
    A3,
    #[serde(rename = "A4")]
    A4,
    #[serde(rename = "A5")]
    A5,
    #[serde(rename = "A6")]
    A6,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemPdf {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemPdfType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<ScrapeRequestActionsItemPdfFormat>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub landscape: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<f64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestActionsItemPerformType {
    #[serde(rename = "perform")]
    Perform,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestActionsItemPerform {
    #[serde(rename = "type")]
    pub type_: ScrapeRequestActionsItemPerformType,
    pub action: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ScrapeRequestActionsItem {
    Wait(ScrapeRequestActionsItemWait),
    Wait2(ScrapeRequestActionsItemWait2),
    Click(ScrapeRequestActionsItemClick),
    Write(ScrapeRequestActionsItemWrite),
    Press(ScrapeRequestActionsItemPress),
    Scroll(ScrapeRequestActionsItemScroll),
    Screenshot(ScrapeRequestActionsItemScreenshot),
    Scrape(ScrapeRequestActionsItemScrape),
    ExecuteJavascript(ScrapeRequestActionsItemExecuteJavascript),
    Pdf(ScrapeRequestActionsItemPdf),
    Perform(ScrapeRequestActionsItemPerform),
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeRequestLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestRedactPiiObjectMode {
    #[serde(rename = "accurate")]
    Accurate,
    #[serde(rename = "aggressive")]
    Aggressive,
    #[serde(rename = "fast")]
    Fast,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestRedactPiiObjectEntitiesItem {
    #[serde(rename = "PERSON")]
    Person,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "LOCATION")]
    Location,
    #[serde(rename = "FINANCIAL")]
    Financial,
    #[serde(rename = "SECRET")]
    Secret,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestRedactPiiObjectReplaceStyle {
    #[serde(rename = "tag")]
    Tag,
    #[serde(rename = "mask")]
    Mask,
    #[serde(rename = "remove")]
    Remove,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeRequestRedactPiiObject {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ScrapeRequestRedactPiiObjectMode>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub entities: Option<Vec<ScrapeRequestRedactPiiObjectEntitiesItem>>,
    #[serde(
        rename = "replaceStyle",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub replace_style: Option<ScrapeRequestRedactPiiObjectReplaceStyle>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ScrapeRequestRedactPii {
    Boolean(bool),
    Object(ScrapeRequestRedactPiiObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequestProfile {
    pub name: String,
    #[serde(
        rename = "saveChanges",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub save_changes: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeRequestLinkStyle {
    #[serde(rename = "inline")]
    Inline,
    #[serde(rename = "numbered")]
    Numbered,
    #[serde(rename = "none")]
    None,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeRequest {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<ScrapeRequestFormatsItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "onlyCleanContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_clean_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(rename = "minAge", default, skip_serializing_if = "Option::is_none")]
    pub min_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(rename = "waitFor", default, skip_serializing_if = "Option::is_none")]
    pub wait_for: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<bool>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<ScrapeRequestParsersItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<ScrapeRequestActionsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<ScrapeRequestLocation>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<bool>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<bool>,
    #[serde(
        rename = "storeInCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub store_in_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lockdown: Option<bool>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
    #[serde(rename = "redactPII", default, skip_serializing_if = "Option::is_none")]
    pub redact_pii: Option<ScrapeRequestRedactPii>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<ScrapeRequestProfile>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(rename = "linkStyle", default, skip_serializing_if = "Option::is_none")]
    pub link_style: Option<ScrapeRequestLinkStyle>,
    #[serde(rename = "maxChars", default, skip_serializing_if = "Option::is_none")]
    pub max_chars: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub offset: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
}
impl ScrapeRequest {
    pub fn new(url: String) -> Self {
        Self {
            url,
            formats: None,
            only_main_content: None,
            only_clean_content: None,
            include_tags: None,
            exclude_tags: None,
            max_age: None,
            min_age: None,
            headers: None,
            wait_for: None,
            mobile: None,
            skip_tls_verification: None,
            timeout: None,
            parsers: None,
            actions: None,
            location: None,
            remove_base_64_images: None,
            block_ads: None,
            fast_mode: None,
            store_in_cache: None,
            lockdown: None,
            check_prompt_injection: None,
            redact_pii: None,
            profile: None,
            zero_data_retention: None,
            link_style: None,
            max_chars: None,
            offset: None,
            query: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeResponseDataAttributesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeResponseDataChangeTrackingChangeStatus {
    #[serde(rename = "new")]
    New,
    #[serde(rename = "same")]
    Same,
    #[serde(rename = "changed")]
    Changed,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeResponseDataChangeTracking {
    #[serde(
        rename = "previousScrapeAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub previous_scrape_at: Option<String>,
    #[serde(
        rename = "changeStatus",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_status: Option<ScrapeResponseDataChangeTrackingChangeStatus>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub visibility: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diff: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeResponseDataActionsScrapesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeResponseDataActionsJavascriptReturnsItem {
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<ScrapeSchema0Schema>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ScrapeResponseDataActions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scrapes: Option<Vec<ScrapeResponseDataActionsScrapesItem>>,
    #[serde(
        rename = "javascriptReturns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub javascript_returns: Option<Vec<ScrapeResponseDataActionsJavascriptReturnsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pdfs: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ScrapeResponseDataMetadataCacheState {
    #[serde(rename = "hit")]
    Hit,
    #[serde(rename = "miss")]
    Miss,
    #[serde(rename = "stale")]
    Stale,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeResponseDataMetadata {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(rename = "ogImage", default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
    #[serde(rename = "sourceURL", default, skip_serializing_if = "Option::is_none")]
    pub source_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(rename = "statusCode")]
    pub status_code: i64,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(rename = "numPages", default, skip_serializing_if = "Option::is_none")]
    pub num_pages: Option<i64>,
    #[serde(
        rename = "totalPages",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub total_pages: Option<i64>,
    #[serde(
        rename = "cacheState",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub cache_state: Option<ScrapeResponseDataMetadataCacheState>,
    #[serde(rename = "cachedAt", default, skip_serializing_if = "Option::is_none")]
    pub cached_at: Option<String>,
    #[serde(rename = "scrapeId", default, skip_serializing_if = "Option::is_none")]
    pub scrape_id: Option<String>,
    #[serde(rename = "costUsd", default, skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(flatten)]
    pub extra: BTreeMap<String, Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<ScrapeResponseDataAttributesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshot: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<ScrapeSchema0Schema>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<String>,
    #[serde(rename = "isTruncated")]
    pub is_truncated: bool,
    #[serde(
        rename = "nextOffset",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub next_offset: Option<i64>,
    #[serde(
        rename = "changeTracking",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_tracking: Option<ScrapeResponseDataChangeTracking>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branding: Option<BTreeMap<String, ScrapeSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<ScrapeResponseDataActions>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    pub metadata: ScrapeResponseDataMetadata,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ScrapeResponse {
    pub success: bool,
    pub data: ScrapeResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestAgent {
    pub model: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestWebhookObjectEventsItem {
    #[serde(rename = "started")]
    Started,
    #[serde(rename = "page")]
    Page,
    #[serde(rename = "action")]
    Action,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestWebhookObject {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, ExtractInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<ExtractRequestWebhookObjectEventsItem>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ExtractRequestWebhook {
    String(String),
    Object(ExtractRequestWebhookObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsParsersItemPdf {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsParsersItemPdf2Type {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsParsersItemPdf2Mode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsParsersItemPdf2 {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsParsersItemPdf2Type,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ExtractRequestScrapeOptionsParsersItemPdf2Mode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ExtractRequestScrapeOptionsParsersItem {
    Pdf(ExtractRequestScrapeOptionsParsersItemPdf),
    Pdf2(ExtractRequestScrapeOptionsParsersItemPdf2),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemWaitType {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemWait {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemWaitType,
    pub milliseconds: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemWait2Type {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemWait2 {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemWait2Type,
    pub selector: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemClickType {
    #[serde(rename = "click")]
    Click,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemClick {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemClickType,
    pub selector: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemWriteType {
    #[serde(rename = "write")]
    Write,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemWrite {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemWriteType,
    pub text: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemPressType {
    #[serde(rename = "press")]
    Press,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemPress {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemPressType,
    pub key: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemScrollType {
    #[serde(rename = "scroll")]
    Scroll,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemScrollDirection {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "left")]
    Left,
    #[serde(rename = "right")]
    Right,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemScrollAmountString {
    #[serde(rename = "viewport")]
    Viewport,
    #[serde(rename = "max")]
    Max,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ExtractRequestScrapeOptionsActionsItemScrollAmount {
    Integer(i64),
    String(ExtractRequestScrapeOptionsActionsItemScrollAmountString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemScroll {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemScrollType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub direction: Option<ExtractRequestScrapeOptionsActionsItemScrollDirection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub amount: Option<ExtractRequestScrapeOptionsActionsItemScrollAmount>,
    #[serde(
        rename = "maxScrolls",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_scrolls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<ExtractRequestScrapeOptionsActionsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemScrapeType {
    #[serde(rename = "scrape")]
    Scrape,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemScrape {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemScrapeType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemExecuteJavascriptType {
    #[serde(rename = "executeJavascript")]
    ExecuteJavascript,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemExecuteJavascript {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemExecuteJavascriptType,
    pub script: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemPdfType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemPdfFormat {
    #[serde(rename = "Letter")]
    Letter,
    #[serde(rename = "Legal")]
    Legal,
    #[serde(rename = "Tabloid")]
    Tabloid,
    #[serde(rename = "Ledger")]
    Ledger,
    #[serde(rename = "A0")]
    A0,
    #[serde(rename = "A1")]
    A1,
    #[serde(rename = "A2")]
    A2,
    #[serde(rename = "A3")]
    A3,
    #[serde(rename = "A4")]
    A4,
    #[serde(rename = "A5")]
    A5,
    #[serde(rename = "A6")]
    A6,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemPdf {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemPdfType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<ExtractRequestScrapeOptionsActionsItemPdfFormat>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub landscape: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<f64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsActionsItemPerformType {
    #[serde(rename = "perform")]
    Perform,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsActionsItemPerform {
    #[serde(rename = "type")]
    pub type_: ExtractRequestScrapeOptionsActionsItemPerformType,
    pub action: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ExtractRequestScrapeOptionsActionsItem {
    Wait(ExtractRequestScrapeOptionsActionsItemWait),
    Wait2(ExtractRequestScrapeOptionsActionsItemWait2),
    Click(ExtractRequestScrapeOptionsActionsItemClick),
    Write(ExtractRequestScrapeOptionsActionsItemWrite),
    Press(ExtractRequestScrapeOptionsActionsItemPress),
    Scroll(ExtractRequestScrapeOptionsActionsItemScroll),
    Screenshot(ExtractRequestScrapeOptionsActionsItemScreenshot),
    Scrape(ExtractRequestScrapeOptionsActionsItemScrape),
    ExecuteJavascript(ExtractRequestScrapeOptionsActionsItemExecuteJavascript),
    Pdf(ExtractRequestScrapeOptionsActionsItemPdf),
    Perform(ExtractRequestScrapeOptionsActionsItemPerform),
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ExtractRequestScrapeOptionsLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsRedactPiiObjectMode {
    #[serde(rename = "accurate")]
    Accurate,
    #[serde(rename = "aggressive")]
    Aggressive,
    #[serde(rename = "fast")]
    Fast,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsRedactPiiObjectEntitiesItem {
    #[serde(rename = "PERSON")]
    Person,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "LOCATION")]
    Location,
    #[serde(rename = "FINANCIAL")]
    Financial,
    #[serde(rename = "SECRET")]
    Secret,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ExtractRequestScrapeOptionsRedactPiiObjectReplaceStyle {
    #[serde(rename = "tag")]
    Tag,
    #[serde(rename = "mask")]
    Mask,
    #[serde(rename = "remove")]
    Remove,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ExtractRequestScrapeOptionsRedactPiiObject {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ExtractRequestScrapeOptionsRedactPiiObjectMode>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub entities: Option<Vec<ExtractRequestScrapeOptionsRedactPiiObjectEntitiesItem>>,
    #[serde(
        rename = "replaceStyle",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub replace_style: Option<ExtractRequestScrapeOptionsRedactPiiObjectReplaceStyle>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ExtractRequestScrapeOptionsRedactPii {
    Boolean(bool),
    Object(ExtractRequestScrapeOptionsRedactPiiObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractRequestScrapeOptionsProfile {
    pub name: String,
    #[serde(
        rename = "saveChanges",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub save_changes: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ExtractRequestScrapeOptions {
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "onlyCleanContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_clean_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(rename = "minAge", default, skip_serializing_if = "Option::is_none")]
    pub min_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(rename = "waitFor", default, skip_serializing_if = "Option::is_none")]
    pub wait_for: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<bool>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<ExtractRequestScrapeOptionsParsersItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<ExtractRequestScrapeOptionsActionsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<ExtractRequestScrapeOptionsLocation>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<bool>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<bool>,
    #[serde(
        rename = "storeInCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub store_in_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lockdown: Option<bool>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
    #[serde(rename = "redactPII", default, skip_serializing_if = "Option::is_none")]
    pub redact_pii: Option<ExtractRequestScrapeOptionsRedactPii>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<ExtractRequestScrapeOptionsProfile>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ExtractRequest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub urls: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, ExtractInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(
        rename = "systemPrompt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub system_prompt: Option<String>,
    #[serde(
        rename = "enableWebSearch",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub enable_web_search: Option<bool>,
    #[serde(
        rename = "allowExternalLinks",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub allow_external_links: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub agent: Option<ExtractRequestAgent>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub webhook: Option<ExtractRequestWebhook>,
    #[serde(
        rename = "ignoreSitemap",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_sitemap: Option<bool>,
    #[serde(
        rename = "includeSubdomains",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_subdomains: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(
        rename = "showSources",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub show_sources: Option<bool>,
    #[serde(
        rename = "scrapeOptions",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub scrape_options: Option<ExtractRequestScrapeOptions>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(
        rename = "ignoreInvalidURLs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_invalid_ur_ls: Option<bool>,
}
impl ExtractRequest {
    pub fn new() -> Self {
        Self {
            urls: None,
            schema: None,
            prompt: None,
            system_prompt: None,
            enable_web_search: None,
            allow_external_links: None,
            agent: None,
            webhook: None,
            ignore_sitemap: None,
            include_subdomains: None,
            limit: None,
            timeout: None,
            show_sources: None,
            scrape_options: None,
            zero_data_retention: None,
            ignore_invalid_ur_ls: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ExtractResponse {
    pub success: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(rename = "invalidURLs")]
    pub invalid_ur_ls: Vec<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskRequest {
    pub url: String,
    pub goal: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, BrowserTaskInputSchema0Schema>>,
    #[serde(rename = "maxSteps", default, skip_serializing_if = "Option::is_none")]
    pub max_steps: Option<i64>,
    #[serde(rename = "maxCost", default, skip_serializing_if = "Option::is_none")]
    pub max_cost: Option<f64>,
}
impl BrowserTaskRequest {
    pub fn new(url: String, goal: String) -> Self {
        Self {
            url,
            goal,
            values: None,
            schema: None,
            max_steps: None,
            max_cost: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BrowserTaskResponseDataStatus {
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "done")]
    Done,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub status: BrowserTaskResponseDataStatus,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskResponse {
    pub success: bool,
    pub data: BrowserTaskResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskStatusRequest {
    pub id: String,
}
impl BrowserTaskStatusRequest {
    pub fn new(id: String) -> Self {
        Self { id }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BrowserTaskStatusResponseDataStatus {
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "done")]
    Done,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskStatusResponseDataResult {
    pub done: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub answer: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub reason: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub steps: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(rename = "pageText", default, skip_serializing_if = "Option::is_none")]
    pub page_text: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub seconds: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub fields: Option<BTreeMap<String, BrowserTaskStatusSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub confidence: Option<BTreeMap<String, f64>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskStatusResponseData {
    pub status: BrowserTaskStatusResponseDataStatus,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub result: Option<BrowserTaskStatusResponseDataResult>,
    #[serde(rename = "costUsd")]
    pub cost_usd: f64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BrowserTaskStatusResponse {
    pub success: bool,
    pub data: BrowserTaskStatusResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: ParseRequestFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, ParseInputSchema0Schema>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestFormatsItemVariantString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestFormatsItemVariantObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestFormatsItemVariantObject {
    #[serde(rename = "type")]
    pub type_: ParseRequestFormatsItemVariantObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ParseRequestFormatsItemVariant {
    String(ParseRequestFormatsItemVariantString),
    Object(ParseRequestFormatsItemVariantObject),
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ParseRequestFormatsItem {
    Json(ParseRequestFormatsItemJson),
    Variant(ParseRequestFormatsItemVariant),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestParsersItemType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestParsersItemMode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestParsersItem {
    #[serde(rename = "type")]
    pub type_: ParseRequestParsersItemType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ParseRequestParsersItemMode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestOptionsFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestOptionsFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: ParseRequestOptionsFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, ParseInputSchema0Schema>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestOptionsFormatsItemVariantString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestOptionsFormatsItemVariantObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestOptionsFormatsItemVariantObject {
    #[serde(rename = "type")]
    pub type_: ParseRequestOptionsFormatsItemVariantObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ParseRequestOptionsFormatsItemVariant {
    String(ParseRequestOptionsFormatsItemVariantString),
    Object(ParseRequestOptionsFormatsItemVariantObject),
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum ParseRequestOptionsFormatsItem {
    Json(ParseRequestOptionsFormatsItemJson),
    Variant(ParseRequestOptionsFormatsItemVariant),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestOptionsParsersItemType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum ParseRequestOptionsParsersItemMode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseRequestOptionsParsersItem {
    #[serde(rename = "type")]
    pub type_: ParseRequestOptionsParsersItemType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<ParseRequestOptionsParsersItemMode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ParseRequestOptions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<ParseRequestOptionsFormatsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<ParseRequestOptionsParsersItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub origin: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub integration: Option<String>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<Value>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<Value>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct ParseRequest {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<ParseRequestFormatsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<ParseRequestParsersItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub origin: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub integration: Option<String>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<Value>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<Value>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<Value>,
    #[serde(rename = "uploadRef", default, skip_serializing_if = "Option::is_none")]
    pub upload_ref: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub file: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub filename: Option<String>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<ParseRequestOptions>,
}
impl ParseRequest {
    pub fn new() -> Self {
        Self {
            formats: None,
            parsers: None,
            only_main_content: None,
            include_tags: None,
            exclude_tags: None,
            remove_base_64_images: None,
            zero_data_retention: None,
            origin: None,
            integration: None,
            fast_mode: None,
            mobile: None,
            block_ads: None,
            skip_tls_verification: None,
            timeout: None,
            headers: None,
            location: None,
            profile: None,
            upload_ref: None,
            file: None,
            filename: None,
            max_pages: None,
            options: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseResponseDataMetadata {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(rename = "numPages", default, skip_serializing_if = "Option::is_none")]
    pub num_pages: Option<i64>,
    #[serde(rename = "ocrPages", default, skip_serializing_if = "Option::is_none")]
    pub ocr_pages: Option<i64>,
    #[serde(rename = "costUsd")]
    pub cost_usd: f64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseResponseData {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BTreeMap<String, ParseSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<Vec<BTreeMap<String, ParseSchema0Schema>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<Vec<BTreeMap<String, ParseSchema0Schema>>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    pub metadata: ParseResponseDataMetadata,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct ParseResponse {
    pub success: bool,
    pub data: ParseResponseData,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum MapRequestSitemap {
    #[serde(rename = "skip")]
    Skip,
    #[serde(rename = "include")]
    Include,
    #[serde(rename = "only")]
    Only,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct MapRequestLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct MapRequest {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub search: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sitemap: Option<MapRequestSitemap>,
    #[serde(
        rename = "includeSubdomains",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_subdomains: Option<bool>,
    #[serde(
        rename = "ignoreQueryParameters",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_query_parameters: Option<bool>,
    #[serde(
        rename = "deduplicateSimilarURLs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub deduplicate_similar_ur_ls: Option<bool>,
    #[serde(
        rename = "ignoreCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<MapRequestLocation>,
}
impl MapRequest {
    pub fn new(url: String) -> Self {
        Self {
            url,
            search: None,
            sitemap: None,
            include_subdomains: None,
            ignore_query_parameters: None,
            deduplicate_similar_ur_ls: None,
            ignore_cache: None,
            limit: None,
            timeout: None,
            location: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct MapResponseLinksItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct MapResponse {
    pub success: bool,
    pub links: Vec<MapResponseLinksItem>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestSitemap {
    #[serde(rename = "skip")]
    Skip,
    #[serde(rename = "include")]
    Include,
    #[serde(rename = "only")]
    Only,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
    #[serde(rename = "screenshot")]
    Screenshot,
    #[serde(rename = "changeTracking")]
    ChangeTracking,
    #[serde(rename = "product")]
    Product,
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemObject {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemChangeTrackingType {
    #[serde(rename = "changeTracking")]
    ChangeTracking,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemChangeTrackingModesItem {
    #[serde(rename = "git-diff")]
    GitDiff,
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemChangeTracking {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemChangeTrackingType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modes: Option<Vec<CrawlRequestScrapeOptionsFormatsItemChangeTrackingModesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, CrawlInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tag: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemQuestionType {
    #[serde(rename = "question")]
    Question,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemQuestion {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemQuestionType,
    pub question: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemProductType {
    #[serde(rename = "product")]
    Product,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemProduct {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemProductType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemMenuType {
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemMenu {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemMenuType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<CrawlRequestScrapeOptionsFormatsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemHighlightsType {
    #[serde(rename = "highlights")]
    Highlights,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemHighlights {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemHighlightsType,
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub count: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parser: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<BTreeMap<String, CrawlInputSchema1Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, CrawlInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rules: Option<BTreeMap<String, CrawlInputSchema2Schema>>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsFormatsItemAttributesType {
    #[serde(rename = "attributes")]
    Attributes,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemAttributesSelectorsItem {
    pub selector: String,
    pub attribute: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsFormatsItemAttributes {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsFormatsItemAttributesType,
    pub selectors: Vec<CrawlRequestScrapeOptionsFormatsItemAttributesSelectorsItem>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestScrapeOptionsFormatsItem {
    String(CrawlRequestScrapeOptionsFormatsItemString),
    Object(CrawlRequestScrapeOptionsFormatsItemObject),
    ChangeTracking(CrawlRequestScrapeOptionsFormatsItemChangeTracking),
    Question(CrawlRequestScrapeOptionsFormatsItemQuestion),
    Product(CrawlRequestScrapeOptionsFormatsItemProduct),
    Menu(CrawlRequestScrapeOptionsFormatsItemMenu),
    Screenshot(CrawlRequestScrapeOptionsFormatsItemScreenshot),
    Highlights(CrawlRequestScrapeOptionsFormatsItemHighlights),
    Json(CrawlRequestScrapeOptionsFormatsItemJson),
    Attributes(CrawlRequestScrapeOptionsFormatsItemAttributes),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsParsersItemPdf {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsParsersItemPdf2Type {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsParsersItemPdf2Mode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsParsersItemPdf2 {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsParsersItemPdf2Type,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<CrawlRequestScrapeOptionsParsersItemPdf2Mode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestScrapeOptionsParsersItem {
    Pdf(CrawlRequestScrapeOptionsParsersItemPdf),
    Pdf2(CrawlRequestScrapeOptionsParsersItemPdf2),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemWaitType {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemWait {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemWaitType,
    pub milliseconds: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemWait2Type {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemWait2 {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemWait2Type,
    pub selector: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemClickType {
    #[serde(rename = "click")]
    Click,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemClick {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemClickType,
    pub selector: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemWriteType {
    #[serde(rename = "write")]
    Write,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemWrite {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemWriteType,
    pub text: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemPressType {
    #[serde(rename = "press")]
    Press,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemPress {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemPressType,
    pub key: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemScrollType {
    #[serde(rename = "scroll")]
    Scroll,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemScrollDirection {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "left")]
    Left,
    #[serde(rename = "right")]
    Right,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemScrollAmountString {
    #[serde(rename = "viewport")]
    Viewport,
    #[serde(rename = "max")]
    Max,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestScrapeOptionsActionsItemScrollAmount {
    Integer(i64),
    String(CrawlRequestScrapeOptionsActionsItemScrollAmountString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemScroll {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemScrollType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub direction: Option<CrawlRequestScrapeOptionsActionsItemScrollDirection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub amount: Option<CrawlRequestScrapeOptionsActionsItemScrollAmount>,
    #[serde(
        rename = "maxScrolls",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_scrolls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<CrawlRequestScrapeOptionsActionsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemScrapeType {
    #[serde(rename = "scrape")]
    Scrape,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemScrape {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemScrapeType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemExecuteJavascriptType {
    #[serde(rename = "executeJavascript")]
    ExecuteJavascript,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemExecuteJavascript {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemExecuteJavascriptType,
    pub script: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemPdfType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemPdfFormat {
    #[serde(rename = "Letter")]
    Letter,
    #[serde(rename = "Legal")]
    Legal,
    #[serde(rename = "Tabloid")]
    Tabloid,
    #[serde(rename = "Ledger")]
    Ledger,
    #[serde(rename = "A0")]
    A0,
    #[serde(rename = "A1")]
    A1,
    #[serde(rename = "A2")]
    A2,
    #[serde(rename = "A3")]
    A3,
    #[serde(rename = "A4")]
    A4,
    #[serde(rename = "A5")]
    A5,
    #[serde(rename = "A6")]
    A6,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemPdf {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemPdfType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<CrawlRequestScrapeOptionsActionsItemPdfFormat>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub landscape: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<f64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsActionsItemPerformType {
    #[serde(rename = "perform")]
    Perform,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsActionsItemPerform {
    #[serde(rename = "type")]
    pub type_: CrawlRequestScrapeOptionsActionsItemPerformType,
    pub action: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestScrapeOptionsActionsItem {
    Wait(CrawlRequestScrapeOptionsActionsItemWait),
    Wait2(CrawlRequestScrapeOptionsActionsItemWait2),
    Click(CrawlRequestScrapeOptionsActionsItemClick),
    Write(CrawlRequestScrapeOptionsActionsItemWrite),
    Press(CrawlRequestScrapeOptionsActionsItemPress),
    Scroll(CrawlRequestScrapeOptionsActionsItemScroll),
    Screenshot(CrawlRequestScrapeOptionsActionsItemScreenshot),
    Scrape(CrawlRequestScrapeOptionsActionsItemScrape),
    ExecuteJavascript(CrawlRequestScrapeOptionsActionsItemExecuteJavascript),
    Pdf(CrawlRequestScrapeOptionsActionsItemPdf),
    Perform(CrawlRequestScrapeOptionsActionsItemPerform),
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlRequestScrapeOptionsLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsRedactPiiObjectMode {
    #[serde(rename = "accurate")]
    Accurate,
    #[serde(rename = "aggressive")]
    Aggressive,
    #[serde(rename = "fast")]
    Fast,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsRedactPiiObjectEntitiesItem {
    #[serde(rename = "PERSON")]
    Person,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "LOCATION")]
    Location,
    #[serde(rename = "FINANCIAL")]
    Financial,
    #[serde(rename = "SECRET")]
    Secret,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestScrapeOptionsRedactPiiObjectReplaceStyle {
    #[serde(rename = "tag")]
    Tag,
    #[serde(rename = "mask")]
    Mask,
    #[serde(rename = "remove")]
    Remove,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlRequestScrapeOptionsRedactPiiObject {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<CrawlRequestScrapeOptionsRedactPiiObjectMode>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub entities: Option<Vec<CrawlRequestScrapeOptionsRedactPiiObjectEntitiesItem>>,
    #[serde(
        rename = "replaceStyle",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub replace_style: Option<CrawlRequestScrapeOptionsRedactPiiObjectReplaceStyle>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestScrapeOptionsRedactPii {
    Boolean(bool),
    Object(CrawlRequestScrapeOptionsRedactPiiObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestScrapeOptionsProfile {
    pub name: String,
    #[serde(
        rename = "saveChanges",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub save_changes: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlRequestScrapeOptions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<CrawlRequestScrapeOptionsFormatsItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "onlyCleanContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_clean_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(rename = "minAge", default, skip_serializing_if = "Option::is_none")]
    pub min_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(rename = "waitFor", default, skip_serializing_if = "Option::is_none")]
    pub wait_for: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<bool>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<CrawlRequestScrapeOptionsParsersItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<CrawlRequestScrapeOptionsActionsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<CrawlRequestScrapeOptionsLocation>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<bool>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<bool>,
    #[serde(
        rename = "storeInCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub store_in_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lockdown: Option<bool>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
    #[serde(rename = "redactPII", default, skip_serializing_if = "Option::is_none")]
    pub redact_pii: Option<CrawlRequestScrapeOptionsRedactPii>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<CrawlRequestScrapeOptionsProfile>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlRequestWebhookObjectEventsItem {
    #[serde(rename = "started")]
    Started,
    #[serde(rename = "page")]
    Page,
    #[serde(rename = "action")]
    Action,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequestWebhookObject {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, CrawlInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<CrawlRequestWebhookObjectEventsItem>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum CrawlRequestWebhook {
    String(String),
    Object(CrawlRequestWebhookObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlRequest {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(
        rename = "includePaths",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_paths: Option<Vec<String>>,
    #[serde(
        rename = "excludePaths",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_paths: Option<Vec<String>>,
    #[serde(
        rename = "maxDiscoveryDepth",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_discovery_depth: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub sitemap: Option<CrawlRequestSitemap>,
    #[serde(
        rename = "ignoreQueryParameters",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_query_parameters: Option<bool>,
    #[serde(
        rename = "regexOnFullURL",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub regex_on_full_url: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
    #[serde(
        rename = "crawlEntireDomain",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub crawl_entire_domain: Option<bool>,
    #[serde(
        rename = "deduplicateSimilarURLs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub deduplicate_similar_ur_ls: Option<bool>,
    #[serde(
        rename = "allowExternalLinks",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub allow_external_links: Option<bool>,
    #[serde(
        rename = "allowSubdomains",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub allow_subdomains: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub delay: Option<f64>,
    #[serde(
        rename = "maxConcurrency",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_concurrency: Option<i64>,
    #[serde(
        rename = "scrapeOptions",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub scrape_options: Option<CrawlRequestScrapeOptions>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub webhook: Option<CrawlRequestWebhook>,
}
impl CrawlRequest {
    pub fn new(url: String) -> Self {
        Self {
            url,
            prompt: None,
            include_paths: None,
            exclude_paths: None,
            max_discovery_depth: None,
            sitemap: None,
            ignore_query_parameters: None,
            regex_on_full_url: None,
            limit: None,
            crawl_entire_domain: None,
            deduplicate_similar_ur_ls: None,
            allow_external_links: None,
            allow_subdomains: None,
            delay: None,
            max_concurrency: None,
            scrape_options: None,
            zero_data_retention: None,
            webhook: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlResponseStatus {
    #[serde(rename = "scraping")]
    Scraping,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlResponse {
    pub success: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<CrawlResponseStatus>,
    #[serde(
        rename = "queuePosition",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub queue_position: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusQuery {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlStatusResponseStatus {
    #[serde(rename = "scraping")]
    Scraping,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlStatusResponseErrorsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timestamp: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub retryable: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub at: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusResponseDataItemAttributesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlStatusResponseDataItemChangeTrackingChangeStatus {
    #[serde(rename = "new")]
    New,
    #[serde(rename = "same")]
    Same,
    #[serde(rename = "changed")]
    Changed,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusResponseDataItemChangeTracking {
    #[serde(
        rename = "previousScrapeAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub previous_scrape_at: Option<String>,
    #[serde(
        rename = "changeStatus",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_status: Option<CrawlStatusResponseDataItemChangeTrackingChangeStatus>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub visibility: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diff: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusResponseDataItemActionsScrapesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusResponseDataItemActionsJavascriptReturnsItem {
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<CrawlStatusSchema0Schema>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct CrawlStatusResponseDataItemActions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scrapes: Option<Vec<CrawlStatusResponseDataItemActionsScrapesItem>>,
    #[serde(
        rename = "javascriptReturns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub javascript_returns: Option<Vec<CrawlStatusResponseDataItemActionsJavascriptReturnsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pdfs: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlStatusResponseDataItemMetadataCacheState {
    #[serde(rename = "hit")]
    Hit,
    #[serde(rename = "miss")]
    Miss,
    #[serde(rename = "stale")]
    Stale,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlStatusResponseDataItemMetadata {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(rename = "ogImage", default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
    #[serde(rename = "sourceURL", default, skip_serializing_if = "Option::is_none")]
    pub source_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(rename = "statusCode")]
    pub status_code: i64,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(rename = "numPages", default, skip_serializing_if = "Option::is_none")]
    pub num_pages: Option<i64>,
    #[serde(
        rename = "totalPages",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub total_pages: Option<i64>,
    #[serde(
        rename = "cacheState",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub cache_state: Option<CrawlStatusResponseDataItemMetadataCacheState>,
    #[serde(rename = "cachedAt", default, skip_serializing_if = "Option::is_none")]
    pub cached_at: Option<String>,
    #[serde(rename = "scrapeId", default, skip_serializing_if = "Option::is_none")]
    pub scrape_id: Option<String>,
    #[serde(rename = "costUsd", default, skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(flatten)]
    pub extra: BTreeMap<String, Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlStatusResponseDataItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<CrawlStatusResponseDataItemAttributesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshot: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<CrawlStatusSchema0Schema>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<String>,
    #[serde(rename = "isTruncated")]
    pub is_truncated: bool,
    #[serde(
        rename = "nextOffset",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub next_offset: Option<i64>,
    #[serde(
        rename = "changeTracking",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_tracking: Option<CrawlStatusResponseDataItemChangeTracking>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branding: Option<BTreeMap<String, CrawlStatusSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<CrawlStatusResponseDataItemActions>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    pub metadata: CrawlStatusResponseDataItemMetadata,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlStatusResponse {
    pub success: bool,
    pub status: CrawlStatusResponseStatus,
    #[serde(
        rename = "queuePosition",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub queue_position: Option<i64>,
    pub total: i64,
    pub completed: i64,
    pub failed: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub errors: Vec<CrawlStatusResponseErrorsItem>,
    #[serde(rename = "createdAt", default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(
        rename = "completedAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub completed_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub duration: Option<f64>,
    #[serde(rename = "expiresAt", default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub data: Vec<CrawlStatusResponseDataItem>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum CrawlCancelResponseStatus {
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct CrawlCancelResponse {
    pub status: CrawlCancelResponseStatus,
    pub success: bool,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestWebhookObjectEventsItem {
    #[serde(rename = "started")]
    Started,
    #[serde(rename = "page")]
    Page,
    #[serde(rename = "action")]
    Action,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestWebhookObject {
    pub url: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub metadata: Option<BTreeMap<String, BatchScrapeInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub events: Option<Vec<BatchScrapeRequestWebhookObjectEventsItem>>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestWebhook {
    String(String),
    Object(BatchScrapeRequestWebhookObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemString {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
    #[serde(rename = "screenshot")]
    Screenshot,
    #[serde(rename = "changeTracking")]
    ChangeTracking,
    #[serde(rename = "product")]
    Product,
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemObjectType {
    #[serde(rename = "markdown")]
    Markdown,
    #[serde(rename = "summary")]
    Summary,
    #[serde(rename = "html")]
    Html,
    #[serde(rename = "rawHtml")]
    RawHtml,
    #[serde(rename = "rawBase64")]
    RawBase64,
    #[serde(rename = "links")]
    Links,
    #[serde(rename = "images")]
    Images,
    #[serde(rename = "network")]
    Network,
    #[serde(rename = "branding")]
    Branding,
    #[serde(rename = "audio")]
    Audio,
    #[serde(rename = "video")]
    Video,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemObject {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemObjectType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemChangeTrackingType {
    #[serde(rename = "changeTracking")]
    ChangeTracking,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemChangeTrackingModesItem {
    #[serde(rename = "git-diff")]
    GitDiff,
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemChangeTracking {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemChangeTrackingType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub modes: Option<Vec<BatchScrapeRequestFormatsItemChangeTrackingModesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, BatchScrapeInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tag: Option<Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemQuestionType {
    #[serde(rename = "question")]
    Question,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemQuestion {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemQuestionType,
    pub question: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemProductType {
    #[serde(rename = "product")]
    Product,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemProduct {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemProductType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemMenuType {
    #[serde(rename = "menu")]
    Menu,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemMenu {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemMenuType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<BatchScrapeRequestFormatsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemHighlightsType {
    #[serde(rename = "highlights")]
    Highlights,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemHighlights {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemHighlightsType,
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub count: Option<i64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemJsonType {
    #[serde(rename = "json")]
    Json,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemJson {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemJsonType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parser: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub options: Option<BTreeMap<String, BatchScrapeInputSchema1Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub schema: Option<BTreeMap<String, BatchScrapeInputSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub prompt: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rules: Option<BTreeMap<String, BatchScrapeInputSchema2Schema>>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestFormatsItemAttributesType {
    #[serde(rename = "attributes")]
    Attributes,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemAttributesSelectorsItem {
    pub selector: String,
    pub attribute: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestFormatsItemAttributes {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestFormatsItemAttributesType,
    pub selectors: Vec<BatchScrapeRequestFormatsItemAttributesSelectorsItem>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestFormatsItem {
    String(BatchScrapeRequestFormatsItemString),
    Object(BatchScrapeRequestFormatsItemObject),
    ChangeTracking(BatchScrapeRequestFormatsItemChangeTracking),
    Question(BatchScrapeRequestFormatsItemQuestion),
    Product(BatchScrapeRequestFormatsItemProduct),
    Menu(BatchScrapeRequestFormatsItemMenu),
    Screenshot(BatchScrapeRequestFormatsItemScreenshot),
    Highlights(BatchScrapeRequestFormatsItemHighlights),
    Json(BatchScrapeRequestFormatsItemJson),
    Attributes(BatchScrapeRequestFormatsItemAttributes),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestParsersItemPdf {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestParsersItemPdf2Type {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestParsersItemPdf2Mode {
    #[serde(rename = "fast")]
    Fast,
    #[serde(rename = "auto")]
    Auto,
    #[serde(rename = "ocr")]
    Ocr,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestParsersItemPdf2 {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestParsersItemPdf2Type,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<BatchScrapeRequestParsersItemPdf2Mode>,
    #[serde(rename = "maxPages", default, skip_serializing_if = "Option::is_none")]
    pub max_pages: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pages: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub blocks: Option<bool>,
    #[serde(
        rename = "pageMarkers",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub page_markers: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestParsersItem {
    Pdf(BatchScrapeRequestParsersItemPdf),
    Pdf2(BatchScrapeRequestParsersItemPdf2),
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemWaitType {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemWait {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemWaitType,
    pub milliseconds: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemWait2Type {
    #[serde(rename = "wait")]
    Wait,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemWait2 {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemWait2Type,
    pub selector: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemClickType {
    #[serde(rename = "click")]
    Click,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemClick {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemClickType,
    pub selector: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub all: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemWriteType {
    #[serde(rename = "write")]
    Write,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemWrite {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemWriteType,
    pub text: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemPressType {
    #[serde(rename = "press")]
    Press,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemPress {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemPressType,
    pub key: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemScrollType {
    #[serde(rename = "scroll")]
    Scroll,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemScrollDirection {
    #[serde(rename = "up")]
    Up,
    #[serde(rename = "down")]
    Down,
    #[serde(rename = "left")]
    Left,
    #[serde(rename = "right")]
    Right,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemScrollAmountString {
    #[serde(rename = "viewport")]
    Viewport,
    #[serde(rename = "max")]
    Max,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestActionsItemScrollAmount {
    Integer(i64),
    String(BatchScrapeRequestActionsItemScrollAmountString),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemScroll {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemScrollType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub direction: Option<BatchScrapeRequestActionsItemScrollDirection>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub amount: Option<BatchScrapeRequestActionsItemScrollAmount>,
    #[serde(
        rename = "maxScrolls",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_scrolls: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemScreenshotType {
    #[serde(rename = "screenshot")]
    Screenshot,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemScreenshotViewport {
    pub width: i64,
    pub height: i64,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemScreenshot {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemScreenshotType,
    #[serde(rename = "fullPage", default, skip_serializing_if = "Option::is_none")]
    pub full_page: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub quality: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub viewport: Option<BatchScrapeRequestActionsItemScreenshotViewport>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemScrapeType {
    #[serde(rename = "scrape")]
    Scrape,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemScrape {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemScrapeType,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemExecuteJavascriptType {
    #[serde(rename = "executeJavascript")]
    ExecuteJavascript,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemExecuteJavascript {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemExecuteJavascriptType,
    pub script: String,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemPdfType {
    #[serde(rename = "pdf")]
    Pdf,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemPdfFormat {
    #[serde(rename = "Letter")]
    Letter,
    #[serde(rename = "Legal")]
    Legal,
    #[serde(rename = "Tabloid")]
    Tabloid,
    #[serde(rename = "Ledger")]
    Ledger,
    #[serde(rename = "A0")]
    A0,
    #[serde(rename = "A1")]
    A1,
    #[serde(rename = "A2")]
    A2,
    #[serde(rename = "A3")]
    A3,
    #[serde(rename = "A4")]
    A4,
    #[serde(rename = "A5")]
    A5,
    #[serde(rename = "A6")]
    A6,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemPdf {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemPdfType,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub format: Option<BatchScrapeRequestActionsItemPdfFormat>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub landscape: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scale: Option<f64>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestActionsItemPerformType {
    #[serde(rename = "perform")]
    Perform,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestActionsItemPerform {
    #[serde(rename = "type")]
    pub type_: BatchScrapeRequestActionsItemPerformType,
    pub action: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestActionsItem {
    Wait(BatchScrapeRequestActionsItemWait),
    Wait2(BatchScrapeRequestActionsItemWait2),
    Click(BatchScrapeRequestActionsItemClick),
    Write(BatchScrapeRequestActionsItemWrite),
    Press(BatchScrapeRequestActionsItemPress),
    Scroll(BatchScrapeRequestActionsItemScroll),
    Screenshot(BatchScrapeRequestActionsItemScreenshot),
    Scrape(BatchScrapeRequestActionsItemScrape),
    ExecuteJavascript(BatchScrapeRequestActionsItemExecuteJavascript),
    Pdf(BatchScrapeRequestActionsItemPdf),
    Perform(BatchScrapeRequestActionsItemPerform),
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeRequestLocation {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub country: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub languages: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestRedactPiiObjectMode {
    #[serde(rename = "accurate")]
    Accurate,
    #[serde(rename = "aggressive")]
    Aggressive,
    #[serde(rename = "fast")]
    Fast,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestRedactPiiObjectEntitiesItem {
    #[serde(rename = "PERSON")]
    Person,
    #[serde(rename = "EMAIL")]
    Email,
    #[serde(rename = "PHONE")]
    Phone,
    #[serde(rename = "LOCATION")]
    Location,
    #[serde(rename = "FINANCIAL")]
    Financial,
    #[serde(rename = "SECRET")]
    Secret,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestRedactPiiObjectReplaceStyle {
    #[serde(rename = "tag")]
    Tag,
    #[serde(rename = "mask")]
    Mask,
    #[serde(rename = "remove")]
    Remove,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeRequestRedactPiiObject {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mode: Option<BatchScrapeRequestRedactPiiObjectMode>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub entities: Option<Vec<BatchScrapeRequestRedactPiiObjectEntitiesItem>>,
    #[serde(
        rename = "replaceStyle",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub replace_style: Option<BatchScrapeRequestRedactPiiObjectReplaceStyle>,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum BatchScrapeRequestRedactPii {
    Boolean(bool),
    Object(BatchScrapeRequestRedactPiiObject),
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequestProfile {
    pub name: String,
    #[serde(
        rename = "saveChanges",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub save_changes: Option<bool>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeRequestLinkStyle {
    #[serde(rename = "inline")]
    Inline,
    #[serde(rename = "numbered")]
    Numbered,
    #[serde(rename = "none")]
    None,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeRequest {
    pub urls: Vec<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub webhook: Option<BatchScrapeRequestWebhook>,
    #[serde(
        rename = "maxConcurrency",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub max_concurrency: Option<i64>,
    #[serde(
        rename = "appendToId",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub append_to_id: Option<String>,
    #[serde(
        rename = "ignoreInvalidURLs",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub ignore_invalid_ur_ls: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub formats: Option<Vec<BatchScrapeRequestFormatsItem>>,
    #[serde(
        rename = "onlyMainContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_main_content: Option<bool>,
    #[serde(
        rename = "onlyCleanContent",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub only_clean_content: Option<bool>,
    #[serde(
        rename = "includeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub include_tags: Option<Vec<String>>,
    #[serde(
        rename = "excludeTags",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub exclude_tags: Option<Vec<String>>,
    #[serde(rename = "maxAge", default, skip_serializing_if = "Option::is_none")]
    pub max_age: Option<i64>,
    #[serde(rename = "minAge", default, skip_serializing_if = "Option::is_none")]
    pub min_age: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub headers: Option<BTreeMap<String, String>>,
    #[serde(rename = "waitFor", default, skip_serializing_if = "Option::is_none")]
    pub wait_for: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub mobile: Option<bool>,
    #[serde(
        rename = "skipTlsVerification",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub skip_tls_verification: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timeout: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parsers: Option<Vec<BatchScrapeRequestParsersItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<BatchScrapeRequestActionsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub location: Option<BatchScrapeRequestLocation>,
    #[serde(
        rename = "removeBase64Images",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub remove_base_64_images: Option<bool>,
    #[serde(rename = "blockAds", default, skip_serializing_if = "Option::is_none")]
    pub block_ads: Option<bool>,
    #[serde(rename = "fastMode", default, skip_serializing_if = "Option::is_none")]
    pub fast_mode: Option<bool>,
    #[serde(
        rename = "storeInCache",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub store_in_cache: Option<bool>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub lockdown: Option<bool>,
    #[serde(
        rename = "checkPromptInjection",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub check_prompt_injection: Option<bool>,
    #[serde(rename = "redactPII", default, skip_serializing_if = "Option::is_none")]
    pub redact_pii: Option<BatchScrapeRequestRedactPii>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile: Option<BatchScrapeRequestProfile>,
    #[serde(
        rename = "zeroDataRetention",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub zero_data_retention: Option<bool>,
    #[serde(rename = "linkStyle", default, skip_serializing_if = "Option::is_none")]
    pub link_style: Option<BatchScrapeRequestLinkStyle>,
    #[serde(rename = "maxChars", default, skip_serializing_if = "Option::is_none")]
    pub max_chars: Option<i64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub query: Option<String>,
}
impl BatchScrapeRequest {
    pub fn new(urls: Vec<String>) -> Self {
        Self {
            urls,
            webhook: None,
            max_concurrency: None,
            append_to_id: None,
            ignore_invalid_ur_ls: None,
            formats: None,
            only_main_content: None,
            only_clean_content: None,
            include_tags: None,
            exclude_tags: None,
            max_age: None,
            min_age: None,
            headers: None,
            wait_for: None,
            mobile: None,
            skip_tls_verification: None,
            timeout: None,
            parsers: None,
            actions: None,
            location: None,
            remove_base_64_images: None,
            block_ads: None,
            fast_mode: None,
            store_in_cache: None,
            lockdown: None,
            check_prompt_injection: None,
            redact_pii: None,
            profile: None,
            zero_data_retention: None,
            link_style: None,
            max_chars: None,
            query: None,
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeResponseStatus {
    #[serde(rename = "scraping")]
    Scraping,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeResponse {
    pub success: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status: Option<BatchScrapeResponseStatus>,
    #[serde(
        rename = "queuePosition",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub queue_position: Option<i64>,
    #[serde(rename = "invalidURLs")]
    pub invalid_ur_ls: Vec<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusQuery {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub cursor: Option<String>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeStatusResponseStatus {
    #[serde(rename = "scraping")]
    Scraping,
    #[serde(rename = "completed")]
    Completed,
    #[serde(rename = "failed")]
    Failed,
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeStatusResponseErrorsItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub timestamp: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub code: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    pub retryable: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub at: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusResponseDataItemAttributesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub selector: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attribute: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub values: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeStatusResponseDataItemChangeTrackingChangeStatus {
    #[serde(rename = "new")]
    New,
    #[serde(rename = "same")]
    Same,
    #[serde(rename = "changed")]
    Changed,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusResponseDataItemChangeTracking {
    #[serde(
        rename = "previousScrapeAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub previous_scrape_at: Option<String>,
    #[serde(
        rename = "changeStatus",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_status: Option<BatchScrapeStatusResponseDataItemChangeTrackingChangeStatus>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub visibility: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub diff: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusResponseDataItemActionsScrapesItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusResponseDataItemActionsJavascriptReturnsItem {
    #[serde(rename = "type", default, skip_serializing_if = "Option::is_none")]
    pub type_: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub value: Option<BatchScrapeStatusSchema0Schema>,
}

#[derive(Clone, Deserialize, Serialize, Default)]
pub struct BatchScrapeStatusResponseDataItemActions {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshots: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub scrapes: Option<Vec<BatchScrapeStatusResponseDataItemActionsScrapesItem>>,
    #[serde(
        rename = "javascriptReturns",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub javascript_returns:
        Option<Vec<BatchScrapeStatusResponseDataItemActionsJavascriptReturnsItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub pdfs: Option<Vec<String>>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeStatusResponseDataItemMetadataCacheState {
    #[serde(rename = "hit")]
    Hit,
    #[serde(rename = "miss")]
    Miss,
    #[serde(rename = "stale")]
    Stale,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeStatusResponseDataItemMetadata {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    #[serde(rename = "ogImage", default, skip_serializing_if = "Option::is_none")]
    pub og_image: Option<String>,
    #[serde(rename = "sourceURL", default, skip_serializing_if = "Option::is_none")]
    pub source_url: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(rename = "statusCode")]
    pub status_code: i64,
    #[serde(
        rename = "contentType",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub content_type: Option<String>,
    #[serde(rename = "numPages", default, skip_serializing_if = "Option::is_none")]
    pub num_pages: Option<i64>,
    #[serde(
        rename = "totalPages",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub total_pages: Option<i64>,
    #[serde(
        rename = "cacheState",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub cache_state: Option<BatchScrapeStatusResponseDataItemMetadataCacheState>,
    #[serde(rename = "cachedAt", default, skip_serializing_if = "Option::is_none")]
    pub cached_at: Option<String>,
    #[serde(rename = "scrapeId", default, skip_serializing_if = "Option::is_none")]
    pub scrape_id: Option<String>,
    #[serde(rename = "costUsd", default, skip_serializing_if = "Option::is_none")]
    pub cost_usd: Option<f64>,
    #[serde(flatten)]
    pub extra: BTreeMap<String, Value>,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeStatusResponseDataItem {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub summary: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub html: Option<String>,
    #[serde(rename = "rawHtml", default, skip_serializing_if = "Option::is_none")]
    pub raw_html: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub links: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub images: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<BatchScrapeStatusResponseDataItemAttributesItem>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub screenshot: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub json: Option<BatchScrapeStatusSchema0Schema>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub highlights: Option<String>,
    #[serde(rename = "isTruncated")]
    pub is_truncated: bool,
    #[serde(
        rename = "nextOffset",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub next_offset: Option<i64>,
    #[serde(
        rename = "changeTracking",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub change_tracking: Option<BatchScrapeStatusResponseDataItemChangeTracking>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branding: Option<BTreeMap<String, BatchScrapeStatusSchema0Schema>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub actions: Option<BatchScrapeStatusResponseDataItemActions>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub warning: Option<String>,
    pub metadata: BatchScrapeStatusResponseDataItemMetadata,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeStatusResponse {
    pub success: bool,
    pub status: BatchScrapeStatusResponseStatus,
    #[serde(
        rename = "queuePosition",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub queue_position: Option<i64>,
    pub total: i64,
    pub completed: i64,
    pub failed: i64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    pub errors: Vec<BatchScrapeStatusResponseErrorsItem>,
    #[serde(rename = "createdAt", default, skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(
        rename = "completedAt",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub completed_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub duration: Option<f64>,
    #[serde(rename = "expiresAt", default, skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub next: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub checkpoint: Option<String>,
    pub data: Vec<BatchScrapeStatusResponseDataItem>,
}

#[derive(Clone, Deserialize, Serialize)]
pub enum BatchScrapeCancelResponseStatus {
    #[serde(rename = "cancelled")]
    Cancelled,
}

#[derive(Clone, Deserialize, Serialize)]
pub struct BatchScrapeCancelResponse {
    pub status: BatchScrapeCancelResponseStatus,
    pub success: bool,
}

impl Client {
    pub async fn extract_result(
        &self,
        id: &str,
        options: &RequestOptions,
    ) -> Result<Response<ExtractResultResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/extract/{id}", &[("id", id)])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn sign_up(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<SignUpResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/signup", &[])?,
            Some(&BTreeMap::<String, Value>::new()),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn poll_sign_up(
        &self,
        body: &PollSignUpRequest,
        options: &RequestOptions,
    ) -> Result<Response<PollSignUpResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/signup/poll", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn get_limits(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<GetLimitsResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/limits", &[])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn get_usage(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<GetUsageResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/usage", &[])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn get_logs(
        &self,
        query: &GetLogsQuery,
        options: &RequestOptions,
    ) -> Result<Response<GetLogsResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/logs", &[])?,
            None::<&Value>,
            query,
            options,
        )
        .await
    }

    pub async fn revoke_key(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<RevokeKeyResponse>, Error> {
        self.request(
            Method::DELETE,
            self.path("/v1/key", &[])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn list_parsers(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<ListParsersResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/parsers", &[])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn list_endpoints(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<ListEndpointsResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/endpoints", &[])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn search_developer(
        &self,
        body: &SearchDeveloperRequest,
        options: &RequestOptions,
    ) -> Result<Response<SearchDeveloperResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/search/developer", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn search(
        &self,
        body: &SearchRequest,
        options: &RequestOptions,
    ) -> Result<Response<SearchResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/search", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn scrape(
        &self,
        body: &ScrapeRequest,
        options: &RequestOptions,
    ) -> Result<Response<ScrapeResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/scrape", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn extract(
        &self,
        body: &ExtractRequest,
        options: &RequestOptions,
    ) -> Result<Response<ExtractResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/extract", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn browser_task(
        &self,
        body: &BrowserTaskRequest,
        options: &RequestOptions,
    ) -> Result<Response<BrowserTaskResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/browser/task", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn browser_task_status(
        &self,
        body: &BrowserTaskStatusRequest,
        options: &RequestOptions,
    ) -> Result<Response<BrowserTaskStatusResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/browser/task/status", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn parse(
        &self,
        body: &ParseRequest,
        options: &RequestOptions,
    ) -> Result<Response<ParseResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/parse", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn map(
        &self,
        body: &MapRequest,
        options: &RequestOptions,
    ) -> Result<Response<MapResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/map", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn crawl(
        &self,
        body: &CrawlRequest,
        options: &RequestOptions,
    ) -> Result<Response<CrawlResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/crawl", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn crawl_status(
        &self,
        id: &str,
        query: &CrawlStatusQuery,
        options: &RequestOptions,
    ) -> Result<Response<CrawlStatusResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/crawl/{id}", &[("id", id)])?,
            None::<&Value>,
            query,
            options,
        )
        .await
    }

    pub async fn crawl_cancel(
        &self,
        id: &str,
        options: &RequestOptions,
    ) -> Result<Response<CrawlCancelResponse>, Error> {
        self.request(
            Method::DELETE,
            self.path("/v1/crawl/{id}", &[("id", id)])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn batch_scrape(
        &self,
        body: &BatchScrapeRequest,
        options: &RequestOptions,
    ) -> Result<Response<BatchScrapeResponse>, Error> {
        self.request(
            Method::POST,
            self.path("/v1/batch/scrape", &[])?,
            Some(body),
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }

    pub async fn batch_scrape_status(
        &self,
        id: &str,
        query: &BatchScrapeStatusQuery,
        options: &RequestOptions,
    ) -> Result<Response<BatchScrapeStatusResponse>, Error> {
        self.request(
            Method::GET,
            self.path("/v1/batch/scrape/{id}", &[("id", id)])?,
            None::<&Value>,
            query,
            options,
        )
        .await
    }

    pub async fn batch_scrape_cancel(
        &self,
        id: &str,
        options: &RequestOptions,
    ) -> Result<Response<BatchScrapeCancelResponse>, Error> {
        self.request(
            Method::DELETE,
            self.path("/v1/batch/scrape/{id}", &[("id", id)])?,
            None::<&Value>,
            &[] as &[(&str, &str)],
            options,
        )
        .await
    }
}
