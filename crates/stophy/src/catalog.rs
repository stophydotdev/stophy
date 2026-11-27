use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use crate::{Client, Error, RequestOptions, Response};
use reqwest::Method;

pub type ListEndpoints26Schema0Schema = Value;

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

impl Client {
    pub async fn list_endpoints(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<ListEndpointsResponse>, Error> {
        let response = self
            .call(Method::GET, "/openapi.json", &[], None, &[], options)
            .await?;
        let body = serde_json::from_value(response.body["x-stophy-catalog"].clone())
            .map_err(Error::Decode)?;
        Ok(Response {
            body,
            status: response.status,
            headers: response.headers,
        })
    }

    pub async fn list_parsers(
        &self,
        options: &RequestOptions,
    ) -> Result<Response<ListParsersResponse>, Error> {
        let response = self
            .call(Method::GET, "/openapi.json", &[], None, &[], options)
            .await?;
        let body = serde_json::from_value(json!({ "success": true, "data": { "parsers": response.body["x-stophy-catalog"]["parsers"] } })).map_err(Error::Decode)?;
        Ok(Response {
            body,
            status: response.status,
            headers: response.headers,
        })
    }
}
