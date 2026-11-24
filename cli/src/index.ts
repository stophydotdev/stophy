import { Command, Help } from "commander";
import packageJson from "../package.json" with { type: "json" };
import { isAgentMode, setCommand } from "./agent.js";
import { catalogNeeded, catalogOptional, setCurrentArgs, stripGlobalRefresh } from "./argv.js";
import { BROWSER_RUN, BROWSER_RUN_CODE, BROWSER_RUN_URL, withBrowserRun } from "./browser.js";
import {
  type Catalog,
  type CatalogEndpoint,
  catalogFilePath,
  fetchCatalog,
  loadCatalog,
} from "./catalog.js";
import { registerAccountCommands } from "./commands/account.js";
import { registerDescribeCommand } from "./commands/describe.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { commandPath, registerDynamicCommands } from "./commands/dynamic.js";
import { registerEndpointsCommand } from "./commands/endpoints.js";
import { registerInitCommand } from "./commands/init.js";
import { registerLoginCommand } from "./commands/login.js";
import { registerParsersCommand } from "./commands/parsers.js";
import { registerLogsCommand } from "./commands/logs.js";
import { registerStatusCommand } from "./commands/status.js";
import { registerUsageCommand } from "./commands/usage.js";
import { registerVersionCommand } from "./commands/version.js";
import { resolveRuntimeConfig } from "./config.js";
import { CliError, toCliError } from "./errors.js";
import { parseEndpointCall } from "./invoke.js";
import { isAgentCommand, withJobEndpoints } from "./jobs.js";
import { writeFailure, writeFailureMessage } from "./output.js";
import { withParserFlags } from "./parsers.js";
import { ensureKey } from "./signup.js";
import { maybeShowUpdateNotice } from "./update-notice.js";

const NO_AUTH_COMMANDS = new Set([
  "login",
  "init",
  "logout",
  "view-config",
  "version",
  "doctor",
  "status",
  "endpoints",
  "describe",
  "parsers",
  "help",
]);

const ACCOUNT_COMMANDS = [
  "init",
  "login",
  "logout",
  "view-config",
  "status",
  "usage",
  "logs",
  "doctor",
  "version",
  "endpoints",
  "describe",
];

const BROWSER_HINT = [
  "A real browser: stophy browser run --url <url>, with --code for Playwright.",
  "stophy scrape reads a page without a browser.",
].join("\n");

function examplesFor(byId: ReadonlyMap<string, CatalogEndpoint>): string[] {
  return [
    `  $ stophy search "bun runtime" --limit 5`,
    "  $ stophy scrape https://bun.com/docs",
    ...(byId.has(BROWSER_RUN.id)
      ? [
          `  $ stophy browser run --url ${BROWSER_RUN_URL}`,
          `  $ stophy browser run --url ${BROWSER_RUN_URL} --code "${BROWSER_RUN_CODE}"`,
        ]
      : []),
    "  $ stophy map https://bun.com --limit 20",
    "  $ stophy parsers youtube",
    "  $ stophy scrape https://youtu.be/M4TufsFlv_o --parser youtube-transcript",
  ];
}

function buildProgram({ endpoints, sources }: Catalog): Command {
  const program = new Command();
  const byId = new Map(endpoints.map((endpoint) => [endpoint.id, endpoint]));

  program
    .name("stophy")
    .version(packageJson.version)
    .description(
      `Search, read, and act on the web. The Stophy command line.${byId.has(BROWSER_RUN.id) ? `\n${BROWSER_HINT}` : ""}`,
    )
    .showHelpAfterError()
    .addHelpText(
      "after",
      `
Account and setup: ${ACCOUNT_COMMANDS.join(", ")}.
Run stophy <command> --help to see its options.
Some calls need no key. Calls and status print JSON when piped, or with --json.

Examples:
${examplesFor(byId).join("\n")}
`,
    )
    .allowExcessArguments(true)
    .action(() => {
      const [word] = program.args;
      if (word === undefined || word === "help") {
        program.outputHelp();
        return;
      }
      throw new CliError(
        `\`stophy ${word}\` is not a command. Search the web with \`stophy search\`, or read a site with a parser: \`stophy parsers ${word}\` lists them, then run \`stophy scrape <url> --parser <name>\`.`,
      );
    });

  registerInitCommand(program);
  registerLoginCommand(program);
  registerAccountCommands(program);
  registerEndpointsCommand(program, endpoints);
  registerDescribeCommand(program, endpoints);
  registerDynamicCommands(program, endpoints, undefined, sources);
  registerParsersCommand(program);
  registerUsageCommand(program);
  registerLogsCommand(program);
  registerStatusCommand(program);
  registerDoctorCommand(program);
  registerVersionCommand(program);
  program.configureHelp({
    visibleCommands: (command) =>
      new Help().visibleCommands(command).filter((sub) => !ACCOUNT_COMMANDS.includes(sub.name())),
  });

  program.hook("preAction", async (_thisCommand, actionCommand) => {
    const id = commandPath(actionCommand);
    setCommand(id ?? actionCommand.name());
    const endpoint = id === undefined ? undefined : byId.get(id);
    if (endpoint?.keyless) return;
    if (!endpoint && actionCommand.commands.length > 0) return;
    if (!endpoint && NO_AUTH_COMMANDS.has(actionCommand.name())) return;
    const { apiKey, sessionCookie } = await resolveRuntimeConfig();
    if (apiKey || sessionCookie) return;
    if (endpoint && isAgentCommand(endpoint.id)) parseEndpointCall(endpoint);
    await ensureKey();
  });

  program.configureOutput({
    outputError: (text, write) => write(text),
  });

  return program;
}

async function main() {
  const { args, refresh } = stripGlobalRefresh(process.argv.slice(2));
  setCurrentArgs(args);

  let catalog: Catalog = { endpoints: [], sources: [] };
  if (catalogNeeded(args)) {
    try {
      const loaded = await loadCatalog({
        file: catalogFilePath(),
        now: Date.now(),
        force: refresh,
        fetch: fetchCatalog,
        warn: (message) => {
          process.stderr.write(`${message}\n`);
        },
      });
      catalog = {
        ...loaded,
        endpoints: withBrowserRun(withJobEndpoints(withParserFlags(loaded.endpoints))),
      };
    } catch (error) {
      if (!catalogOptional(args)) throw error;
      const message =
        error instanceof Error ? error.message : "Could not load the endpoint catalog.";
      process.stderr.write(`${message}\n`);
    }
  }

  const program = buildProgram(catalog);
  await program.parseAsync(args, { from: "user" });
  await maybeShowUpdateNotice();
}

main().catch((error) => {
  const cliError = toCliError(error);
  writeFailureMessage(cliError);
  if (isAgentMode()) writeFailure(cliError);
  process.exit(cliError.exitCode);
});
