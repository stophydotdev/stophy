use std::{collections::BTreeSet, fs, time::Duration};

use anyhow::{Context, Result, bail};
use jiff::Timestamp;
use reqwest::Method;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use stophy::RequestOptions;

use crate::{
    config::{self, Config},
    flags, output,
};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Endpoint {
    pub id: String,
    pub method: String,
    pub path: String,
    pub input: Value,
    #[serde(default)]
    summary: Option<String>,
    #[serde(default)]
    pricing: Option<String>,
    #[serde(default)]
    cost_usd: Option<f64>,
    #[serde(default)]
    keyless: bool,
    #[serde(default)]
    example: Option<Value>,
}

#[derive(Deserialize, Serialize)]
struct Catalog {
    endpoints: Vec<Endpoint>,
    #[serde(default)]
    sources: Vec<Value>,
}

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct Cache {
    #[serde(default = "default_origin")]
    origin: String,
    fetched_at: String,
    #[serde(flatten)]
    catalog: Catalog,
}

fn default_origin() -> String {
    stophy::API_ORIGIN.to_owned()
}

impl Catalog {
    fn check(&self) -> Result<()> {
        let mut names = BTreeSet::new();
        if self.endpoints.iter().any(|endpoint| {
            !names.insert(&endpoint.id)
                || !endpoint.path.starts_with("/v1/")
                || endpoint.id.split('.').any(|part| {
                    part.is_empty()
                        || !part
                            .bytes()
                            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
                })
        }) {
            bail!(
                "The API returned an invalid endpoint catalog. Run `stophy endpoints --refresh`."
            );
        }
        Ok(())
    }
}

pub async fn load(force: bool) -> Result<Vec<Endpoint>> {
    let config = Config::load()?;
    let origin = config.origin();
    let path = config::directory().join("catalog.json");
    let cached = fs::read(&path)
        .ok()
        .and_then(|data| serde_json::from_slice::<Cache>(&data).ok())
        .filter(|cache| cache.origin == origin && cache.catalog.check().is_ok());
    if !force
        && let Some(cache) = &cached
        && cache
            .fetched_at
            .parse::<Timestamp>()
            .ok()
            .is_some_and(|fetched| Timestamp::now().as_second() - fetched.as_second() < 300)
    {
        return with_cli(cached.context("Missing catalog.")?.catalog.endpoints);
    }
    let result = async {
        let options = RequestOptions {
            timeout: Some(Duration::from_secs(10)),
            ..RequestOptions::default()
        };
        let answer = config
            .client("endpoints")?
            .call(Method::GET, "/v1/endpoints", &[], None, &[], &options)
            .await?;
        let catalog: Catalog =
            serde_json::from_value(answer.body).context("The API returned an invalid catalog.")?;
        catalog.check()?;
        Ok::<_, anyhow::Error>(catalog)
    }
    .await;
    match result {
        Ok(catalog) => {
            let cache = Cache {
                origin,
                fetched_at: Timestamp::now().to_string(),
                catalog,
            };
            let _ = config::write_json(&path, &cache);
            with_cli(cache.catalog.endpoints)
        }
        Err(_) if !force && cached.is_some() => {
            if !output::machine() {
                eprintln!("Could not refresh the endpoint catalog. Using the cached catalog.");
            }
            with_cli(cached.context("Missing catalog.")?.catalog.endpoints)
        }
        Err(error) => Err(error),
    }
}

fn with_cli(mut endpoints: Vec<Endpoint>) -> Result<Vec<Endpoint>> {
    for endpoint in &mut endpoints {
        clean_input(&mut endpoint.input);
    }
    if let Some(scrape) = endpoints
        .iter_mut()
        .find(|endpoint| endpoint.id == "scrape")
        && let Some(properties) = scrape
            .input
            .get_mut("properties")
            .and_then(Value::as_object_mut)
    {
        properties.insert(
            "parser".to_owned(),
            json!({"type":"string", "description":"Choose a site parser from stophy parsers."}),
        );
        properties.insert(
            "parserOptions".to_owned(),
            json!({"type":"object", "description":"Options for --parser as JSON."}),
        );
    }
    let jobs = [
        ("agent.list", "List recent agent runs", "GET", "/v1/agent"),
        (
            "agent.status",
            "Check an agent run and read its answer",
            "GET",
            "/v1/agent/{id}",
        ),
        (
            "agent.cancel",
            "Stop an agent run",
            "DELETE",
            "/v1/agent/{id}",
        ),
        (
            "crawl.status",
            "Check a crawl and read its pages",
            "GET",
            "/v1/crawl/{id}",
        ),
        ("crawl.cancel", "Stop a crawl", "DELETE", "/v1/crawl/{id}"),
        (
            "batch.scrape.status",
            "Check a batch scrape and read its pages",
            "GET",
            "/v1/batch/scrape/{id}",
        ),
        (
            "batch.scrape.cancel",
            "Stop a batch scrape",
            "DELETE",
            "/v1/batch/scrape/{id}",
        ),
        (
            "extract.status",
            "Check an extract and read its result",
            "GET",
            "/v1/extract/{id}",
        ),
    ];
    for (id, summary, method, path) in jobs {
        let (parent, _) = id.rsplit_once('.').context("Invalid job command.")?;
        if endpoints.iter().any(|endpoint| endpoint.id == id)
            || !endpoints.iter().any(|endpoint| endpoint.id == parent)
        {
            continue;
        }
        let input = if id == "agent.list" {
            json!({"properties": {"before": {"type":"integer","minimum":1}, "limit":{"type":"integer","minimum":1,"maximum":20}}})
        } else {
            let mut properties = Map::new();
            let pattern = if parent == "agent" {
                json!({"pattern":"^[A-Za-z0-9_-]{1,100}$","type":"string"})
            } else {
                json!({"type":"string","minLength":1})
            };
            properties.insert("id".to_owned(), pattern);
            if method == "GET" && matches!(parent, "crawl" | "batch.scrape") {
                properties.insert("cursor".to_owned(), json!({"type":"string","description":"The cursor in the next link of the previous answer."}));
            }
            json!({"properties":properties, "required":["id"]})
        };
        endpoints.push(Endpoint {
            id: id.to_owned(),
            input,
            summary: Some(summary.to_owned()),
            cost_usd: (parent == "agent").then_some(0.0),
            method: method.to_owned(),
            path: path.to_owned(),
            pricing: None,
            keyless: false,
            example: None,
        });
    }
    endpoints.sort_unstable_by(|left, right| left.id.cmp(&right.id));
    Ok(endpoints)
}

fn clean_input(schema: &mut Value) {
    if let Some(fields) = schema.get_mut("properties").and_then(Value::as_object_mut) {
        fields.retain(|key, field| {
            key != "proxy" && key != "maxCredits" && field["deprecated"] != true
        });
        for field in fields.values_mut() {
            clean_input(field);
        }
    }
}

impl Endpoint {
    pub fn help(&self) -> String {
        let name = self.id.replace('.', " ");
        let mut description = format!(
            "Usage: stophy {name} [options]\n\n{}\n\nPrice: {}\n\n{}",
            self.summary.as_deref().unwrap_or(&self.id),
            self.price(),
            flags::help(&self.input)
        );
        if self.id == "browser.task" {
            description.push_str("\n  --no-wait  Print the task ID without waiting for the answer");
        }
        if let Some(sample) = self.example.as_ref().and_then(Value::as_object) {
            let flags = sample
                .iter()
                .map(|(key, value)| {
                    if value == &Value::Bool(true) {
                        format!("--{key}")
                    } else {
                        let value = value
                            .as_str()
                            .map_or_else(|| value.to_string(), str::to_owned);
                        format!("--{key} {}", quote(&value))
                    }
                })
                .collect::<Vec<_>>()
                .join(" ");
            description.push_str(&format!("\n\nExample:\n  stophy {name} {flags}"));
        }
        description
    }

    fn price(&self) -> String {
        self.pricing
            .clone()
            .or_else(|| self.cost_usd.map(output::usd))
            .unwrap_or_else(|| "Shown in your usage".to_owned())
    }

    pub async fn send(&self, mut body: Map<String, Value>) -> Result<stophy::Response<Value>> {
        let method = match self.method.as_str() {
            "GET" => Method::GET,
            "POST" => Method::POST,
            "DELETE" => Method::DELETE,
            _ => bail!("The catalog contains an invalid request method."),
        };
        let config = Config::load()?;
        let client = config.client(&self.id)?;
        let options = RequestOptions::default();
        if method == Method::POST {
            let parser = body.shift_remove("parser");
            let parser_options = body.shift_remove("parserOptions");
            if let Some(parser) = parser {
                let mut options = parser_options.unwrap_or_else(|| json!({}));
                options
                    .as_object_mut()
                    .context("--parserOptions must be a JSON object.")?
                    .entry("lean")
                    .or_insert(Value::Bool(true));
                let format = json!({"type":"json","parser":parser,"options":options});
                body.entry("formats")
                    .or_insert_with(|| json!([]))
                    .as_array_mut()
                    .context("--formats must be a JSON array.")?
                    .push(format);
            } else if parser_options.is_some() {
                bail!("--parserOptions needs --parser.");
            }
        }
        let body = Value::Object(body);
        let mut substitutions = Vec::new();
        for part in self.path.split('/') {
            let Some(field) = part
                .strip_prefix('{')
                .and_then(|part| part.strip_suffix('}'))
            else {
                continue;
            };
            let value = body
                .get(field)
                .and_then(Value::as_str)
                .with_context(|| format!("Missing required flag --{field}."))?;
            substitutions.push((field, value));
        }
        if method == Method::POST {
            return Ok(client
                .call(
                    method,
                    &self.path,
                    &substitutions,
                    Some(&body),
                    &[],
                    &options,
                )
                .await?);
        }
        let query = output::query(
            body.as_object()
                .into_iter()
                .flatten()
                .filter(|(key, _)| !substitutions.iter().any(|(field, _)| field == key)),
        );
        Ok(client
            .call(method, &self.path, &substitutions, None, &query, &options)
            .await?)
    }
}

fn quote(value: &str) -> String {
    if !value.is_empty()
        && value
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"@%+=:,./-_".contains(&byte))
    {
        value.to_owned()
    } else {
        format!("'{}'", value.replace('\'', "'\\''"))
    }
}

pub async fn endpoints(endpoints: &[Endpoint], term: Option<&str>) -> Result<()> {
    let term = term.unwrap_or_default().trim().to_ascii_lowercase();
    let mut rows = endpoints
        .iter()
        .filter(|endpoint| endpoint.id.to_ascii_lowercase().contains(&term))
        .map(|endpoint| {
            format!(
                "{}  {}{}",
                endpoint.id,
                endpoint.price(),
                if endpoint.keyless { "  free" } else { "" }
            )
        })
        .collect::<Vec<_>>();
    if !term.is_empty() {
        match parsers(&term).await {
            Ok(parsers) => rows.extend(parsers.iter().map(parser_line)),
            Err(error) if rows.is_empty() => return Err(error),
            Err(_) => {}
        }
    }
    if rows.is_empty() {
        rows.push(format!("No endpoints or parsers match `{term}`."));
    }
    output::text(&rows.join("\n"))
}

pub async fn parsers(term: &str) -> Result<Vec<Value>> {
    let answer = Config::load()?
        .client("parsers")?
        .call(
            Method::GET,
            "/v1/parsers",
            &[],
            None,
            &[],
            &RequestOptions::default(),
        )
        .await?;
    let term = term.trim().to_ascii_lowercase();
    let parsers = answer.body["data"]["parsers"]
        .as_array()
        .context("The API returned an invalid parser list.")?;
    let matched = |parser: &Value| {
        ["name", "takes", "returnsSummary"]
            .into_iter()
            .any(|field| {
                parser[field]
                    .as_str()
                    .is_some_and(|part| part.to_ascii_lowercase().contains(&term))
            })
            || parser["returns"].as_array().is_some_and(|fields| {
                fields.iter().any(|field| {
                    field
                        .as_str()
                        .is_some_and(|field| field.to_ascii_lowercase().contains(&term))
                })
            })
    };
    let related = |parser: &Value| {
        parser["takes"]
            .as_str()
            .zip(parser["example"].as_str())
            .map(|(takes, example)| (takes.to_owned(), example.to_owned()))
    };
    let groups = parsers
        .iter()
        .filter(|parser| matched(parser))
        .filter_map(related)
        .collect::<BTreeSet<_>>();
    Ok(parsers
        .iter()
        .filter(|parser| {
            matched(parser) || related(parser).is_some_and(|group| groups.contains(&group))
        })
        .cloned()
        .collect())
}

pub fn parser_line(parser: &Value) -> String {
    let name = parser["name"].as_str().unwrap_or_default();
    let summary = parser["returnsSummary"].as_str().unwrap_or_default();
    let price = parser["price"].as_str().unwrap_or_default();
    let access = if parser["keyless"] == true {
        "keyless"
    } else {
        "keyed"
    };
    format!("{name}  {summary}  {price}  {access}")
}

pub fn remove_parser_examples(parser: &mut Value) {
    if let Some(entry) = parser.as_object_mut() {
        entry.remove("response");
        if let Some(views) = entry.get_mut("views").and_then(Value::as_array_mut) {
            for view in views.iter_mut().filter_map(Value::as_object_mut) {
                view.remove("response");
            }
        }
    }
}

pub fn takes(parser: &Value) -> String {
    parser["takes"]
        .as_str()
        .unwrap_or_default()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn parser_example(parser: &Value) -> String {
    let name = parser["name"].as_str().unwrap_or_default();
    let takes = takes(parser);
    let example = parser["example"].as_str().unwrap_or_default();
    format!(
        "{name}\n  {takes}\n  stophy scrape {} --parser {}",
        quote(example),
        quote(name)
    )
}
