use std::{
    env, fs,
    io::{ErrorKind, Write},
    path::{Path, PathBuf},
};

use anyhow::{Context, Result};
use reqwest::header::{HeaderName, USER_AGENT};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use tempfile::NamedTempFile;

pub const FRONTEND: &str = "https://stophy.dev";

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Pending {
    pub origin: Option<String>,
    pub claim_url: String,
    pub code: String,
    pub expires_at: String,
}

#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Config {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frontend_url: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub pending_signups: Vec<Pending>,
    #[serde(flatten)]
    extra: Map<String, Value>,
}

pub fn directory() -> PathBuf {
    let home = env::home_dir().unwrap_or_else(|| PathBuf::from("."));
    if cfg!(target_os = "macos") {
        home.join("Library/Preferences/stophy")
    } else if cfg!(windows) {
        env::var_os("APPDATA")
            .filter(|path| !path.is_empty())
            .map(PathBuf::from)
            .unwrap_or_else(|| home.join("AppData/Roaming"))
            .join("stophy/Config")
    } else {
        env::var_os("XDG_CONFIG_HOME")
            .filter(|path| !path.is_empty())
            .map(PathBuf::from)
            .unwrap_or_else(|| home.join(".config"))
            .join("stophy")
    }
}

impl Config {
    pub fn load() -> Result<Self> {
        let path = directory().join("config.json");
        let issue = || format!("Failed to read config at {}.", path.display());
        let bytes = match fs::read(&path) {
            Ok(bytes) => bytes,
            Err(error) if error.kind() == ErrorKind::NotFound => return Ok(Self::default()),
            Err(error) => return Err(error).with_context(issue),
        };
        let mut config: Self =
            serde_json::from_slice(&bytes).map_err(|_| anyhow::anyhow!(issue()))?;
        config.api_key = clean(config.api_key.as_deref());
        config.base_url = clean(config.base_url.as_deref());
        Ok(config)
    }

    pub fn edit(change: impl FnOnce(&mut Self)) -> Result<()> {
        let dir = directory();
        let path = dir.join("config.json");
        let issue = || {
            format!(
                "Can't save to {}. Make the config writable or set STOPHY_API_KEY.",
                path.display()
            )
        };
        fs::create_dir_all(&dir).with_context(issue)?;
        let lock = fs::OpenOptions::new()
            .create(true)
            .truncate(false)
            .read(true)
            .write(true)
            .open(dir.join("config.lock"))
            .with_context(issue)?;
        lock.lock().with_context(issue)?;
        let mut config = Self::load()?;
        change(&mut config);
        write_json(&path, &config).with_context(issue)
    }

    pub fn save_key(key: String, origin: String) -> Result<()> {
        Self::edit(|stored| {
            stored.base_url = Some(origin);
            stored.api_key = Some(key);
            stored.pending_signups.clear();
        })
    }

    pub fn origin(&self) -> String {
        origin(
            "STOPHY_BASE_URL",
            self.base_url.as_deref(),
            stophy::API_ORIGIN,
        )
    }

    pub fn frontend(&self) -> String {
        origin(
            "STOPHY_FRONTEND_URL",
            self.frontend_url.as_deref(),
            FRONTEND,
        )
    }

    pub fn stored_origin(&self) -> &str {
        self.base_url.as_deref().unwrap_or(stophy::API_ORIGIN)
    }

    pub fn source(&self) -> &'static str {
        if env_key().is_some() {
            "env"
        } else if self.stored_key_for(&self.origin()).is_some() {
            "stored"
        } else {
            "none"
        }
    }

    fn stored_key_for(&self, target: &str) -> Option<&str> {
        self.api_key
            .as_deref()
            .filter(|_| same_origin(self.stored_origin(), target))
    }

    pub fn key_for(&self, target: &str) -> Option<String> {
        env_key().or_else(|| self.stored_key_for(target).map(str::to_owned))
    }

    pub fn client(&self, command: &str) -> Result<stophy::Client> {
        let origin = self.origin();
        let mut client = stophy::Client::with_origin(&origin, self.key_for(&origin).as_deref())?;
        client.set_header(
            USER_AGENT,
            concat!("stophy-cli/", env!("CARGO_PKG_VERSION")),
        )?;
        client.set_header(HeaderName::from_static("x-stophy-command"), command)?;
        if let Some(agent) = agent() {
            client.set_header(HeaderName::from_static("x-stophy-agent"), &agent)?;
        }
        Ok(client)
    }
}

pub fn same_origin(left: &str, right: &str) -> bool {
    stophy::http_url(left)
        .ok()
        .zip(stophy::http_url(right).ok())
        .is_some_and(|(left, right)| left.origin() == right.origin())
}

pub fn write_json(path: &Path, value: &impl Serialize) -> Result<()> {
    let dir = path
        .parent()
        .context("The file needs a parent directory.")?;
    fs::create_dir_all(dir)?;
    let mut file = NamedTempFile::new_in(dir)?;
    serde_json::to_writer(file.as_file_mut(), value)?;
    file.as_file_mut().write_all(b"\n")?;
    file.as_file_mut().sync_all()?;
    file.persist(path).map_err(|error| error.error)?;
    Ok(())
}

fn clean(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

pub fn env_key() -> Option<String> {
    clean(env::var("STOPHY_API_KEY").ok().as_deref())
}

fn origin(variable: &str, stored: Option<&str>, default: &str) -> String {
    clean(env::var(variable).ok().as_deref().or(stored))
        .unwrap_or_else(|| default.to_owned())
        .trim_end_matches('/')
        .to_owned()
}

pub fn agent() -> Option<String> {
    fn label(name: &str) -> Option<String> {
        env::var(name).ok().filter(|name| {
            !name.is_empty()
                && name.len() <= 64
                && name
                    .bytes()
                    .all(|byte| byte.is_ascii_alphanumeric() || b"_.-".contains(&byte))
        })
    }
    label("STOPHY_AGENT")
        .or_else(|| {
            [
                ("claude-code", &["CLAUDECODE"][..]),
                ("codex", &["CODEX_SANDBOX", "CODEX_CI", "CODEX_THREAD_ID"]),
                ("cursor", &["CURSOR_AGENT"]),
                ("gemini-cli", &["GEMINI_CLI"]),
                ("opencode", &["OPENCODE_CLIENT", "OPENCODE"]),
            ]
            .into_iter()
            .find(|(_, signals)| {
                signals
                    .iter()
                    .any(|signal| env::var_os(signal).is_some_and(|value| !value.is_empty()))
            })
            .map(|(name, _)| name.to_owned())
        })
        .or_else(|| label("AI_AGENT"))
}
