import { z } from "zod";
import { isAgentMode } from "./agent.js";
import type { CatalogEndpoint } from "./catalog.js";
import { type HttpResponse, type RequestOptions, request, unexpectedResponse } from "./client.js";
import { endpointTokens, parseEndpointCall, runEndpoint, writeAnswer } from "./invoke.js";
import { requestFor } from "./jobs.js";
import { type JsonRecord, jsonValue, readString } from "./json.js";
import { exitAfter, written } from "./output.js";
import { withSpinner } from "./spinner.js";

export const BROWSER_TASK = "browser.task";
export const BROWSER_TASK_STATUS = "browser.task.status";

const NO_WAIT = "--no-wait";
export const BROWSER_TASK_FLAGS = [
  [NO_WAIT, "Print the task id at once instead of waiting for the answer"],
] as const;

const STATUS_PATH = "/v1/browser/task/status";
const WAIT_SECONDS = 60;
const WAIT_LIMIT_MS = 12 * 60_000;
const INTERRUPTED_EXIT_CODE = 130;

const started = z.object({ data: z.object({ id: z.string().min(1) }) });
const answered = z.object({ data: z.object({ status: z.string() }) });
const withPageText = z.object({
  data: z
    .object({ result: z.object({ pageText: z.string() }).catchall(jsonValue) })
    .catchall(jsonValue),
});

interface Waited {
  readonly response: HttpResponse;
  readonly running: boolean;
}

export async function runBrowserTask(endpoint: CatalogEndpoint): Promise<void> {
  const tokens = endpointTokens(endpoint);
  const flags = withoutNoWait(tokens);
  const call = parseEndpointCall(endpoint, flags);
  if (flags.length < tokens.length) return runEndpoint(endpoint, call);
  const id = await quietlyFor("Starting the browser task…", () => startTask(endpoint, call.body));
  try {
    const { response, running } = await quietlyFor("Waiting for the browser task…", () =>
      waitForAnswer(id),
    );
    writeAnswer(endpoint, call, response, (body) => withPagePointer(body, id));
    if (!running) return;
    process.stderr.write(`Task ${id} is still running after 12 minutes. ${followUp(id)}\n`);
    process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Task ${id} has started. ${followUp(id)}\n`);
    throw error;
  }
}

function withoutNoWait(tokens: readonly string[]): readonly string[] {
  const separator = tokens.indexOf("--");
  const end = separator < 0 ? tokens.length : separator;
  return tokens.filter((token, index) => token !== NO_WAIT || index > end);
}

const followUp = (id: string) =>
  `Read it with \`stophy browser task status ${id}\`, or stop it with \`stophy browser task cancel ${id}\`.`;

const quietlyFor = <T>(message: string, task: () => Promise<T>) =>
  isAgentMode() ? task() : withSpinner(message, task);

export async function runBrowserTaskStatus(endpoint: CatalogEndpoint): Promise<void> {
  const call = parseEndpointCall(endpoint);
  const id = readString(call.body.id) ?? "<id>";
  await runEndpoint(endpoint, call, (body) => withPagePointer(body, id));
}

async function startTask(endpoint: CatalogEndpoint, body: JsonRecord): Promise<string> {
  const { answer } = await ask(started, requestFor(endpoint, body));
  return answer.data.id;
}

async function waitForAnswer(id: string): Promise<Waited> {
  const interrupted = () =>
    exitAfter(
      [written(process.stderr, `\nStopped waiting. Task ${id} keeps running. ${followUp(id)}\n`)],
      INTERRUPTED_EXIT_CODE,
    );
  process.once("SIGINT", interrupted);
  try {
    const deadline = Date.now() + WAIT_LIMIT_MS;
    let waited = await pollTask(id, WAIT_SECONDS);
    let left = deadline - Date.now();
    while (waited.running && left > 0) {
      waited = await pollTask(id, Math.min(WAIT_SECONDS, Math.floor(left / 1000)));
      left = deadline - Date.now();
    }
    return waited;
  } finally {
    process.off("SIGINT", interrupted);
  }
}

async function pollTask(id: string, wait: number): Promise<Waited> {
  const { response, answer } = await ask(answered, {
    method: "POST",
    path: STATUS_PATH,
    body: { id, wait },
  });
  return { response, running: answer.data.status === "running" };
}

async function ask<Schema extends z.ZodType>(
  schema: Schema,
  options: Omit<RequestOptions, "accept">,
): Promise<{ readonly response: HttpResponse; readonly answer: z.output<Schema> }> {
  const response = await request({ ...options, accept: "application/json" });
  const parsed = schema.safeParse(response.json);
  if (!parsed.success) throw unexpectedResponse(response);
  return { response, answer: parsed.data };
}

function withPagePointer(body: JsonRecord, id: string): JsonRecord {
  const parsed = withPageText.safeParse(body);
  if (!parsed.success) return body;
  const { data } = parsed.data;
  const pageText = `${data.result.pageText.length} characters; stophy browser task status ${id} --raw shows them`;
  return { ...body, data: { ...data, result: { ...data.result, pageText } } };
}
