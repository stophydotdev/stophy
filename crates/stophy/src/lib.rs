use std::time::{Duration, SystemTime};

use reqwest::{
    Method, StatusCode, Url,
    header::{self, HeaderMap, HeaderValue},
};
use serde::{Serialize, de::DeserializeOwned};
use serde_json::Value;

mod generated;
pub use generated::*;

pub const API_ORIGIN: &str = "https://api.stophy.dev";

#[derive(Clone)]
pub struct Client {
    http: reqwest::Client,
    origin: Url,
    headers: HeaderMap,
    deadline: Duration,
}

#[derive(Default, Clone)]
pub struct RequestOptions {
    pub idempotency_key: Option<String>,
    pub max_text_length: Option<u64>,
    pub timeout: Option<Duration>,
}

pub struct Response<T> {
    pub body: T,
    pub status: StatusCode,
    pub headers: HeaderMap,
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Use an HTTP or HTTPS API origin without credentials.")]
    InvalidOrigin,
    #[error("Use an absolute path on the configured API origin.")]
    InvalidPath,
    #[error("An HTTP header contains invalid characters.")]
    InvalidHeader,
    #[error("The API is unreachable. Check your connection and try again.")]
    Network(#[source] reqwest::Error),
    #[error("The API request timed out.")]
    Timeout,
    #[error("The API returned an unexpected response. Check for a newer Stophy client.")]
    Decode(#[source] serde_json::Error),
    #[error(transparent)]
    Api(#[from] Box<ApiError>),
}

#[derive(Debug, thiserror::Error)]
#[error("{message}")]
pub struct ApiError {
    pub status: StatusCode,
    pub message: String,
    pub code: Option<String>,
    pub retryable: bool,
    pub retry_after: Option<Duration>,
    pub request_id: Option<String>,
    pub body: Value,
}

pub fn http_client(user_agent: &str) -> Result<reqwest::Client, Error> {
    reqwest::Client::builder()
        .user_agent(user_agent)
        .connect_timeout(Duration::from_secs(10))
        .redirect(reqwest::redirect::Policy::none())
        .retry(reqwest::retry::never())
        .build()
        .map_err(Error::Network)
}

pub fn http_url(value: &str) -> Result<Url, Error> {
    let url = Url::parse(value).map_err(|_| Error::InvalidOrigin)?;
    if !matches!(url.scheme(), "http" | "https")
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err(Error::InvalidOrigin);
    }
    Ok(url)
}

impl Client {
    pub fn new(api_key: &str) -> Result<Self, Error> {
        Self::with_origin(API_ORIGIN, Some(api_key))
    }

    pub fn with_origin(origin: &str, api_key: Option<&str>) -> Result<Self, Error> {
        let mut client = Self {
            http: http_client(concat!("stophy-rust/", env!("CARGO_PKG_VERSION")))?,
            origin: http_url(origin)?,
            headers: HeaderMap::new(),
            deadline: Duration::from_secs(310),
        };
        if let Some(key) = api_key.filter(|key| !key.trim().is_empty()) {
            client.set_header(header::AUTHORIZATION, &format!("Bearer {}", key.trim()))?;
        }
        Ok(client)
    }

    pub fn set_header(&mut self, name: header::HeaderName, value: &str) -> Result<(), Error> {
        let mut value = HeaderValue::from_str(value).map_err(|_| Error::InvalidHeader)?;
        if matches!(name, header::AUTHORIZATION | header::COOKIE) {
            value.set_sensitive(true);
        }
        self.headers.insert(name, value);
        Ok(())
    }

    pub fn path(&self, template: &str, substitutions: &[(&str, &str)]) -> Result<Url, Error> {
        if !template.starts_with('/') || template.starts_with("//") {
            return Err(Error::InvalidPath);
        }
        let mut url = self.origin.clone();
        url.set_query(None);
        url.set_fragment(None);
        let mut path = url.path_segments_mut().map_err(|_| Error::InvalidPath)?;
        path.clear();
        for segment in template[1..].split('/') {
            if let Some(name) = segment
                .strip_prefix('{')
                .and_then(|value| value.strip_suffix('}'))
            {
                let (_, value) = substitutions
                    .iter()
                    .find(|(key, _)| *key == name)
                    .ok_or(Error::InvalidPath)?;
                if value.is_empty() || matches!(*value, "." | "..") {
                    return Err(Error::InvalidPath);
                }
                path.push(value);
            } else if segment
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'-' | b'_'))
            {
                path.push(segment);
            } else {
                return Err(Error::InvalidPath);
            }
        }
        drop(path);
        Ok(url)
    }

    pub async fn request<B: Serialize + ?Sized, Q: Serialize + ?Sized, T: DeserializeOwned>(
        &self,
        method: Method,
        url: Url,
        body: Option<&B>,
        query: &Q,
        options: &RequestOptions,
    ) -> Result<Response<T>, Error> {
        if url.origin() != self.origin.origin()
            || !url.username().is_empty()
            || url.password().is_some()
        {
            return Err(Error::InvalidPath);
        }
        let mut request = self
            .http
            .request(method, url)
            .headers(self.headers.clone())
            .header(header::ACCEPT, "application/json")
            .query(query);
        if let Some(body) = body {
            request = request.json(body);
        }
        if let Some(key) = &options.idempotency_key {
            request = request.header("Idempotency-Key", key);
        }
        if let Some(length) = options.max_text_length {
            request = request.query(&[("maxTextLength", length)]);
        }
        let request = request.build().map_err(Error::Network)?;
        let timeout = options.timeout.unwrap_or(self.deadline);
        tokio::time::timeout(timeout, async {
            for attempt in 0.. {
                let copy = request.try_clone().ok_or(Error::InvalidPath)?;
                let response = self.http.execute(copy).await.map_err(Error::Network)?;
                let status = response.status();
                let headers = response.headers().clone();
                let bytes = response.bytes().await.map_err(Error::Network)?;
                if status.is_success() {
                    let body = serde_json::from_slice(&bytes).map_err(Error::Decode)?;
                    return Ok(Response {
                        body,
                        status,
                        headers,
                    });
                }

                let body = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
                let error = api_error(status, &headers, body);
                if !error.retryable || attempt >= 3 {
                    return Err(Box::new(error).into());
                }
                let delay = error
                    .retry_after
                    .unwrap_or_else(|| Duration::from_millis(250 << attempt));
                if delay > Duration::from_secs(60) || delay >= timeout {
                    return Err(Box::new(error).into());
                }
                tokio::time::sleep(delay).await;
            }
            Err(Error::Timeout)
        })
        .await
        .map_err(|_| Error::Timeout)?
    }

    pub async fn call(
        &self,
        method: Method,
        path: &str,
        substitutions: &[(&str, &str)],
        body: Option<&Value>,
        query: &[(String, String)],
        options: &RequestOptions,
    ) -> Result<Response<Value>, Error> {
        self.request(
            method,
            self.path(path, substitutions)?,
            body,
            query,
            options,
        )
        .await
    }
}

fn api_error(status: StatusCode, headers: &HeaderMap, body: Value) -> ApiError {
    let details = body["error"]
        .as_object()
        .map(|_| &body["error"])
        .unwrap_or(&body);
    let delay_header = headers
        .get(header::RETRY_AFTER)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            value
                .parse::<u64>()
                .ok()
                .map(Duration::from_secs)
                .or_else(|| {
                    httpdate::parse_http_date(value)
                        .ok()
                        .map(|date| date.duration_since(SystemTime::now()).unwrap_or_default())
                })
        });
    ApiError {
        status,
        message: details["message"]
            .as_str()
            .or_else(|| body["error"].as_str())
            .map(str::to_owned)
            .unwrap_or_else(|| format!("Request failed with HTTP {}.", status.as_u16())),
        code: details["code"].as_str().map(str::to_owned),
        retryable: details["retryable"]
            .as_bool()
            .unwrap_or(delay_header.is_some()),
        retry_after: details["retryAfterSeconds"]
            .as_u64()
            .map(Duration::from_secs)
            .or(delay_header),
        request_id: details["requestId"]
            .as_str()
            .or_else(|| body["requestId"].as_str())
            .or_else(|| {
                headers
                    .get("x-request-id")
                    .and_then(|value| value.to_str().ok())
            })
            .map(str::to_owned),
        body,
    }
}

pub fn agent_answer(operation: &str, mut answer: Value) -> Value {
    let Some(fields) = answer.as_object_mut() else {
        return answer;
    };
    if fields.get("success") != Some(&Value::Bool(true)) {
        return answer;
    }
    for key in ["success", "creditsUsed", "costUsd", "requestId"] {
        fields.remove(key);
    }
    if matches!(operation, "scrape" | "parse")
        && let Some(data) = fields.get_mut("data").and_then(Value::as_object_mut)
    {
        if data.get("isTruncated") == Some(&Value::Bool(false)) {
            data.remove("isTruncated");
        }
        if let Some(metadata) = data.get_mut("metadata").and_then(Value::as_object_mut) {
            metadata.retain(|key, value| {
                matches!(key.as_str(), "title" | "sourceURL" | "url")
                    && value.as_str().is_some_and(|value| !value.is_empty())
            });
            if metadata.is_empty() {
                data.remove("metadata");
            }
        }
    }
    if fields.len() == 1
        && let Some(data) = fields.remove("data")
    {
        return data;
    }
    answer
}
