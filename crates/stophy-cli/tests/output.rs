use std::{
    io::{BufRead, BufReader, Read, Write},
    net::{TcpListener, TcpStream},
    path::Path,
    process::{Command, Output},
    thread,
    time::Duration,
};

use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};

type TestResult<T = ()> = Result<T, Box<dyn std::error::Error + Send + Sync>>;

fn request(stream: &mut TcpStream) -> TestResult<(String, String, Value)> {
    stream.set_read_timeout(Some(Duration::from_secs(5)))?;
    let mut reader = BufReader::new(stream);
    let mut line = String::new();
    reader.read_line(&mut line)?;
    let mut parts = line.split_whitespace();
    let method = parts.next().ok_or("missing HTTP method")?.to_owned();
    let path = parts.next().ok_or("missing HTTP path")?.to_owned();
    let mut length = 0;
    loop {
        let mut header = String::new();
        if reader.read_line(&mut header)? == 0 || header == "\r\n" {
            break;
        }
        let header = header.to_ascii_lowercase();
        if let Some(value) = header.strip_prefix("content-length:") {
            length = value.trim().parse()?;
        }
    }
    let mut body = vec![0; length];
    reader.read_exact(&mut body)?;
    let body = if length == 0 {
        Value::Null
    } else {
        serde_json::from_slice(&body)?
    };
    Ok((method, path, body))
}

fn respond(mut stream: TcpStream, status: &str, answer: Value) -> TestResult {
    let data = serde_json::to_vec(&answer)?;
    write!(
        stream,
        "HTTP/1.1 {status}\r\nConnection: close\r\nContent-Type: application/json\r\nContent-Length: {}\r\nX-Request-ID: recorded-request\r\n\r\n",
        data.len()
    )?;
    stream.write_all(&data)?;
    Ok(())
}

fn cli(directory: &Path, origin: &str, args: &[&str]) -> TestResult<Output> {
    Ok(Command::new(env!("CARGO_BIN_EXE_stophy"))
        .args(args)
        .env_remove("STOPHY_API_KEY")
        .env("STOPHY_BASE_URL", origin)
        .env("STOPHY_FRONTEND_URL", origin)
        .env("XDG_CONFIG_HOME", directory)
        .env("HOME", directory)
        .env("APPDATA", directory)
        .env("NO_OPEN_BROWSER", "1")
        .env("STOPHY_NO_UPDATE_CHECK", "1")
        .output()?)
}

#[test]
fn api_answers_and_parser_discovery() -> TestResult {
    let config = tempfile::tempdir()?;
    let listener = TcpListener::bind("127.0.0.1:0")?;
    let origin = format!("http://{}", listener.local_addr()?);
    let server = thread::spawn(move || -> TestResult {
        for _ in 0..6 {
            let (mut stream, _) = listener.accept()?;
            let (method, path, body) = request(&mut stream)?;
            let (status, answer) = match path.as_str() {
                "/v1/endpoints" => (
                    "200 OK",
                    json!({"endpoints":[
                        {"id":"search","method":"POST","path":"/v1/search","input":{"type":"object","properties":{"query":{"type":"string"}},"required":["query"]}},
                        {"id":"scrape","method":"POST","path":"/v1/scrape","input":{"type":"object","properties":{
                            "url":{"type":"string"},"formats":{"type":"array","items":{"type":"object"}}
                        },"required":["url"]}}
                    ]}),
                ),
                "/v1/parsers" => (
                    "200 OK",
                    json!({"success":true,"data":{"parsers":[
                        {"name":"youtube-video","takes":"A YouTube video link","example":"https://youtu.be/video"},
                        {"name":"youtube-comments","takes":"A YouTube video link","example":"https://youtu.be/video"},
                        {"name":"youtube-transcript","takes":"A YouTube video link","example":"https://youtu.be/video"}
                    ]}}),
                ),
                "/v1/search" => {
                    assert_eq!(method, "POST");
                    assert_eq!(body, json!({"query":"stophy"}));
                    (
                        "200 OK",
                        json!({"success":true,"data":{"web":[{"url":"https://stophy.dev","title":"Stophy"}]},"requestId":"recorded-request","costUsd":0.01}),
                    )
                }
                "/v1/scrape" if body.get("formats").is_none() => (
                    "200 OK",
                    json!({
                        "success":true,"data":{"markdown":"# Example Domain","isTruncated":false,"metadata":{"sourceURL":"https://example.com","title":"Example Domain","ogDescription":"Unneeded"}}
                    }),
                ),
                "/v1/scrape" => {
                    assert_eq!(
                        body["formats"],
                        json!([{"type":"json","parser":"bad-name"}])
                    );
                    (
                        "400 Bad Request",
                        json!({"success":false,"error":"Unknown parser bad-name.","code":"invalidArgument","retryable":false}),
                    )
                }
                _ => return Err(format!("Unexpected HTTP path: {path}").into()),
            };
            respond(stream, status, answer)?;
        }
        Ok(())
    });

    let search = cli(config.path(), &origin, &["search", "stophy"])?;
    assert!(search.status.success());
    assert!(search.stderr.is_empty());
    assert_eq!(
        search.stdout,
        b"{\"web\":[{\"url\":\"https://stophy.dev\",\"title\":\"Stophy\"}]}\n"
    );
    let page = cli(config.path(), &origin, &["scrape", "https://example.com"])?;
    assert!(page.status.success());
    assert!(page.stderr.is_empty());
    assert_eq!(
        serde_json::from_slice::<Value>(&page.stdout)?,
        json!({"markdown":"# Example Domain","metadata":{"sourceURL":"https://example.com","title":"Example Domain"}})
    );
    let failed = cli(
        config.path(),
        &origin,
        &["scrape", "https://example.com", "--parser", "bad-name"],
    )?;
    assert!(!failed.status.success());
    assert!(failed.stdout.is_empty());
    let error = String::from_utf8(failed.stderr)?;
    assert!(error.contains("Unknown parser bad-name."));
    assert!(error.contains("formats[].parser"));
    assert!(error.contains("recorded-request"));
    let index = cli(config.path(), &origin, &["endpoints", "transcript"])?;
    assert!(index.status.success());
    assert_eq!(String::from_utf8(index.stdout)?.lines().count(), 3);
    let describe = cli(config.path(), &origin, &["describe", "youtube-transcript"])?;
    assert!(describe.status.success());
    assert!(
        String::from_utf8(describe.stdout)?
            .contains("stophy scrape https://youtu.be/video --parser youtube-transcript")
    );
    server.join().map_err(|_| "HTTP fixture failed")??;
    Ok(())
}

#[test]
fn browser_login_saves_key_without_opening_a_browser() -> TestResult {
    let config = tempfile::tempdir()?;
    let listener = TcpListener::bind("127.0.0.1:0")?;
    let origin = format!("http://{}", listener.local_addr()?);
    let server = thread::spawn(move || -> TestResult {
        let (mut stream, _) = listener.accept()?;
        let (method, path, start) = request(&mut stream)?;
        assert_eq!((method.as_str(), path.as_str()), ("POST", "/api/cli/init"));
        respond(stream, "200 OK", json!({}))?;
        let (mut stream, _) = listener.accept()?;
        let (_, path, poll) = request(&mut stream)?;
        assert_eq!(path, "/api/cli/status");
        assert_eq!(start["session_id"], poll["session_id"]);
        let verifier = poll["code_verifier"].as_str().ok_or("missing verifier")?;
        assert_eq!(
            start["code_challenge"],
            URL_SAFE_NO_PAD.encode(Sha256::digest(verifier))
        );
        respond(
            stream,
            "200 OK",
            json!({"status":"complete","apiKey":"st_fixture_key_for_login"}),
        )?;
        Ok(())
    });
    let result = cli(config.path(), &origin, &["login", "--browser"])?;
    assert!(result.status.success());
    assert_eq!(result.stdout, b"{\"authenticated\":true}\n");
    let stderr = String::from_utf8(result.stderr)?;
    assert!(stderr.contains(&format!("{origin}/cli-auth?session_id=")));
    assert!(stderr.contains("Your code: "));
    assert!(!stderr.contains("st_fixture_key_for_login"));
    let file = if cfg!(target_os = "macos") {
        config.path().join("Library/Preferences/stophy/config.json")
    } else if cfg!(windows) {
        config.path().join("stophy/Config/config.json")
    } else {
        config.path().join("stophy/config.json")
    };
    let saved: Value = serde_json::from_slice(&std::fs::read(&file)?)?;
    assert_eq!(saved["apiKey"], "st_fixture_key_for_login");
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        assert_eq!(file.metadata()?.permissions().mode() & 0o777, 0o600);
    }
    server.join().map_err(|_| "HTTP fixture failed")??;
    Ok(())
}
