# Stophy Rust SDK

`stophy::Client` calls every operation in [the v1 OpenAPI document](../../sdk/openapi.json). Its async methods accept typed request models and return typed responses with the HTTP headers.

```rust
let client = stophy::Client::new(&std::env::var("STOPHY_API_KEY")?)?;
let request = stophy::SearchRequest::new("rust reqwest".to_owned());
let response = client.search(&request, &stophy::RequestOptions::default()).await?;
```

Keep a client for reuse across calls. Set a deadline, idempotency key, or maximum text length in `RequestOptions` where supported.
