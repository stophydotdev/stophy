import { version } from "../package.json";
import { StophyError } from "./errors";
import { isBoolean, isNumber, isRecord, isString, type JsonValue } from "./json";

const DEFAULT_BASE_URL = "https://api.stophy.dev";
const DEFAULT_TIMEOUT_MS = 70_000;
const MAX_RETRY_WAIT_SECONDS = 60;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const JOB_STARTS = new Set(["/v1/batch/scrape", "/v1/crawl"]);
const USER_AGENT = `stophy-typescript/${version}`;

export interface CallOptions {
  signal?: AbortSignal;
  idempotencyKey?: string;
}

export type Method = "GET" | "POST" | "DELETE";

export type Query = Record<string, string | number | undefined>;

export interface RequestSpec {
  method: Method;
  path: string;
  body?: unknown;
  query?: Query;
  options?: CallOptions;
}

export type Caller = <Result>(spec: RequestSpec) => Promise<Result>;

export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface TransportOptions {
  apiKey?: string;
  baseUrl?: string;
  fetch?: FetchLike;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryInitialDelayMs?: number;
  timeoutMs?: number;
}

export function createCaller(options: TransportOptions): Caller {
  const baseFetch: FetchLike = options.fetch ?? globalThis.fetch;
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const retry: RetryPolicy = {
    maxRetries: options.maxRetries ?? 2,
    initialDelayMs: options.retryInitialDelayMs ?? 500,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  };

  return async <Result>(spec: RequestSpec): Promise<Result> => {
    const headers = new Headers(options.headers);
    if (!("document" in globalThis) && !headers.has("user-agent")) {
      headers.set("user-agent", USER_AGENT);
    }
    if (options.apiKey) {
      headers.set("authorization", `Bearer ${options.apiKey}`);
    }
    headers.set("accept", "application/json");
    if (spec.body !== undefined) headers.set("content-type", "application/json");
    const key =
      spec.method === "POST"
        ? (spec.options?.idempotencyKey ?? headers.get("idempotency-key") ?? crypto.randomUUID())
        : undefined;
    if (key !== undefined) headers.set("idempotency-key", key);

    const hasApiKey = headers.has("authorization");

    const url = withQuery(`${baseUrl}${spec.path}`, spec.query);
    return send<Result>(
      baseFetch,
      url,
      (signal) => ({
        method: spec.method,
        headers,
        body: spec.body === undefined ? undefined : JSON.stringify(spec.body),
        signal,
      }),
      spec.options?.signal,
      spec.method === "DELETE" ? { ...retry, maxRetries: 0 } : retry,
      {
        key: hasApiKey ? key : undefined,
        hasApiKey,
        replayable:
          key === undefined ||
          !hasApiKey ||
          answerIsKept(spec.path, parseJson(JSON.stringify(spec.body ?? null))),
      },
    );
  };
}

interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  timeoutMs: number;
}

interface CallPlan {
  key: string | undefined;
  hasApiKey: boolean;
  replayable: boolean;
}

function answerIsKept(path: string, body: JsonValue): boolean {
  if (JOB_STARTS.has(path) || !isRecord(body)) return true;
  return ![body, body.scrapeOptions, body.options].some(
    (part) => isRecord(part) && part.zeroDataRetention === true,
  );
}

interface NetworkError extends Error {
  code?: string;
  cause?: { code?: string };
}

const NEVER_SENT = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
  "UND_ERR_CONNECT_TIMEOUT",
]);

const requestMayHaveLeft = (error: NetworkError) =>
  !NEVER_SENT.has(error.code ?? error.cause?.code ?? "");

const SEND_AGAIN =
  "Check before you send it again as a new call, or send it again with the same Idempotency-Key in details.idempotencyKey.";

function mayStillComplete(error: StophyError, key: string): StophyError {
  return new StophyError(`${error.message} An earlier send may still complete. ${SEND_AGAIN}`, {
    status: error.status,
    code: error.code,
    retryable: error.retryable,
    retryAfterSeconds: error.retryAfterSeconds,
    requestId: error.requestId,
    details: { ...error.details, idempotencyKey: key },
  });
}

async function send<Result>(
  baseFetch: FetchLike,
  url: string,
  init: (signal: AbortSignal) => RequestInit,
  signal: AbortSignal | undefined,
  retry: RetryPolicy,
  plan: CallPlan,
): Promise<Result> {
  let earlierSendLost = false;
  const mayHaveRun = (error: StophyError) => error.status >= 500 && error.code !== "busy";
  const failWith = (error: StophyError) =>
    plan.key !== undefined && earlierSendLost && mayHaveRun(error)
      ? mayStillComplete(error, plan.key)
      : error;
  for (let n = 0; ; n += 1) {
    const deadline = withDeadline(signal, retry.timeoutMs);
    let waitMs: number;
    try {
      const response = await baseFetch(url, init(deadline.signal)).catch((error: NetworkError) => {
        if (signal?.aborted) throw error;
        const mayHaveLeft = requestMayHaveLeft(error);
        if (mayHaveLeft && !plan.replayable) throw Object.assign(error, { outcomeUnknown: true });
        if (error.name === "TimeoutError" && !plan.hasApiKey) throw error;
        if (n >= retry.maxRetries) {
          throw (mayHaveLeft || earlierSendLost) && plan.key !== undefined
            ? Object.assign(error, { idempotencyKey: plan.key })
            : error;
        }
        earlierSendLost ||= mayHaveLeft;
        return undefined;
      });
      if (response === undefined) {
        waitMs = backoffMs(n, retry.initialDelayMs);
      } else if (response.ok) {
        return await readBody<Result>(response);
      } else {
        const error = await errorFrom(response);
        const seconds = error.retryAfterSeconds;
        if (!error.retryable || n >= retry.maxRetries) throw failWith(error);
        if (seconds !== undefined && seconds > MAX_RETRY_WAIT_SECONDS) throw failWith(error);
        waitMs = seconds === undefined ? backoffMs(n, retry.initialDelayMs) : seconds * 1000;
      }
    } finally {
      deadline.clear();
    }
    await sleep(waitMs, signal);
  }
}

function withDeadline(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(
    () =>
      controller.abort(
        new DOMException(`Stophy request timed out after ${timeoutMs} ms`, "TimeoutError"),
      ),
    timeoutMs,
  );
  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    },
  };
}

async function readBody<Result>(response: Response): Promise<Result> {
  const text = await response.text();
  if (!text) {
    throw failed(response, "Stophy returned an empty response", {});
  }
  try {
    return JSON.parse(text);
  } catch {
    throw failed(response, "Stophy returned a non-JSON response", {});
  }
}

async function errorFrom(response: Response): Promise<StophyError> {
  const text = await response.text();
  const error = readError(text ? parseJson(text) : null);
  return failed(response, error.message ?? `Stophy request failed with status ${response.status}`, {
    code: error.code,
    retryable: error.retryable ?? RETRYABLE_STATUS.has(response.status),
    retryAfterSeconds: error.retryAfterSeconds ?? headerRetryAfter(response),
    requestId: error.requestId ?? headerRequestId(response),
    details: error.details,
  });
}

function failed(
  response: Response,
  message: string,
  options: {
    code?: string;
    retryable?: boolean;
    retryAfterSeconds?: number;
    requestId?: string;
    details?: Record<string, JsonValue>;
  },
): StophyError {
  return new StophyError(message, {
    status: response.status,
    code: options.code,
    retryable: options.retryable ?? false,
    retryAfterSeconds: options.retryAfterSeconds,
    requestId: options.requestId ?? headerRequestId(response),
    details: options.details,
  });
}

interface ErrorFields {
  code?: string;
  message?: string;
  retryable?: boolean;
  retryAfterSeconds?: number;
  requestId?: string;
  details?: Record<string, JsonValue>;
}

function parseJson(text: string): JsonValue {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const ENVELOPE_FIELDS = new Set([
  "success",
  "error",
  "message",
  "code",
  "retryable",
  "retryAfterSeconds",
  "requestId",
]);

function readError(body: JsonValue): ErrorFields {
  if (!isRecord(body)) return {};
  const fields = isRecord(body.error) ? body.error : body;
  return {
    code: isString(fields.code) ? fields.code : undefined,
    message: isString(fields.error)
      ? fields.error
      : isString(fields.message)
        ? fields.message
        : undefined,
    retryable: isBoolean(fields.retryable) ? fields.retryable : undefined,
    retryAfterSeconds: isNumber(fields.retryAfterSeconds) ? fields.retryAfterSeconds : undefined,
    requestId: isString(fields.requestId) ? fields.requestId : undefined,
    details: Object.fromEntries(
      Object.entries(fields).filter(([key]) => !ENVELOPE_FIELDS.has(key)),
    ),
  };
}

function headerRequestId(response: Response): string | undefined {
  return response.headers.get("x-request-id") ?? undefined;
}

function headerRetryAfter(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds;
  const date = Date.parse(header);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function withQuery(url: string, query: Query | undefined): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `${url}?${text}` : url;
}

function backoffMs(attempt: number, base: number): number {
  const window = base * 2 ** attempt;
  return window / 2 + Math.random() * (window / 2);
}

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
