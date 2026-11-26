use std::time::Duration;

use anyhow::{Context, Result};
use rmcp::{
    ClientHandler, ErrorData, ServerHandler, ServiceExt,
    model::{
        CallToolRequestParams, CallToolResponse, CallToolResult, ClientCapabilities, ClientConfig,
        ContentBlock, Implementation, ListToolsResult, PaginatedRequestParams, ServerCapabilities,
        ServerConfig, ToolListChangedNotification,
    },
    service::{NotificationContext, Peer, RequestContext, RoleClient, RoleServer, ServiceError},
    transport::{
        stdio,
        streamable_http_client::{
            StreamableHttpClientTransport, StreamableHttpClientTransportConfig,
        },
    },
};
use serde_json::Value;
use tokio::{sync::watch, time::timeout};

const VERSION: &str = env!("CARGO_PKG_VERSION");
const CONNECTION_TIMEOUT: Duration = Duration::from_secs(15);

struct Hosted(watch::Sender<()>);

impl ClientHandler for Hosted {
    fn get_info(&self) -> ClientConfig {
        ClientConfig::new(
            ClientCapabilities::default(),
            Implementation::new("stophy-mcp", VERSION),
        )
    }

    async fn on_tool_list_changed(&self, _: NotificationContext<RoleClient>) {
        self.0.send_replace(());
    }
}

struct Bridge {
    upstream: Peer<RoleClient>,
}

impl ServerHandler for Bridge {
    fn get_info(&self) -> ServerConfig {
        let mut config = ServerConfig::new(
            ServerCapabilities::builder()
                .enable_tools()
                .enable_tool_list_changed()
                .build(),
        )
        .with_server_info(Implementation::new("stophy", VERSION));
        config.instructions = self
            .upstream
            .peer_info()
            .and_then(|info| info.instructions.clone());
        config
    }

    async fn list_tools(
        &self,
        params: Option<PaginatedRequestParams>,
        context: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, ErrorData> {
        tokio::select! {
            result = timeout(CONNECTION_TIMEOUT, self.upstream.list_tools(params)) => {
                let mut tools = result.map_err(|_| ErrorData::internal_error("Stophy tool discovery timed out. Try again.", None))?
                    .map_err(protocol_error)?;
                for tool in &mut tools.tools {
                    tool.output_schema = None;
                }
                Ok(tools)
            }
            _ = context.ct.cancelled() => Err(ErrorData::internal_error("Tool discovery was cancelled.", None)),
        }
    }

    async fn call_tool(
        &self,
        params: CallToolRequestParams,
        context: RequestContext<RoleServer>,
    ) -> Result<CallToolResponse, ErrorData> {
        let budget = tool_timeout(&params);
        let name = params.name.clone();
        let result = tokio::select! {
            result = timeout(budget, self.upstream.call_tool_once(params)) => result,
            _ = context.ct.cancelled() => return Err(ErrorData::internal_error("Tool call was cancelled.", None)),
        };
        match result {
            Ok(Ok(CallToolResponse::Complete(mut result))) => {
                let operation = name.strip_prefix("stophy_").unwrap_or(&name);
                let structured = result.structured_content.take();
                if let Some(answer) = structured {
                    result.content.retain(|content| {
                        content
                            .as_text()
                            .and_then(|text| serde_json::from_str::<Value>(&text.text).ok())
                            .as_ref()
                            != Some(&answer)
                    });
                    let lean = stophy::agent_answer(operation, answer);
                    result
                        .content
                        .insert(0, ContentBlock::text(lean.to_string()));
                } else {
                    for content in &mut result.content {
                        if let Some(answer) = content
                            .as_text()
                            .and_then(|text| serde_json::from_str::<Value>(&text.text).ok())
                        {
                            let lean = stophy::agent_answer(operation, answer);
                            *content = ContentBlock::text(lean.to_string());
                        }
                    }
                }
                Ok(CallToolResponse::Complete(result))
            }
            Ok(Ok(response)) => Ok(response),
            Ok(Err(ServiceError::McpError(error))) => Err(error),
            Ok(Err(_)) => Ok(tool_error(
                "Could not reach Stophy. Check the connection and try again.",
            )),
            Err(_) => Ok(tool_error(
                "Stophy timed out. Try again or shorten the request.",
            )),
        }
    }
}

fn protocol_error(error: ServiceError) -> ErrorData {
    match error {
        ServiceError::McpError(error) => error,
        _ => ErrorData::internal_error(
            "Could not list Stophy tools. Check the connection and try again.",
            None,
        ),
    }
}

fn tool_error(message: &str) -> CallToolResponse {
    CallToolResponse::Complete(CallToolResult::error(vec![ContentBlock::text(message)]))
}

fn tool_timeout(params: &CallToolRequestParams) -> Duration {
    let args = params.arguments.as_ref();
    let requested = args
        .and_then(|args| args.get("timeout"))
        .and_then(|value| value.as_u64())
        .filter(|value| *value > 0);
    let budget = match params.name.as_ref() {
        "stophy_scrape" => requested.unwrap_or(60_000).min(300_000),
        "stophy_search" => requested.unwrap_or(60_000).min(120_000),
        "stophy_extract" => requested.unwrap_or(30_000).min(300_000) + 45_000,
        "stophy_map" => requested.unwrap_or(60_000),
        "stophy_browser_run" | "browserRun" | "browserExecute" | "scrapeInteract" => {
            let default = if args.is_some_and(|args| args.contains_key("prompt")) {
                120
            } else {
                30
            };
            requested.unwrap_or(default).min(300) * 1000
        }
        _ => 60_000,
    };
    Duration::from_millis(budget.clamp(60_000, 294_000) + 5_000)
}

pub async fn run(url: &str, key: Option<&str>) -> Result<()> {
    let url = stophy::http_url(url).context("Check STOPHY_MCP_URL.")?;
    let (changes, mut incoming) = watch::channel(());
    let mut config = StreamableHttpClientTransportConfig::with_uri(url.as_str())
        .reinit_on_expired_session(false);
    if let Some(key) = key {
        config = config.auth_header(key);
    }
    let http = stophy::http_client(concat!("stophy-mcp/", env!("CARGO_PKG_VERSION")))?;
    let transport = StreamableHttpClientTransport::with_client(http, config);
    let upstream = timeout(CONNECTION_TIMEOUT, Hosted(changes).serve(transport))
        .await.context("Timed out connecting to Stophy MCP.")?
        .map_err(|error| {
            let message = error.to_string();
            if message.contains("401") || message.to_ascii_lowercase().contains("unauthorized") {
                anyhow::anyhow!("Stophy MCP refused the connection. Check STOPHY_API_KEY or run `stophy login`.")
            } else {
                anyhow::anyhow!("Could not connect to Stophy MCP at {}. Check STOPHY_MCP_URL and the connection.", url.origin().ascii_serialization())
            }
        })?;
    let local = Bridge {
        upstream: upstream.peer().clone(),
    }
    .serve(stdio())
    .await?;
    let client = local.peer().clone();
    tokio::select! {
        result = local.waiting() => { result?; }
        _ = async move {
            while incoming.changed().await.is_ok() {
                if client.send_notification(ToolListChangedNotification::default().into()).await.is_err() {
                    break;
                }
            }
        } => {}
    }
    let _ = timeout(CONNECTION_TIMEOUT, upstream.cancel()).await;
    Ok(())
}
