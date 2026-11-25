# @stophy/cli

## 2.2.0

### Minor Changes

- 9c64b05: `stophy browser run` works a real cloud browser in one command. `--url` alone opens the page and prints its text. Add `--code` for Playwright code, or `--prompt` for plain words. The browser always closes, and the cost is printed on stderr.

### Patch Changes

- 0aa83c1: Keep API requests on the configured origin and accept only API route paths in the endpoint catalog.
- cc69ee7: `stophy browser run --url <url> --code <code>` opens the page and runs the code in one call to the browser instead of two, about 1.6 s faster per run.
- cb61ae1: `stophy browser task` now waits for the answer and prints it in one command, with the final page's text left out of the agent line and the terminal view (`--raw` shows it), and `--no-wait` prints the task id at once as before.
- 66a308a: The CLI starts faster: `stophy -V` reads no endpoint catalog, the config file is read directly, parsed JSON is not checked twice, and the spinner, prompts, browser opener and update check load only when a person needs them.
- dceefbc: Hitting the free daily limit without a key no longer starts a signup. The CLI shows the limit and how long to wait, and says to run `stophy login` for a key. In CI the wait time is no longer replaced by "No API key". A call that needs a key still starts a signup.
- 9c64b05: `stophy --help` says what `browser` and `webhook` do, instead of repeating their names.
- cc69ee7: `stophy --help` says how `browser run --code` works and how long a run may take, so an agent can run it without reading `stophy browser run --help` first.
- a35f990: A `STOPHY_API_KEY` or saved key that an HTTP header cannot carry, such as one with a line break, is refused with a fixed message instead of printing the key. `stophy status` treats a bare HTTP 401 as a rejected key, and a person at a terminal sees the rejection on stderr. A minimum-version header that is not a version no longer triggers an upgrade warning.
- cf1abba: A keyless call the API refuses, such as a page that needs a key to read, now says why, in CI and out of it. The no-key message no longer tells people on their own machine to use CI secrets.
- cf1abba: A command from an older skill, such as `stophy web search "<query>" --limit 5`, now names the command to run, `stophy search '<query>' --limit 5`, and how to update the skills, instead of failing on `--limit` and printing the whole help.
- ccee7ea: A key the API rejects is no longer called authenticated. `stophy status` reports `authenticated: false` with the reason and the next step, exits 1, and prints the error on stderr as well as in its JSON. Any call that the API answers with "not valid or has expired" now ends with the fix: `Run stophy logout, then stophy login.` for a stored key, or a note to replace `STOPHY_API_KEY`. `stophy version` prints `credentials: stored | env | session | none` and says nothing about whether the key works; its JSON keeps `authenticated` and `source` for scripts, and `authenticated` only means a key is present.
- 517817d: A successful call keeps its request ID: `--raw` and the one-line agent output carry `requestId`, and `--json` prints `request id: <id>` after the cost on stderr. A failed call now always explains itself on stderr, with its request ID, even when an agent also gets the error as JSON on stdout. The cost line prints only after the output was written, and a file that cannot be written fails with its path.
- a7b4c0c: Ctrl-C during `stophy browser run` now closes the browser it opened, a busy Stophy is tried again after the wait it names, and browser tasks, error output and the saved config no longer lose an id, a message or the key's privacy along the way.
- cc69ee7: Help examples quote values with single quotes, so code such as `page.$$eval(...)` copied from them reaches the browser as written instead of having `$$` replaced by the shell.
- e3b98c3: When the CLI cannot read a reply, it now says it may be out of date and gives the upgrade command: `npm install -g @stophy/cli@latest`, or run the installer again. If the API sends `X-Stophy-Min-Cli-Version` and this CLI is older, every failing call says so, and a working call warns on stderr. A signup status the CLI does not know counts as still waiting instead of failing.
- a569deb: Offer signup when a browser run or task needs a key. Omit request IDs that contain the active credential.

## 2.1.2

### Patch Changes

- b701aa5: Use `stophy agent list`, `stophy agent status <id>`, and `stophy agent cancel <id>` to manage Agent runs. To use a command name as a prompt, pass it explicitly, for example `stophy agent --prompt list`.
- 85d8504: The CLI shows the request ID and retry delay from the API error body when the response headers disagree. When only a `Retry-After` date is available, the CLI prints it without a seconds suffix.
- 355e937: Keep the SDK recovery key and unknown outcome when a lost write is followed by a rejection or an unreadable success response. Publish the Windows CLI executable alongside its ZIP so the PowerShell installer can download and verify it.

## 2.1.1

### Patch Changes

- 8af3fe2: The README and description use the new Stophy line and a shorter guide.

## 2.1.0

### Major Changes

- The CLI shows dollars, never credits. This breaks scripts that read the old names:
  - `stophy usage --json` returns `balanceUsd` and `costUsd` where it returned `balanceCredits` and `creditsUsed`.
  - `stophy logs` has a `costUsd` column where it had `credits`.
  - A `--json` call prints `cost: $0.001` on stderr where it printed `credits used: 1`.
  - `--json`, and the one-line output you get when stdout is not a terminal (agents, pipes, scripts), no longer carry `creditsUsed`. `--raw` prints the response exactly as the API sent it. A response without a `data` wrapper, such as `map`, `crawl` and `batch scrape` start and cancel, `extract` start and `search developer`, keeps `costUsd`.
  - `stophy usage`, `stophy status`, `stophy doctor`, `stophy endpoints` and `--help` show prices and balances like `$1.9876`.
  - `stophy doctor --json` names the check `Balance` where it named it `Credits`, and its message reads like `$1.9876 left`.
- Errors keep the API's own `code`: a script that matched `requestFailed` now sees the API code, such as `invalidUrl`, and a `requestId`.

### Patch Changes

- Errors also keep `retryable` and the API's extra fields. A permanent `sourceChanged` is tried once, `profileBusy` is retried, and the CLI signs up after `freeLimit` and `apiKeyRequired`.

Most versions from 2.0.0 to 2.0.9 were already used on npm, so this release is 2.1.0.

## 1.4.0

### Minor Changes

- 5db46c1: When an AI agent runs the CLI, or its output is piped, each endpoint call prints the full response as one line of JSON, with `success`, `data`, `creditsUsed` and `requestId` (with `--json` it prints only the data), and a failed call prints `{"success":false,"error":{...},"requestId"}` with every field the server sent, such as `signupUrl`, and the same exit code as before. With no key, the CLI starts a signup and asks a person to approve it. At a terminal it prints the link and waits for the approval. With no terminal it prints the link as a `claimRequired` error, keeps the pending signup in its config, and collects the key on the next run. In CI it asks for `STOPHY_API_KEY` instead of signing up. A keyless call that the server refuses for want of a key does the same. `stophy status` and `stophy login` print one line of JSON and never wait for a prompt. Every request sends `stophy-cli/<version>` and the agent and command names.

### Patch Changes

- 8bf2d85: `stophy endpoints` shows the real price for crawl, batch scrape and browser task, such as "1 credit a page", instead of "per page".

## 1.3.0

### Minor Changes

- 454204d: The CLI works with Stophy API v1. Every command reads the v1 responses again, `stophy scrape <url> --parser <name>` reads a site with one of its parsers, `stophy parsers` lists them, and `stophy crawl status <id>`, `crawl cancel`, `batch scrape status`, `batch scrape cancel` and `extract status` follow a job after it starts.

### Patch Changes

- 1f0ed52: Prices and balances show credits, not dollars: `stophy endpoints` and `--help` show what a call costs in credits, and `stophy usage`, `status` and `doctor` show the balance as `balanceCredits`. An old site command such as `stophy google search` says what to run instead.

## 1.2.2

### Patch Changes

- 1bcbef6: Help shows prices in dollars, like `Price: $0.0015 per call.`, and the command descriptions say what each one does in plain words.

## 1.2.1

### Patch Changes

- 642e494: The package links point to github.com/stophydotdev/stophy, where the source now lives. `stophy init` installs the agent skills from there.

## 1.2.0

### Patch Changes

- `stophy web scrape --urls` prints each page's text, or its error, under its link. Before, it printed only the links.

## 2.0.9

### Patch Changes

- 3677d6f: The help and login screens say "The web scraping API for AI agents, from your terminal".

## 2.0.8

### Patch Changes

- e9a9f2a: `stophy init` adds the Stophy MCP server at `https://mcp.stophy.dev/mcp`, the same sign-in address the docs use.
- e9a9f2a: The README and the package description open with the product's line, "Web scraping API for AI agents".

## 2.0.7

### Patch Changes

- f02fdbb: Follow the new API. To point at one thing, give its link or its id as the argument, such as `stophy youtube video M4TufsFlv_o`, or use the matching option like `--videoUrl` or `--videoId`. Send one, not both. Transcripts are now `stophy youtube transcript`, `stophy instagram transcript` and `stophy tiktok transcript`, and search, news, maps, Play, flights and trends live under `stophy google`. Amazon commands are new. Page-numbered commands no longer show `hasMore`: run the next page until a page has no results.
- 1d72b3a: The README and the package description open with the product's line, "The web data API for AI agents". The README no longer lists which commands work without a login, since that list grows: `stophy endpoints` marks them `free`. Two new examples, `stophy careers jobs` and `stophy trustpilot company`.

## 2.0.6

### Patch Changes

- d3d7d91: `--limit` is gone. Each command returns one page from the site: use `--page` where a command takes a page number, or `--cursor` with the cursor from the last result. New commands such as `google` and `ai` now show up right away, and an endpoint list the CLI cannot fully read no longer stops every command.

## 2.0.5

### Patch Changes

- 8d96f89: `stophy google search` replaces `stophy web search` as the command that works without logging in. New commands: `google news`, `google images`, `google shopping`, `google aiMode`, `ai answer`, `linkedin people search` and `linkedin companies search`.

## 2.0.4

### Patch Changes

- c3f071a: Add commands for App Store, Google Play, Indeed, Tripadvisor and Walmart. `stophy describe transcript` and `stophy endpoints` now show that a transcript costs 2 credits when the video has captions, and otherwise 2 plus 1 per 10 seconds of audio, up to 30 minutes.

## 2.0.3

### Patch Changes

- af4fa9d: Follow the API we ship. Help examples and the README no longer use removed commands, and only `stophy web search` is listed as working without a login. `tiktok profile` and `instagram profile` print their list as results and page with `--limit` and `--cursor`. `--cursor` takes the cursor exactly as the API returned it, so paging with a small `--limit` works.

## 2.0.2

### Patch Changes

- 04ee635: The CLI follows the new flat Stophy API. Lists print one row per result with its title and link, other results print as `name: value` lines, and `--json` prints the raw data. Single-word commands such as `stophy transcript <link>` and `stophy suggest`, and choices such as `--network`, `--source` and `--by`, work from the catalog. Markdown output and the removed options are gone.

## 2.0.1

### Patch Changes

- 1f7a9bd: `stophy init` now sets up everything in one command: it logs you in, installs the Stophy skills, and adds the MCP server. Errors now end with the request id, and every command's `--help` lists `--raw`. The package description and keywords are updated.

## 2.0.0

### Major Changes

- 6639262: The CLI now covers every Stophy source.

  - Every Stophy source is now in the CLI, for example `stophy reddit search`, `stophy maps search` and `stophy amazon product`. Run `stophy --help` to see them all.
  - Results print as markdown. Add `--json` for JSON.
  - The main input needs no flag: `stophy youtube search "bun runtime"`.
  - `stophy login --browser` shows a code to match on stophy.dev. Each computer gets one key, and `stophy logout` revokes it.
  - The `credits` command is gone. Your balance is in `stophy status` and `stophy usage`.
  - Without a key and without a terminal, the CLI exits with an error instead of waiting for input.

## 1.1.0

### Minor Changes

- a0011a9: Add `stophy init --all --browser` for one-command CLI installation, global agent skill setup, and browser authentication.

### Patch Changes

- 35b9339: Ensure the curl installer updates the currently resolved Stophy executable when possible, with a PATH-safe fallback for installations that are not writable.

## 1.0.9

### Patch Changes

- 7daf26b: Publish the CLI through the new Changesets and trusted publishing workflow, keeping the documented installer routes aligned with the hosted `stophy.dev` install commands.
