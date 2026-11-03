# Stophy CLI

Give your agents the live web from your terminal. Try it with no key:

```bash
curl -fsSL https://stophy.dev/install | bash
stophy google search "bun runtime"
```

Results print as rows, or as JSON with `--json`.

## Install

The installer puts the binary in `~/.local/bin`. On Windows, use PowerShell:

```powershell
irm https://stophy.dev/install.ps1 | iex
```

With Node.js 20 or later, `npm install -g @stophy/cli` works too.

## Set up your agent

```bash
stophy init --all
```

`init` logs you in with your browser, installs the Stophy skills with `npx -y skills add stophydotdev/stophy`, and adds the MCP server. With Claude Code on your PATH it runs `claude mcp add`. For any other agent it prints the command or snippet to use, and leaves your config files alone.

| Option           | What it does                                       |
| ---------------- | -------------------------------------------------- |
| `--all`          | Run every step without asking                      |
| `--agent <name>` | Set up one agent, such as `claude-code` or `codex` |
| `--skip-auth`    | Do not log in                                      |
| `--skip-skills`  | Do not install the skills                          |
| `--skip-mcp`     | Do not add the MCP server                          |

## Log in

```bash
stophy login --browser
```

The CLI prints a code and opens stophy.dev. Check that the page shows the same code, then click **Approve**. On a server with no browser, open the printed link on any other device.

To use an API key from the [dashboard](https://stophy.dev/dashboard) instead, run this and paste the key when it asks, so it stays out of your shell history. In CI, set `STOPHY_API_KEY` from your secret store.

```bash
stophy login --api-key
```

Each computer gets its own key, and logging in again replaces it. `stophy logout` logs out and revokes the key.

Without a login you can run the commands `stophy endpoints` marks `free`, within a small free allowance.

## Get data

Name the source, then the command:

```bash
stophy google search "bun runtime" --page 2
stophy linkedin profile satyanadella
stophy google maps search --query dentist --location Berlin
stophy reddit subreddit rust
stophy youtube transcript https://youtu.be/M4TufsFlv_o
stophy meta ads search nike
stophy careers jobs https://boards.greenhouse.io/figma
stophy trustpilot company --companyDomain stripe.com
```

`stophy <source> --help` lists what a source can do, and `stophy <source> <command> --help` lists every option.

- Give a list as `--features live,hd` or `--features live --features hd`.
- Turn a yes-or-no option on with `--flag` and off with `--no-flag`.
- Point at one thing with its link or its id, like `stophy youtube video https://youtu.be/M4TufsFlv_o` or `stophy youtube video M4TufsFlv_o`. Send one, not both.
- A value the command doesn't take stops the CLI before it calls Stophy, and it prints the values that work.

Each command returns one page. If the output shows `page`, run the same command with `--page 2`, and stop when a page is empty. If it ends with a `cursor`, run it again with `--cursor <cursor>`.

`--json` prints the data as JSON and the cost to stderr. `--raw` prints the full response. `-o <path>` writes the output to a file. A failed call ends with `Request id: <id>`, which support will ask for.

## Commands

| Command                     | What it does                                  |
| --------------------------- | --------------------------------------------- |
| `stophy init`               | Set up Stophy in your coding agents           |
| `stophy login`              | Log in with your browser or an API key        |
| `stophy logout`             | Log out and revoke this computer's key        |
| `stophy <source> <command>` | Get data, for example `stophy youtube search` |
| `stophy endpoints [word]`   | List every command and its price              |
| `stophy status`             | Show your login, balance and CLI version      |
| `stophy usage`              | Show your balance and all-time usage          |
| `stophy logs --days 7`      | Show your recent requests                     |
| `stophy doctor`             | Check your install, login and connection      |
| `stophy version`            | Show the CLI version                          |

The CLI tells you when a newer version is out. Set `STOPHY_NO_UPDATE_CHECK=1` to turn that off.

Full docs: [docs.stophy.dev/sdks/cli](https://docs.stophy.dev/sdks/cli).

## License

MIT
