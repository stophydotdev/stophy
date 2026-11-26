use std::{env, fs, process::Command, process::Stdio, time::Duration};

use anyhow::Result;
use jiff::Timestamp;
use semver::Version;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{VERSION, config};

pub const COMMAND: &str = "__stophy-update-check";

#[derive(Deserialize, Serialize)]
struct Checked {
    at: Timestamp,
    version: Option<String>,
}

fn read() -> Option<Checked> {
    serde_json::from_slice(&fs::read(config::directory().join("update.json")).ok()?).ok()
}

fn fresh(check: &Checked) -> bool {
    Timestamp::now().as_second() - check.at.as_second() < 20 * 3600
}

async fn latest() -> Result<Option<String>> {
    let client = stophy::http_client(concat!("stophy-cli/", env!("CARGO_PKG_VERSION")))?;
    let answer = client
        .get("https://registry.npmjs.org/@stophy%2fcli/latest")
        .timeout(Duration::from_secs(3))
        .send()
        .await?
        .error_for_status()?
        .json::<Value>()
        .await?;
    Ok(answer["version"].as_str().map(str::to_owned))
}

fn newer(version: &str) -> bool {
    Version::parse(version)
        .ok()
        .zip(Version::parse(VERSION).ok())
        .is_some_and(|(latest, installed)| latest > installed)
}

pub fn notice() {
    if crate::output::machine()
        || matches!(
            env::var("STOPHY_NO_UPDATE_CHECK").as_deref(),
            Ok("1" | "true")
        )
    {
        return;
    }
    let cached = read();
    if let Some(version) = cached
        .as_ref()
        .and_then(|value| value.version.as_deref())
        .filter(|version| newer(version))
    {
        eprintln!("Stophy {version} is available. Upgrade with your package manager.");
    }
    if !cached.as_ref().is_some_and(fresh)
        && let Ok(exe) = env::current_exe()
    {
        let _ = Command::new(exe)
            .arg(COMMAND)
            .env_remove("STOPHY_API_KEY")
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn();
    }
}

pub async fn refresh() -> Result<()> {
    let dir = config::directory();
    fs::create_dir_all(&dir)?;
    let lock = fs::OpenOptions::new()
        .create(true)
        .truncate(false)
        .read(true)
        .write(true)
        .open(dir.join("update.lock"))?;
    if lock.try_lock().is_err() || read().as_ref().is_some_and(fresh) {
        return Ok(());
    }
    let checked = Checked {
        at: Timestamp::now(),
        version: latest().await.unwrap_or_default(),
    };
    config::write_json(&dir.join("update.json"), &checked)
}
