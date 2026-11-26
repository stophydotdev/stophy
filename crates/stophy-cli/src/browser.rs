use std::time::Duration;

use anyhow::{Context, Result, bail};
use reqwest::Method;
use serde_json::{Value, json};
use stophy::RequestOptions;
use tokio::time::timeout;

use crate::{catalog::Endpoint, config::Config, flags};

pub async fn task(endpoint: &Endpoint, args: &[String]) -> Result<Value> {
    let no_wait = args.iter().any(|arg| arg == "--no-wait");
    let args = args
        .iter()
        .filter(|arg| *arg != "--no-wait")
        .cloned()
        .collect::<Vec<_>>();
    let started = endpoint
        .send(flags::parse(&args, &endpoint.input)?)
        .await?
        .body;
    if no_wait || started["success"] == false {
        return Ok(started);
    }
    let id = started["data"]["id"]
        .as_str()
        .or_else(|| started["id"].as_str())
        .context("The API did not return a task ID.")?;
    let client = Config::load()?.client("browser.task.status")?;
    let body = json!({"id":id,"wait":60});
    let poll = async {
        loop {
            let answer = client
                .call(
                    Method::POST,
                    "/v1/browser/task/status",
                    &[],
                    Some(&body),
                    &[],
                    &RequestOptions::default(),
                )
                .await?;
            if answer.body["data"]["status"] != "running" {
                return Ok::<_, stophy::Error>(answer.body);
            }
        }
    };
    let result = tokio::select! {
        result = timeout(Duration::from_secs(720), poll) => result,
        _ = tokio::signal::ctrl_c() => bail!("Stopped waiting for task {id}. Run `stophy browser task status {id}` to read it."),
    };
    match result {
        Ok(Ok(answer)) => Ok(answer),
        Ok(Err(error)) => {
            eprintln!("Task {id} has started. Run `stophy browser task status {id}` to read it.");
            Err(error.into())
        }
        Err(_) => {
            bail!("Task {id} is still running. Run `stophy browser task status {id}` to read it.")
        }
    }
}
