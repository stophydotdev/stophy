# Stophy CLI

Search, read, and act on the web. This is the `stophy` command for your terminal, your scripts and your coding agent.

## Install

```bash
curl -fsSL https://stophy.dev/install | bash
```

The installer puts the binary in `~/.local/bin`. On Windows, run `irm https://stophy.dev/install.ps1 | iex` in PowerShell. With Node.js 20 or later, `npm install -g @stophy/cli` works too.

## Example

You don't need a key for this. It searches the web and prints the results as rows, or as JSON with `--json`.

```bash
stophy search "bun runtime" --limit 5
```

## Get data

`search`, `scrape`, `map`, `crawl`, `extract` and `batch scrape` are the main commands. Pick `scrape` to read a page you have a URL for, `map` to list the pages on a site, and `search` when you don't have a URL yet. `stophy <command> --help` lists every option, and `stophy describe <id>` shows one command's options, price and an example.

`crawl`, `batch scrape` and `extract` start a background job and answer with an id. Read the result with `status <id>`, such as `stophy crawl status <id>`, and stop a running `crawl` or `batch scrape` job with `cancel <id>`. `extract` has no `cancel`. When a status answer has a `next` link, run it again with `--cursor` and the cursor from that link.

Some rules hold for every command:

- Give a list as `--urls a,b` or `--urls a --urls b`.
- Turn a yes-or-no option on with `--flag` and off with `--no-flag`.
- Give options that take JSON, like `--formats '["markdown","links"]'`, as one quoted argument.
- A value the command doesn't take stops the CLI before it calls Stophy, and it prints the values that work.

`--json` prints the data as JSON, then the cost and `request id: <id>` to stderr. `--raw` prints the full response with its `requestId`. `-o <path>` writes the output to a file. A failed call prints its message and `Request id: <id>` to stderr in every mode, and an agent also gets the error as JSON on stdout. Support will ask for the request id.

## Read a site with a parser

A parser returns a site's own data as JSON: posts, videos, places, products, jobs, listings and more. `stophy parsers [word]` lists them with the kind of page each one takes, such as `stophy parsers reddit`. Pass one to `scrape` with `--parser`, for example `stophy scrape "https://www.reddit.com/r/rust/" --parser reddit-subreddit` or `stophy scrape https://youtu.be/M4TufsFlv_o --parser youtube-transcript`. If the output ends with a `cursor`, get the next page with `--parserOptions '{"cursor":"<cursor>"}'`.

## Set up your agent

`stophy init --all` logs you in with your browser, installs the Stophy skills with `npx -y skills add stophydotdev/stophy`, and adds the MCP server. With Claude Code on your PATH it runs `claude mcp add`. For any other agent it prints the command or snippet to use, and leaves your config files alone.

Use `--agent <name>`, such as `claude-code` or `codex`, to set up one agent. `--skip-auth`, `--skip-skills` and `--skip-mcp` leave out a step. Without `--all`, `init` asks before each step.

## Log in

Without a login you can run the commands `stophy endpoints` marks `free`, within a small free allowance. For the rest, run `stophy login --browser`. The CLI prints a code and opens stophy.dev. Check that the page shows the same code, then click **Approve**. On a server with no browser, open the printed link on any other device.

To use an API key from the [dashboard](https://stophy.dev/dashboard) instead, run `stophy login --api-key` and paste the key when it asks, so it stays out of your shell history. In CI, set `STOPHY_API_KEY` from your secret store, and the CLI reads it. Each computer gets its own key, and logging in again replaces it. `stophy logout` logs out and revokes the key.

## Commands

| Command                   | What it does                             |
| ------------------------- | ---------------------------------------- |
| `stophy init`             | Set up Stophy in your coding agents      |
| `stophy login`            | Log in with your browser or an API key   |
| `stophy logout`           | Log out and revoke this computer's key   |
| `stophy <command>`        | Get data, for example `stophy search`    |
| `stophy parsers [word]`   | List the parsers `scrape --parser` takes |
| `stophy endpoints [word]` | List every command and its price         |
| `stophy status`           | Show your login, balance and CLI version |
| `stophy usage`            | Show your balance and all-time usage     |
| `stophy logs --days 7`    | Show your recent requests                |
| `stophy doctor`           | Check your install, login and connection |
| `stophy version`          | Show the CLI version                     |

The CLI tells you when a newer version is out. Set `STOPHY_NO_UPDATE_CHECK=1` to turn that off.

## Docs

- [Install the CLI](https://docs.stophy.dev/install-cli) covers every install path and each command.
- [Quickstart](https://docs.stophy.dev/quickstart) makes a first request and reads the result.
- [Pricing](https://docs.stophy.dev/account/pricing) lists what each call costs.

## License

MIT
