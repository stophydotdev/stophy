use std::{
    env,
    io::{self, IsTerminal, Read},
    time::Duration,
};

use anyhow::{Context, Result, bail};
use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use reqwest::Method;
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use stophy::RequestOptions;
use tokio::time::{Instant, sleep};
use uuid::Uuid;

use crate::config::{Config, Pending};

pub async fn login(args: &[String]) -> Result<()> {
    match args {
        [mode] if mode == "--browser" => browser_login().await,
        [mode] if mode == "--api-key" => {
            let input = if io::stdin().is_terminal() {
                rpassword::prompt_password("Paste your Stophy API key: ")?
            } else {
                let mut input = String::new();
                io::stdin().read_to_string(&mut input)?;
                input
            };
            store_key(input.trim())
        }
        [] if Config::load()?.source() != "none" => Ok(()),
        [] if io::stdin().is_terminal() => browser_login().await,
        [] => signup().await,
        _ => bail!("Run `stophy login --browser`, or pipe a key to `stophy login --api-key`."),
    }
}

fn store_key(key: &str) -> Result<()> {
    if !key.starts_with("st_") {
        bail!("API key must start with `st_`.");
    }
    if key.len() < 10 {
        bail!("API key is too short.");
    }
    Config::save_key(key.to_owned())
}

fn display_code(challenge: &str) -> String {
    let bytes: [u8; 32] = Sha256::digest(challenge).into();
    let alphabet = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    let bits = bytes[..5]
        .iter()
        .fold(0u64, |bits, byte| (bits << 8) | u64::from(*byte));
    let mut code = String::with_capacity(9);
    for index in 0..8 {
        if index == 4 {
            code.push('-');
        }
        code.push(char::from(
            alphabet[((bits >> (35 - index * 5)) & 31) as usize],
        ));
    }
    code
}

pub async fn browser_login() -> Result<()> {
    let config = Config::load()?;
    let origin = config.origin();
    let frontend = config.frontend();
    let base = stophy::http_url(&origin)?;
    let mut link = stophy::http_url(&frontend)?.join("/cli-auth")?;
    let session = Uuid::new_v4().to_string();
    let mut random = [0; 32];
    getrandom::fill(&mut random)
        .map_err(|_| anyhow::anyhow!("Could not generate a login code."))?;
    let verifier = URL_SAFE_NO_PAD.encode(random);
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(&verifier));
    link.query_pairs_mut()
        .append_pair("session_id", &session)
        .append_pair("code_challenge", &challenge);

    let http = stophy::http_client(concat!("stophy-cli/", env!("CARGO_PKG_VERSION")))?;
    let init = base.join("/api/cli/init")?;
    let status = base.join("/api/cli/status")?;
    let mut start = json!({"session_id": session, "code_challenge": challenge});
    if let Ok(host) = hostname::get() {
        let host = host.to_string_lossy();
        let cleaned = host
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
            .chars()
            .filter(|c| c.is_alphanumeric() || " ._'-".contains(*c))
            .take(64)
            .collect::<String>();
        if !cleaned.trim().is_empty() {
            start["device_name"] = json!(cleaned.trim());
        }
    }
    let mut reply = http
        .post(init.clone())
        .json(&start)
        .timeout(Duration::from_secs(15))
        .send()
        .await
        .context("Could not reach Stophy. Check STOPHY_BASE_URL and try again.")?;
    if reply.status() == 400 && start.get("device_name").is_some() {
        start
            .as_object_mut()
            .context("Invalid login request.")?
            .remove("device_name");
        reply = http
            .post(init)
            .json(&start)
            .timeout(Duration::from_secs(15))
            .send()
            .await?;
    }
    if !reply.status().is_success() {
        let answer = reply.json::<Value>().await.unwrap_or(Value::Null);
        let message = answer["error"]
            .as_str()
            .unwrap_or("Failed to start browser login.");
        bail!("{message} Run `stophy login --browser` again.");
    }
    eprintln!("{link}\nYour code: {}", display_code(&challenge));
    if env::var("NO_OPEN_BROWSER").as_deref() != Ok("1")
        && open::that_detached(link.as_str()).is_err()
    {
        eprintln!("Open the URL above in your browser.");
    }
    let body = json!({"session_id": session, "code_verifier": verifier});
    let deadline = Instant::now() + Duration::from_secs(600);
    while let Some(remaining) = deadline.checked_duration_since(Instant::now()) {
        sleep(Duration::from_secs(2).min(remaining)).await;
        let response = http
            .post(status.clone())
            .json(&body)
            .timeout(
                Duration::from_secs(15).min(deadline.saturating_duration_since(Instant::now())),
            )
            .send()
            .await;
        let Ok(response) = response else {
            continue;
        };
        let Ok(answer) = response.json::<Value>().await else {
            continue;
        };
        match answer["status"].as_str() {
            Some("complete") => {
                let key = answer["apiKey"]
                    .as_str()
                    .filter(|key| !key.trim().is_empty())
                    .context("Authorization completed without an API key.")?;
                Config::edit(|stored| {
                    stored.api_key = Some(key.trim().to_owned());
                    stored.base_url = Some(origin);
                    stored.frontend_url = Some(frontend);
                    stored.pending_signups.clear();
                })?;
                return Ok(());
            }
            Some("denied") => {
                bail!("Authorization denied. Run `stophy login --browser` to try again.")
            }
            Some("expired") => break,
            _ => {}
        }
    }
    bail!("Browser login timed out or expired. Run `stophy login --browser` again.")
}

async fn signup() -> Result<()> {
    let config = Config::load()?;
    let client = config.client("login")?;
    let mut pending = config.pending_signups;
    if collect(&client, &mut pending).await? {
        return Ok(());
    }
    if env::var_os("CI").is_some() {
        bail!("Set STOPHY_API_KEY or run `stophy login --browser` to sign in.");
    }
    if pending.is_empty() {
        let entry = client.sign_up(&RequestOptions::default()).await?.body.data;
        let signup = Pending {
            claim_url: entry.claim_url,
            code: entry.code,
            expires_at: entry.expires_at,
        };
        Config::edit(|stored| stored.pending_signups.push(signup.clone()))?;
        pending.push(signup);
    }
    let last = pending
        .last()
        .context("No signup is waiting for approval.")?;
    bail!(
        "Open {} by {} to approve the signup. Then run `stophy login` again.",
        last.claim_url,
        last.expires_at
    );
}

async fn collect(client: &stophy::Client, pending: &mut Vec<Pending>) -> Result<bool> {
    let mut expired = Vec::new();
    for signup in pending.iter() {
        let body = json!({"code": signup.code});
        match client
            .call(
                Method::POST,
                "/v1/signup/poll",
                &[],
                Some(&body),
                &[],
                &RequestOptions::default(),
            )
            .await
        {
            Ok(answer) => {
                if let Some(key) = answer.body["data"]["apiKey"].as_str() {
                    Config::save_key(key.to_owned())?;
                    return Ok(true);
                }
            }
            Err(stophy::Error::Api(error)) if error.status == 404 => {
                if Config::load()?.key().is_some() {
                    return Ok(true);
                }
                expired.push(signup.code.clone());
            }
            Err(stophy::Error::Api(error)) if error.retryable => {}
            Err(error) => return Err(error.into()),
        }
    }
    if !expired.is_empty() {
        pending.retain(|entry| !expired.contains(&entry.code));
        Config::edit(|stored| {
            stored
                .pending_signups
                .retain(|entry| !expired.contains(&entry.code))
        })?;
    }
    Ok(false)
}
