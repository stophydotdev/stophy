# Stophy public packages

The SDKs, CLI, MCP server, docs and agent skills for the Stophy API.

- `sdk`: TypeScript (`sdk/packages/typescript`) and Python (`sdk/packages/python`) clients, generated from the live API.
- `crates/stophy`: the Rust SDK.
- `crates/stophy-cli`: the `stophy` binary. It reads the live endpoint catalog.
- `crates/stophy-mcp`: the library behind `stophy mcp`.
- `docs`: the Mintlify site. Read `docs/AGENTS.md` before editing it.
- `skills`: agent skills in `skills/<name>/SKILL.md`. The plugin manifests sit at the repo root.

## Commands

- `bun install` at the root installs every package.
- `bun run check` runs oxlint and the oxfmt check on every package. `bun run fix` fixes what it can.
- SDK: `cd sdk && bun run sync && bun run generate` refreshes the clients from the live API. `bun run test`, `bun run type-check` and `bun run check:py` run its checks.
- Rust: `cargo fmt --all --check`, `cargo clippy --locked --workspace --all-targets -- -D warnings` and `cargo test --locked --workspace`. Regenerate the SDK with `python3 crates/stophy/generate.py`.

## Rules

- Never hand-edit `crates/stophy/src/generated.rs` or other generated files: `sdk/packages/typescript/src/generated`, `sdk/packages/python/src/stophy/generated`, and the generated docs pages listed in `docs/AGENTS.md`.
- Every fact must match the live API at `https://api.stophy.dev/v1/endpoints`.
- No comments in code. Names and small functions say what the code does.
- A change to a package that users install gets a changeset: `bun run changeset`.
