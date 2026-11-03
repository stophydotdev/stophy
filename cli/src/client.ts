import { z } from "zod";
import packageJson from "../package.json" with { type: "json" };
import { agentName, currentCommand } from "./agent.js";
import { resolveRuntimeConfig } from "./config.js";
import { CliError, type ErrorDetails } from "./errors.js";
import { type JsonRecord, type JsonValue, parseJson } from "./json.js";

const errorObject = z.looseObject({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  retryAfterSeconds: z.number().int().nonnegative().optional(),
  requestId: z.string().optional(),
});

export type Failure = z.infer<typeof errorObject>;

const failureSchema = z.union([
  z.object({ error: z.string() }).transform(({ error }): Failure => ({
    code: "requestFailed",
    message: error,
    retryable: false,
  })),
  z.object({ error: errorObject }).transform(({ error }): Failure => error),
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
  readonly creditsUsed: string | null;
  readonly rateLimit: {
    readonly limit: string | null;
    readonly remaining: string | null;
    readonly reset: string | null;
  };
}

export async function request(options: RequestOptions): Promise<HttpResponse> {
  const runtime = await resolveRuntimeConfig();
  const { baseUrl, sessionCookie } = runtime;
  const apiKey = options.apiKey ?? runtime.apiKey;
  const url = new URL(options.path, `${baseUrl}/`);
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
  if (apiKey) headers.set("Authorization", `Bearer ${apiKey}`);
  if (sessionCookie) headers.set("Cookie", sessionCookie);
  if (options.method === "POST") headers.set("Content-Type", "application/json");
  const init: RequestInit = { method: options.method, headers };
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
  if (!response.ok) {
    const failure = failureOf(json, response.status, retryAfter);
    const requestId = response.headers.get("X-Request-ID") ?? failure.requestId ?? null;
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

  return {
    status: response.status,
    text,
    json,
    retryAfter,
    creditsUsed: response.headers.get("x-credits-used"),
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

function failureMessage(failure: Failure, retryAfter: string | null): string {
  const retry =
    retryAfter ??
    (failure.retryAfterSeconds === undefined ? null : String(failure.retryAfterSeconds));
  return retry === null ? failure.message : `${failure.message} Retry after ${retry}s.`;
}
