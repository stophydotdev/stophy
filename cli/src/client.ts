import { z } from "zod";
import packageJson from "../package.json" with { type: "json" };
import { agentName, currentCommand } from "./agent.js";
import { clock } from "./clock.js";
import { resolveRuntimeConfig } from "./config.js";
import { CliError, type ErrorDetails } from "./errors.js";
import { type JsonRecord, type JsonValue, parseJson } from "./json.js";
import { MIN_VERSION_HEADER, isBelowMinimum, minimumNote, unreadableAdvice } from "./upgrade.js";

const errorObject = z.looseObject({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  retryAfterSeconds: z.number().int().nonnegative().optional(),
  requestId: z.string().optional(),
});

export type Failure = z.infer<typeof errorObject>;

const flatErrorObject = z.looseObject({
  success: z.literal(false).optional(),
  error: z.string(),
  code: z.string(),
  retryable: z.boolean().default(false),
  retryAfterSeconds: z.number().int().nonnegative().optional(),
  requestId: z.string().optional(),
});

const failureSchema = z.union([
  flatErrorObject.transform(({ error, ...rest }): Failure => {
    delete rest.success;
    return { ...rest, message: error };
  }),
  z.object({ error: errorObject }).transform(({ error }): Failure => error),
  z.object({ error: z.string() }).transform(({ error }): Failure => ({
    code: "requestFailed",
    message: error,
    retryable: false,
  })),
]);

export class RequestError extends CliError {
  readonly failure: Failure;

  constructor(message: string, failure: Failure, details?: ErrorDetails) {
    super(message, 1, details);
    this.failure = failure;
  }
}

export interface RequestOptions {
  readonly method: "GET" | "POST" | "DELETE";
  readonly apiKey?: string;
  readonly path: string;
  readonly body?: JsonRecord;
  readonly params?: Record<string, string | undefined>;
  readonly accept: "application/json";
}

export interface HttpResponse {
  readonly status: number;
  readonly text: string;
  readonly json: JsonValue | undefined;
  readonly retryAfter: string | null;
  readonly requestId: string | null;
  readonly minCliVersion: string | null;
  readonly costUsd: string | null;
  readonly rateLimit: {
    readonly limit: string | null;
    readonly remaining: string | null;
    readonly reset: string | null;
  };
}

const BUSY_RETRIES = 3;
const BUSY_WAIT_LIMIT_SECONDS = 60;

export function request(options: RequestOptions): Promise<HttpResponse> {
  return requestUnlessBusy(options, BUSY_RETRIES);
}

async function requestUnlessBusy(
  options: RequestOptions,
  retriesLeft: number,
): Promise<HttpResponse> {
  try {
    return await requestOnce(options);
  } catch (error) {
    const seconds = error instanceof RequestError ? busyFor(error.failure) : undefined;
    if (seconds === undefined || retriesLeft === 0) throw error;
    process.stderr.write(`Stophy is busy; trying again in ${seconds}s.\n`);
    await clock.sleep(seconds * 1000);
    return requestUnlessBusy(options, retriesLeft - 1);
  }
}

function busyFor({ code, retryAfterSeconds }: Failure): number | undefined {
  if (code !== "busy" || retryAfterSeconds === undefined) return undefined;
  return retryAfterSeconds <= BUSY_WAIT_LIMIT_SECONDS ? retryAfterSeconds : undefined;
}

async function requestOnce(options: RequestOptions): Promise<HttpResponse> {
  const runtime = await resolveRuntimeConfig();
  const { baseUrl, sessionCookie } = runtime;
  const apiKey = options.apiKey ?? runtime.apiKey;
  const keySource = options.apiKey ? "stored" : runtime.apiKeySource;
  const base = new URL(`${baseUrl}/`);
  const url = new URL(options.path, base);
  if (
    (base.protocol !== "http:" && base.protocol !== "https:") ||
    url.protocol !== base.protocol ||
    url.origin !== base.origin
  ) {
    throw new CliError("Request destination must use the configured API origin.");
  }
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }

  const headers = new Headers({
    Accept: options.accept,
    "User-Agent": `stophy-cli/${packageJson.version}`,
  });
  const agent = agentName();
  if (agent) headers.set("x-stophy-agent", agent);
  const command = currentCommand();
  if (command) headers.set("x-stophy-command", command);
  try {
    if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
    if (sessionCookie) headers.set("Cookie", sessionCookie);
  } catch {
    throw new CliError(
      "The API key or session cookie has characters an HTTP header cannot carry. Fix STOPHY_API_KEY, or run `stophy logout` and sign in again.",
    );
  }
  if (options.method === "POST") headers.set("Content-Type", "application/json");
  const init: RequestInit = { method: options.method, headers, redirect: "error" };
  if (options.method === "POST") init.body = JSON.stringify(options.body ?? {});

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "network error";
    const message = `Network request failed for ${url.toString()}: ${reason}`;
    throw new RequestError(message, { code: "networkError", message, retryable: true });
  }

  const text = await response.text();
  const json = parseJsonBody(text, response.headers.get("content-type"));
  const retryAfter = response.headers.get("Retry-After");
  const minCliVersion = response.headers.get(MIN_VERSION_HEADER);
  if (!response.ok) {
    const failure = withUpgrade(
      withHint(failureOf(json, response.status, retryAfter), keySource),
      minCliVersion,
    );
    const requestId = failure.requestId ?? response.headers.get("X-Request-ID");
    const message = failureMessage(failure, retryAfter);
    const details: ErrorDetails = retryAfter
      ? { status: response.status, retryAfter }
      : { status: response.status };
    throw new RequestError(
      withRequestId(message, requestId),
      { ...failure, requestId: requestId ?? undefined },
      details,
    );
  }

  if (isBelowMinimum(minCliVersion)) process.stderr.write(`${minimumNote(minCliVersion)}\n`);

  return {
    status: response.status,
    text,
    json,
    retryAfter,
    minCliVersion,
    requestId: response.headers.get("X-Request-ID"),
    costUsd: response.headers.get("x-cost-usd"),
    rateLimit: {
      limit: response.headers.get("X-RateLimit-Limit"),
      remaining: response.headers.get("X-RateLimit-Remaining"),
      reset: response.headers.get("X-RateLimit-Reset"),
    },
  };
}

function parseJsonBody(text: string, contentType: string | null): JsonValue | undefined {
  const trimmed = text.trim();
  const looksJson =
    (contentType ?? "").includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[");
  if (!looksJson) return undefined;
  try {
    return parseJson(text);
  } catch {
    return undefined;
  }
}

export function withRequestId(message: string, requestId: string | null): string {
  return requestId === null ? message : `${message}\nRequest id: ${requestId}`;
}

function failureOf(
  body: JsonValue | undefined,
  status: number,
  retryAfter: string | null,
): Failure {
  const parsed = failureSchema.safeParse(body);
  const failure: Failure = parsed.success
    ? parsed.data
    : {
        code: "requestFailed",
        message: `Request failed with status ${status}.`,
        retryable: status >= 500,
      };
  const header = retryAfter === null ? Number.NaN : Number(retryAfter);
  if (failure.retryAfterSeconds === undefined && Number.isInteger(header) && header >= 0) {
    return { ...failure, retryAfterSeconds: header };
  }
  return failure;
}

export function rejectedKeyHint(source: "env" | "stored" | undefined): string | undefined {
  if (source === "stored") return "Run `stophy logout`, then `stophy login`.";
  if (source === "env") return "Set a valid STOPHY_API_KEY, or unset it and run `stophy login`.";
  return undefined;
}

function hintFor(code: string, source: "env" | "stored" | undefined): string | undefined {
  if (code === "freeLimit" && source === undefined) return "Run `stophy login` to get a key.";
  return code === "unauthorized" ? rejectedKeyHint(source) : undefined;
}

function withHint(failure: Failure, source: "env" | "stored" | undefined): Failure {
  const hint = hintFor(failure.code, source);
  return hint ? { ...failure, message: `${failure.message} ${hint}` } : failure;
}

function withUpgrade(failure: Failure, minimum: string | null): Failure {
  return isBelowMinimum(minimum)
    ? { ...failure, message: `${failure.message} ${minimumNote(minimum)}` }
    : failure;
}

export function unexpectedResponse({
  status,
  requestId,
  minCliVersion,
}: HttpResponse): RequestError {
  const message = `Server returned an unexpected response shape (status ${status}). ${unreadableAdvice(minCliVersion)}`;
  return new RequestError(
    withRequestId(message, requestId),
    { code: "unexpectedResponse", message, retryable: false, requestId: requestId ?? undefined },
    { status },
  );
}

function failureMessage(failure: Failure, retryAfter: string | null): string {
  if (failure.retryAfterSeconds !== undefined)
    return `${failure.message} Retry after ${failure.retryAfterSeconds}s.`;
  return retryAfter === null ? failure.message : `${failure.message} Retry after ${retryAfter}.`;
}
