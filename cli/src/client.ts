import { z } from "zod";
import { resolveRuntimeConfig } from "./config.js";
import { CliError, type ErrorDetails } from "./errors.js";
import { type JsonRecord, type JsonValue, parseJson } from "./json.js";

const errorObject = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  retryAfterSeconds: z.number().int().nonnegative().optional(),
  requestId: z.string().optional(),
});

const failureSchema = z.union([
  z.object({ error: z.string() }).transform(({ error }) => ({
    message: error,
    requestId: undefined,
    retryAfterSeconds: undefined,
  })),
  z.object({ error: errorObject }).transform(({ error }) => error),
]);

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

  const headers = new Headers({ Accept: options.accept });
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
    throw new CliError(`Network request failed for ${url.toString()}: ${reason}`);
  }

  const text = await response.text();
  const json = parseJsonBody(text, response.headers.get("content-type"));
  const retryAfter = response.headers.get("Retry-After");
  if (!response.ok) {
    const requestId = response.headers.get("X-Request-ID") ?? requestIdFrom(json);
    const message = failureMessage(json, response.status, retryAfter);
    const details: ErrorDetails = retryAfter
      ? { status: response.status, retryAfter }
      : { status: response.status };
    throw new CliError(withRequestId(message, requestId), 1, details);
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

function requestIdFrom(body: JsonValue | undefined): string | null {
  const parsed = failureSchema.safeParse(body);
  return parsed.success ? (parsed.data.requestId ?? null) : null;
}

export function withRequestId(message: string, requestId: string | null): string {
  return requestId === null ? message : `${message}\nRequest id: ${requestId}`;
}

function failureMessage(
  body: JsonValue | undefined,
  status: number,
  retryAfter: string | null,
): string {
  const parsed = failureSchema.safeParse(body);
  const retryFromBody = parsed.success ? parsed.data.retryAfterSeconds : undefined;
  const retry = retryAfter ?? (retryFromBody === undefined ? null : String(retryFromBody));
  const message = parsed.success ? parsed.data.message : `Request failed with status ${status}.`;
  return retry === null ? message : `${message} Retry after ${retry}s.`;
}
