import { type JsonValue, isRecord } from "../../packages/typescript/src/json";
import { Stophy, type StophyOptions } from "../../packages/typescript/src/index";

export interface CapturedRequest {
  url: string;
  method: string;
  headers: Headers;
  authorization: string | null;
  body: unknown;
  signal: AbortSignal | null;
}

export interface MockResponseInit {
  status?: number;
  json?: unknown;
  raw?: string;
  headers?: Record<string, string>;
}

export function createMock(responses: MockResponseInit | MockResponseInit[]) {
  const queue = Array.isArray(responses) ? [...responses] : [responses];
  const calls: CapturedRequest[] = [];

  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    const req = input instanceof Request ? input : new Request(input, init);
    let body: unknown;
    const text = await req.clone().text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    calls.push({
      url: req.url,
      method: req.method,
      headers: req.headers,
      authorization: req.headers.get("authorization"),
      body,
      signal: init?.signal ?? null,
    });

    const shifted = queue.length > 1 ? queue.shift() : queue[0];
    if (!shifted) throw new Error("mock has no response");
    const payload =
      shifted.raw !== undefined
        ? shifted.raw
        : shifted.json !== undefined
          ? JSON.stringify(shifted.json)
          : "";
    return new Response(payload, {
      status: shifted.status ?? 200,
      headers: { "content-type": "application/json", ...shifted.headers },
    });
  };

  return { fetchImpl, calls };
}

export function makeClient(
  responses: MockResponseInit | MockResponseInit[],
  opts: Partial<StophyOptions> = {},
) {
  const { fetchImpl, calls } = createMock(responses);
  const client = new Stophy({
    apiKey: "st_test",
    fetch: fetchImpl,
    maxRetries: 0,
    ...opts,
  });
  return { client, calls };
}

export function queryOf(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams.entries());
}

export async function specOperations(): Promise<string[]> {
  const text = await Bun.file(new URL("../../openapi.json", import.meta.url)).text();
  const document: JsonValue = JSON.parse(text);
  if (!isRecord(document) || !isRecord(document.paths)) {
    throw new Error("openapi.json has no paths");
  }
  return Object.entries(document.paths)
    .flatMap(([path, item]) =>
      isRecord(item)
        ? Object.keys(item).map((method) => `${method.toUpperCase()} ${path.replace("{id}", "x")}`)
        : [],
    )
    .sort();
}
