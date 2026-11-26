use std::io::{self, IsTerminal, Write};

use anyhow::Result;
use serde_json::Value;

use crate::config::{Config, agent};

pub fn machine() -> bool {
    !io::stdout().is_terminal() || agent().is_some()
}

pub fn text(message: &str) -> Result<()> {
    let mut out = io::stdout().lock();
    if let Err(error) = writeln!(out, "{message}")
        && error.kind() != io::ErrorKind::BrokenPipe
    {
        return Err(error.into());
    }
    Ok(())
}

pub fn print(data: &Value) -> Result<()> {
    text(&serde_json::to_string(data)?)
}

pub fn usd(value: f64) -> String {
    if value != 0.0 && value.abs() < 0.01 {
        format!("${value:.4}")
    } else {
        format!("${value:.2}")
    }
}

pub fn query<'a>(input: impl Iterator<Item = (&'a String, &'a Value)>) -> Vec<(String, String)> {
    input
        .filter_map(|(key, value)| {
            if value.is_string() || value.is_boolean() || value.is_number() {
                Some((
                    key.clone(),
                    value
                        .as_str()
                        .map_or_else(|| value.to_string(), str::to_owned),
                ))
            } else {
                None
            }
        })
        .collect()
}

pub fn failure(error: &anyhow::Error, parser_input: bool) {
    let mut message = error.to_string();
    let mut request_id = None;
    if let Some(stophy::Error::Api(error)) = error.downcast_ref::<stophy::Error>() {
        request_id = error.request_id.clone();
        let hint = match error.status.as_u16() {
            401 => "Check STOPHY_API_KEY or run `stophy login`.",
            402 => "Check your balance with `stophy status`.",
            429 => "Wait before trying again.",
            400 | 422 if parser_input => {
                "Set formats[].parser with --formats, or use --parser <name>. Run `stophy parsers` to find a name."
            }
            400 | 422 => "Check the arguments with `stophy <command> --help`.",
            404 => "Check the URL or ID and try again.",
            500..=599 => "Try again in a moment.",
            _ => "",
        };
        if !hint.is_empty() {
            message.push(' ');
            message.push_str(hint);
        }
        if let Some(delay) = error.retry_after {
            message.push_str(&format!(" Retry after {}s.", delay.as_secs()));
        }
    }
    if let Ok(config) = Config::load() {
        for secret in [config.key(), config.api_key].into_iter().flatten() {
            message = message.replace(&secret, "[redacted]");
            if request_id.as_ref().is_some_and(|id| id.contains(&secret)) {
                request_id = None;
            }
        }
    }
    eprintln!("{message}");
    if let Some(id) = request_id {
        eprintln!("Request id: {id}");
    }
}
