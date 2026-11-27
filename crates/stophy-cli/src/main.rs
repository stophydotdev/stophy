mod auth;
mod browser;
mod catalog;
mod config;
mod flags;
mod output;
mod update;

use std::{env, process::ExitCode};

use anyhow::{Context, Result, bail};
use serde_json::{Value, json};
use stophy::RequestOptions;

use crate::config::Config;

pub const VERSION: &str = env!("CARGO_PKG_VERSION");

const HELP: &str = "Usage: stophy <command> [options]

  search <query>      Search the web.
  scrape <url>        Read a page.
  endpoints [term]    Find commands and site parsers.
  describe <name>     See options and an example.
  parsers [term]      List site parsers.
  login              Sign in.
  logout             Revoke the saved key.
  status             Check the active key and balance.
  mcp                Start the MCP server over stdio.

Run stophy endpoints for every command or stophy <command> --help for options.";

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    let args = env::args_os()
        .skip(1)
        .map(|arg| {
            arg.into_string()
                .ok()
                .context("Arguments must be valid UTF-8.")
        })
        .collect::<Result<Vec<_>>>();
    let result = match args {
        Ok(args) => {
            let parser_input = args.first().is_some_and(|arg| arg == "scrape")
                && args.iter().any(|arg| {
                    ["--parser", "--formats"].iter().any(|flag| {
                        arg == flag
                            || arg
                                .strip_prefix(flag)
                                .is_some_and(|tail| tail.starts_with('='))
                    })
                });
            match run(&args).await {
                Ok(code) => {
                    if code == 0
                        && args.first().is_some_and(|arg| {
                            !matches!(arg.as_str(), "mcp" | update::COMMAND | "--version")
                        })
                    {
                        update::notice();
                    }
                    return ExitCode::from(code);
                }
                Err(error) => (error, parser_input),
            }
        }
        Err(error) => (error, false),
    };
    output::failure(&result.0, result.1);
    ExitCode::FAILURE
}

async fn run(args: &[String]) -> Result<u8> {
    let (command, options) = args
        .split_first()
        .map_or(("", &[][..]), |(command, rest)| (command.as_str(), rest));
    if options.len() == 1 && options[0] == "--help" {
        let usage = match command {
            "login" => {
                "stophy login [--browser | --api-key]\nRead a key from stdin with --api-key."
            }
            "endpoints" => "stophy endpoints [term] [--refresh]",
            "describe" => "stophy describe <endpoint or parser>",
            "parsers" => "stophy parsers [term] [--json] [--example]",
            "status" => "stophy status",
            "logout" => "stophy logout",
            "mcp" => "stophy mcp",
            _ => "",
        };
        if !usage.is_empty() {
            output::text(&format!("Usage: {usage}"))?;
            return Ok(0);
        }
    }
    match command {
        "" | "--help" if options.is_empty() => output::text(HELP)?,
        "--version" if options.is_empty() => output::text(VERSION)?,
        update::COMMAND if options.is_empty() => {
            let _ = update::refresh().await;
        }
        "mcp" if options.is_empty() => {
            let config = Config::load()?;
            let url = match env::var("STOPHY_MCP_URL") {
                Ok(url) => url,
                Err(_) => stophy::http_url(&config.origin())?.join("/mcp")?.into(),
            };
            stophy_mcp::run(&url, config.key_for(&url).as_deref()).await?;
        }
        "login" => {
            auth::login(options).await?;
            output::print(&json!({"authenticated":true}))?;
        }
        "logout" if options.is_empty() => {
            let config = Config::load()?;
            if let Some(key) = &config.api_key {
                let result = stophy::Client::with_origin(config.stored_origin(), Some(key))?
                    .revoke_key(&RequestOptions::default())
                    .await;
                match result {
                    Err(stophy::Error::Api(error))
                        if matches!(error.status.as_u16(), 401 | 404) => {}
                    result => {
                        result?;
                    }
                }
                Config::edit(|stored| {
                    if stored.api_key == config.api_key
                        && stored.stored_origin() == config.stored_origin()
                    {
                        stored.api_key = None;
                    }
                })?;
            }
            output::print(&json!({"credentials":Config::load()?.source()}))?;
        }
        "status" if options.is_empty() => {
            let config = Config::load()?;
            let mut status = json!({"version":VERSION,"credentials":config.source(),"config":config::directory().join("config.json")});
            if config.source() != "none" {
                let limits = config
                    .client("status")?
                    .get_limits(&RequestOptions::default())
                    .await?
                    .body
                    .data;
                status["balanceUsd"] = json!(limits.balance_usd);
            } else {
                status["next"] = json!("Run stophy login or set STOPHY_API_KEY.");
            }
            output::print(&status)?;
        }
        "parsers" => {
            let examples = options.iter().any(|option| option == "--example");
            let json = options.iter().any(|option| option == "--json");
            let terms: Vec<_> = options
                .iter()
                .filter(|option| !matches!(option.as_str(), "--example" | "--json"))
                .cloned()
                .collect();
            let term = term(&terms, "parsers")?.unwrap_or_default();
            let mut parsers = catalog::parsers(term).await?;
            if output::machine() || json || examples {
                if !examples {
                    for parser in &mut parsers {
                        catalog::remove_parser_examples(parser);
                    }
                }
                output::print(&Value::Array(parsers))?;
            } else if parsers.is_empty() {
                output::text(&format!("No parsers match `{term}`."))?;
            } else {
                let rows = parsers.iter().map(catalog::parser_line).collect::<Vec<_>>();
                output::text(&rows.join("\n"))?;
            }
        }
        "endpoints" => {
            let refresh = options.last().is_some_and(|option| option == "--refresh");
            let options = if refresh {
                &options[..options.len() - 1]
            } else {
                options
            };
            let term = term(options, "endpoints")?;
            let endpoints = match catalog::load(refresh).await {
                Ok(endpoints) => endpoints,
                Err(_) if term.is_some() && !refresh => Vec::new(),
                Err(error) => return Err(error),
            };
            catalog::endpoints(&endpoints, term).await?;
        }
        "describe" => {
            let name = term(options, "describe")?.context("Give an endpoint or parser name.")?;
            let names = catalog::load(false).await;
            if let Some(endpoint) = names
                .as_ref()
                .ok()
                .and_then(|endpoints| endpoints.iter().find(|endpoint| endpoint.id == name))
            {
                output::text(&endpoint.help())?;
            } else if let Some(parser) = catalog::parsers(name)
                .await?
                .iter()
                .find(|parser| parser["name"] == name)
            {
                output::text(&catalog::parser_example(parser))?;
            } else {
                bail!(
                    "No endpoint or parser named `{name}`. Run `stophy parsers` to list parser names."
                );
            }
        }
        _ if command.starts_with('-') => bail!("Unknown option {command}. Run `stophy --help`."),
        _ => return dynamic(&catalog::load(false).await?, args).await,
    }
    Ok(0)
}

fn term<'a>(options: &'a [String], command: &str) -> Result<Option<&'a str>> {
    match options {
        [one] if !one.starts_with('-') => Ok(Some(one)),
        [] => Ok(None),
        _ => bail!("Run `stophy {command} --help` for the accepted arguments."),
    }
}

async fn dynamic(endpoints: &[catalog::Endpoint], args: &[String]) -> Result<u8> {
    let Some((endpoint, count)) = endpoints
        .iter()
        .filter_map(|endpoint| {
            let parts = endpoint.id.split('.').collect::<Vec<_>>();
            (args.len() >= parts.len()
                && args.iter().zip(&parts).all(|(token, part)| token == part))
            .then_some((endpoint, parts.len()))
        })
        .max_by_key(|(_, len)| *len)
    else {
        let head = &args[0];
        bail!(
            "Unknown command `stophy {}`. Run `stophy endpoints {head}` for commands and parsers.",
            args[..args.len().min(2)].join(" ")
        );
    };
    let options = &args[count..];
    if options.iter().any(|arg| arg == "--help") {
        let mut help = endpoint.help();
        let prefix = format!("{}.", endpoint.id);
        for child in endpoints
            .iter()
            .filter(|endpoint| endpoint.id.starts_with(&prefix))
        {
            help.push_str(&format!("\n  stophy {}", child.id.replace('.', " ")));
        }
        output::text(&help)?;
        return Ok(0);
    }
    let body = if endpoint.id == "browser.task" {
        browser::task(endpoint, options).await?
    } else {
        endpoint
            .send(flags::parse(options, &endpoint.input)?)
            .await?
            .body
    };
    if body["success"] == false
        || (endpoint.id.starts_with("browser.task") && body["data"]["status"] == "failed")
    {
        let message = body["error"]["message"]
            .as_str()
            .or_else(|| body["error"].as_str())
            .or_else(|| body["data"]["error"].as_str())
            .unwrap_or("The task failed.");
        eprintln!("{message} Check the response before retrying.");
        output::print(&body)?;
        return Ok(1);
    }
    output::print(&stophy::agent_answer(&endpoint.id, body))?;
    Ok(0)
}
