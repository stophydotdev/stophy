import { z } from "zod";
import { formatUsd } from "./account.js";
import { isAgentMode } from "./agent.js";
import type { CatalogEndpoint } from "./catalog.js";
import { type RequestOptions, RequestError, request, unexpectedResponse } from "./client.js";
import { clock } from "./clock.js";
import { CliError, statusFrom } from "./errors.js";
import type { ParsedCall } from "./flags.js";
import { parseEndpointCall, without } from "./invoke.js";
import { type JsonRecord, type JsonValue, jsonRecord, readNumber, readString } from "./json.js";
import { exitAfter, handleOutput, writeOutput, written } from "./output.js";
import { withSpinner } from "./spinner.js";

export const BROWSER_RUN_URL = "https://example.com";
export const BROWSER_RUN_CODE = "return await page.title()";
export const RUN_SECONDS = 30;
export const MAX_RUN_SECONDS = 300;
const PROMPT_SECONDS = 120;

export const BROWSER_RUN: CatalogEndpoint = {
  id: "browser.run",
  summary: "Run Playwright code or a prompt in a real browser, in one call",
  method: "POST",
  path: "/v1/browser/{id}/execute",
  keyless: false,
  input: {
    type: "object",
    properties: {
      url: {
        type: "string",
        minLength: 1,
        description: "Page to open first. Alone, it prints the page's text",
      },
      code: {
        type: "string",
        minLength: 1,
        description: "Code to run, with page as a Playwright Page; return the result",
      },
      prompt: { type: "string", minLength: 1, description: "What to do, in plain words" },
      language: { type: "string", enum: ["node", "python", "bash"], default: "node" },
      timeout: {
        type: "integer",
        minimum: 1,
        maximum: MAX_RUN_SECONDS,
        description: `Seconds the run may take, ${RUN_SECONDS} by default or ${PROMPT_SECONDS} for a prompt`,
      },
      id: {
        type: "string",
        minLength: 1,
        description: "Run in this open session and leave it open",
      },
    },
  },
  example: { url: BROWSER_RUN_URL, code: BROWSER_RUN_CODE },
};

const LONE_FUNCTION = /^\s*(async\s+)?(function\b|\(|[\w$]+\s*=>)/u;
const TTL_MARGIN_SECONDS = 60;
const WARM_UP_RETRY_MS = 1000;
const CLOSE_ON_INTERRUPT_MS = 3000;
const INTERRUPTED_EXIT_CODE = 130;
const SHOWN = new Set([
  "success",
  "result",
  "output",
  "error",
  "stderr",
  "exitCode",
  "killed",
  "truncated",
  "page",
  "costUsd",
  "requestId",
]);
const QUIET = new Map<string, JsonValue>([
  ["exitCode", 0],
  ["killed", false],
  ["truncated", false],
]);
const SESSION_LINKS = ["cdpUrl", "liveViewUrl", "interactiveLiveViewUrl"];

const opened = z.object({ id: z.string().min(1) });

interface Ran {
  readonly executed: JsonRecord;
  readonly closed?: JsonRecord | null;
}

export function withBrowserRun(endpoints: readonly CatalogEndpoint[]): readonly CatalogEndpoint[] {
  const first = endpoints.findIndex(({ id }) => id.startsWith("browser."));
  if (first < 0 || endpoints.some(({ id }) => id === BROWSER_RUN.id)) return endpoints;
  return [...endpoints.slice(0, first), BROWSER_RUN, ...endpoints.slice(first)];
}

export async function runBrowser(endpoint: CatalogEndpoint): Promise<void> {
  const call = parseEndpointCall(endpoint);
  const { id, url, ...body } = call.body;
  const steps = stepsFor(readString(url), body);
  const session = readString(id);
  const run = async (): Promise<Ran> =>
    session === undefined
      ? runInNewBrowser(steps, ttlFor(body))
      : { executed: await runSteps(session, steps, false) };
  show(await (isAgentMode() ? run() : withSpinner("Running in a cloud browser…", run)), call);
}

function stepsFor(url: string | undefined, body: JsonRecord): JsonRecord[] {
  const wanted = ["code", "prompt"].filter((field) => body[field] !== undefined);
  if (wanted.length > 1) throw new CliError("Send only one of --code or --prompt.");
  const open = url === undefined ? undefined : `await page.goto(${JSON.stringify(url)})`;
  if (open === undefined) {
    if (wanted.length === 0) throw new CliError("Send --url, --code or --prompt.");
    return [body];
  }
  if (wanted.length === 0) {
    const read = `${open}; return await page.locator("body").innerText()`;
    return [{ ...without(body, ["language"]), code: read }];
  }
  const code = readString(body.code);
  if (code !== undefined && (body.language ?? "node") === "node" && !LONE_FUNCTION.test(code)) {
    return [{ ...body, code: `${open};\n${code}` }];
  }
  return [{ code: open }, body];
}

async function runInNewBrowser(steps: readonly JsonRecord[], ttl: number): Promise<Ran> {
  const { id } = await send(opened, { method: "POST", path: "/v1/browser", body: { ttl } });
  const interrupted = () => void closeOnInterrupt(id, ttl);
  process.once("SIGINT", interrupted);
  try {
    return await runThenClose(id, steps, ttl);
  } finally {
    process.off("SIGINT", interrupted);
  }
}

async function runThenClose(id: string, steps: readonly JsonRecord[], ttl: number): Promise<Ran> {
  try {
    const executed = await runSteps(id, steps, true);
    return { executed, closed: await closeSession(id, ttl) };
  } catch (error) {
    await closeSession(id, ttl);
    throw error;
  }
}

async function runSteps(
  id: string,
  steps: readonly JsonRecord[],
  justOpened: boolean,
): Promise<JsonRecord> {
  let executed: JsonRecord = {};
  for (const [index, step] of steps.entries()) {
    const run = justOpened && index === 0 ? executeWhenWarm : execute;
    executed = await run(id, step);
    if (didFail(executed)) break;
  }
  return executed;
}

async function executeWhenWarm(id: string, body: JsonRecord): Promise<JsonRecord> {
  try {
    return await execute(id, body);
  } catch (error) {
    const warmingUp =
      error instanceof RequestError &&
      error.failure.code === "internalError" &&
      statusFrom(error) === 503;
    if (!warmingUp) throw error;
    await clock.sleep(WARM_UP_RETRY_MS);
    return execute(id, body);
  }
}

const closeBrowser = (id: string) =>
  send(jsonRecord, { method: "DELETE", path: sessionPath(id) }).catch(() => null);

const unclosed = (id: string, ttl: number) =>
  `Browser session ${id} could not be closed; it closes on its own ${ttl} s after it opened.\n`;

async function closeSession(id: string, ttl: number): Promise<JsonRecord | null> {
  const closed = await closeBrowser(id);
  if (closed === null) process.stderr.write(unclosed(id, ttl));
  return closed;
}

async function closeOnInterrupt(id: string, ttl: number): Promise<void> {
  const gaveUp = clock.sleep(CLOSE_ON_INTERRUPT_MS).then(() => null);
  const closed = await Promise.race([closeBrowser(id), gaveUp]);
  const note = closed === null ? unclosed(id, ttl) : `Stopped; browser session ${id} is closed.\n`;
  exitAfter([written(process.stderr, `\n${note}`)], INTERRUPTED_EXIT_CODE);
}

function ttlFor({ timeout, prompt }: JsonRecord): number {
  return (
    (readNumber(timeout) ?? (prompt === undefined ? RUN_SECONDS : PROMPT_SECONDS)) +
    TTL_MARGIN_SECONDS
  );
}

const sessionPath = (id: string) => `/v1/browser/${encodeURIComponent(id)}`;

const execute = (id: string, body: JsonRecord) =>
  send(jsonRecord, { method: "POST", path: `${sessionPath(id)}/execute`, body });

async function send<Schema extends z.ZodType>(
  schema: Schema,
  options: Pick<RequestOptions, "method" | "path" | "body">,
): Promise<z.output<Schema>> {
  const response = await request({ ...options, accept: "application/json" });
  const parsed = schema.safeParse(response.json);
  if (!parsed.success) throw unexpectedResponse(response);
  return parsed.data;
}

function show(ran: Ran, call: ParsedCall): void {
  const failed = didFail(ran.executed);
  if (failed) process.exitCode = 1;
  const file = { output: call.outputFile };
  const compact = compactOf(ran);
  if (call.format === "raw") {
    handleOutput(rawOf(ran), file);
  } else if (call.format === "json") {
    handleOutput(compact, file);
  } else {
    const text = textOf(ran.executed);
    if (text) writeOutput(text, call.outputFile);
    if (failed) process.stderr.write(`${failureOf(ran.executed)}\n`);
    writeCost(compact.costUsd);
  }
}

function failureOf({ stderr, error }: JsonRecord): string {
  return readString(stderr)?.trimEnd() || readString(error) || "The run failed.";
}

function didFail({ error, exitCode }: JsonRecord): boolean {
  return Boolean(readString(error)) || (readNumber(exitCode) ?? 0) !== 0;
}

function compactOf({ executed, closed }: Ran): JsonRecord {
  const costUsd = closed === undefined ? executed.costUsd : closed?.costUsd;
  const answer: JsonRecord = { ...executed, costUsd: costUsd ?? null };
  return Object.fromEntries(
    Object.entries(answer).filter(([key, value]) => SHOWN.has(key) && !saysNothing(key, value)),
  );
}

function saysNothing(key: string, value: JsonValue): boolean {
  return value === null || value === "" || QUIET.get(key) === value;
}

function rawOf({ executed, closed }: Ran): JsonRecord {
  const run = without(executed, SESSION_LINKS);
  if (closed === undefined) return { execute: run };
  return { execute: run, close: closed === null ? null : without(closed, SESSION_LINKS) };
}

function textOf({ output, result }: JsonRecord): string {
  return [readString(output)?.trimEnd(), readString(result)].filter(Boolean).join("\n");
}

function writeCost(costUsd: JsonValue | undefined): void {
  const cost = readNumber(costUsd);
  if (cost !== undefined) process.stderr.write(`cost: ${formatUsd(cost)}\n`);
}
