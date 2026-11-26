# Stophy CLI

```sh
stophy search "rust reqwest" --limit 3
stophy scrape https://example.com
```

API commands print compact JSON to stdout. Errors and next steps go to stderr. Pipe output to another command or redirect it to a file.

## Find a command or site parser

```sh
stophy endpoints
stophy endpoints transcript
stophy describe youtube-transcript
stophy scrape 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' --parser youtube-transcript
```

Use `stophy parsers` for the list of parser names and the URLs each parser takes. Use `stophy describe <name>` for an example. In a request body, the parser name goes in `formats[].parser`.

## Sign in

Run `stophy login --browser`. Check the code before approving. Set `NO_OPEN_BROWSER=1` to open the printed URL yourself.

Run `stophy login --api-key` to enter a key in the terminal or read it from stdin. Scripts can use `STOPHY_API_KEY` from a secret store. Use `stophy status` to see the active credentials and balance. Use `stophy logout` to revoke the saved key.

## Build from source

```sh
cargo install --locked --path crates/stophy-cli
```

The binary also runs the [local MCP server](../mcp).
