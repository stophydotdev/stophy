import { z } from "zod";
import { formatUsd } from "./account.js";
import { isAgentMode } from "./agent.js";
import type { CatalogEndpoint } from "./catalog.js";
import { type RequestOptions, request, unexpectedResponse } from "./client.js";
import type { ParsedCall } from "./flags.js";
import { parseEndpointCall, without } from "./invoke.js";
import { type JsonRecord, type JsonValue, jsonRecord, readNumber, readString } from "./json.js";
import { handleOutput, writeOutput } from "./output.js";
import { withSpinner } from "./spinner.js";

export const BROWSER_RUN_CODE = "await page.goto('https://example.com'); return await page.title()";

export const BROWSER_RUN: CatalogEndpoint = {
  id: "browser.run",
  summary: "Run Playwright code or a prompt in a real browser, in one call",
  method: "POST",
  path: "/v1/browser/{id}/execute",
  keyless: false,
  input: {
    type: "object",
    properties: {
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
        maximum: 300,
        description: "Seconds the run may take, 30 by default or 120 for a prompt",
      },
      id: {
        type: "string",
        minLength: 1,
        description: "Run in this open session and leave it open",
      },
    },
    sendOne: ["code", "prompt"],
  },
  example: { code: BROWSER_RUN_CODE },
};

const TTL_MARGIN_SECONDS = 60;
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
  readonly closed?: JsonRecord;
}

export function withBrowserRun(endpoints: readonly CatalogEndpoint[]): readonly CatalogEndpoint[] {
  const first = endpoints.findIndex(({ id }) => id.startsWith("browser."));
  if (first < 0 || endpoints.some(({ id }) => id === BROWSER_RUN.id)) return endpoints;
  return [...endpoints.slice(0, first), BROWSER_RUN, ...endpoints.slice(first)];
}

export async function runBrowser(endpoint: CatalogEndpoint): Promise<void> {
  const call = parseEndpointCall(endpoint);
  const { id, ...body } = call.body;
  const session = readString(id);
  const run = async (): Promise<Ran> =>
    session === undefined ? runInNewBrowser(body) : { executed: await execute(session, body) };
  show(await (isAgentMode() ? run() : withSpinner("Running in a cloud browser…", run)), call);
}

async function runInNewBrowser(body: JsonRecord): Promise<Ran> {
  const { id } = await send(opened, {
    method: "POST",
    path: "/v1/browser",
    body: { ttl: ttlFor(body) },
  });
  let executed: JsonRecord;
  let closed: JsonRecord;
  try {
    executed = await execute(id, body);
  } finally {
    closed = await send(jsonRecord, { method: "DELETE", path: sessionPath(id) });
  }
  return { executed, closed };
}

function ttlFor({ timeout, prompt }: JsonRecord): number {
  return (readNumber(timeout) ?? (prompt === undefined ? 30 : 120)) + TTL_MARGIN_SECONDS;
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
  } else if (call.format === "json" || failed || isAgentMode()) {
    handleOutput(compact, file);
  } else {
    writeOutput(textOf(ran.executed), call.outputFile);
    writeCost(compact.costUsd);
  }
}

function didFail({ error, exitCode }: JsonRecord): boolean {
  return Boolean(readString(error)) || (readNumber(exitCode) ?? 0) !== 0;
}

function compactOf({ executed, closed }: Ran): JsonRecord {
  const answer: JsonRecord = { ...executed, costUsd: (closed ?? executed).costUsd ?? null };
  return Object.fromEntries(
    Object.entries(answer).filter(([key, value]) => SHOWN.has(key) && !saysNothing(key, value)),
  );
}

function saysNothing(key: string, value: JsonValue): boolean {
  return value === null || value === "" || QUIET.get(key) === value;
}

function rawOf({ executed, closed }: Ran): JsonRecord {
  const run = without(executed, SESSION_LINKS);
  return closed === undefined ? { execute: run } : { execute: run, close: closed };
}

function textOf({ output, result }: JsonRecord): string {
  return [readString(output)?.trimEnd(), readString(result)].filter(Boolean).join("\n");
}

function writeCost(costUsd: JsonValue | undefined): void {
  const cost = readNumber(costUsd);
  if (cost !== undefined) process.stderr.write(`cost: ${formatUsd(cost)}\n`);
}
