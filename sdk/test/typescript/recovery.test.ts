import { expect, test } from "bun:test";
import { Stophy, StophyError, type StophyOptions } from "../../packages/typescript/src/index";
import { isString } from "../../packages/typescript/src/json";
import { acceptJobs, type Received } from "./fake-api";

const api = (
  answer: (
    request: Received,
    count: number,
  ) => ReturnType<ReturnType<typeof acceptJobs>["answer"]> | Response,
  options: StophyOptions = {},
) => {
  const received: Received[] = [];
  const client = new Stophy({
    apiKey: "k",
    maxRetries: 2,
    retryInitialDelayMs: 0,
    ...options,
    fetch: async (input, init) => {
      const request = new Request(input, init);
      const item = {
        path: new URL(request.url).pathname,
        key: request.headers.get("idempotency-key") ?? undefined,
        body: await request.text(),
      };
      received.push(item);
      const reply = answer(item, received.length);
      if (reply instanceof Response) return reply;
      if (reply === "drop") throw new TypeError("response disconnected");
      if (reply === "hang" || reply === "drop-then-refuse") {
        throw new Error(`Unexpected fixture reply: ${reply}`);
      }
      return Response.json(reply.body, { status: reply.status, headers: reply.headers });
    },
  });
  return { client, received };
};

test.each([
  { status: 429, code: "rateLimited", retryable: true, retryAfterSeconds: 0, sends: 3 },
  { status: 503, code: "busy", retryable: true, retryAfterSeconds: 0, sends: 3 },
  { status: 429, code: "rateLimited", retryable: true, retryAfterSeconds: 120, sends: 2 },
  { status: 401, code: "unauthorized", retryable: false, retryAfterSeconds: 0, sends: 2 },
])("a lost send followed by $code retains recovery information", async (rejection) => {
  const jobs = acceptJobs();
  let recovering = false;
  const fake = api((request, count) => {
    if (count === 1 || recovering) return jobs.answer(request, count);
    return {
      status: rejection.status,
      body: { success: false, error: "rejected", ...rejection, requestId: "req-retry" },
    };
  });
  const { client } = fake;
  const body = { url: "https://a.test" };
  const error: unknown = await client.crawl(body).catch((error: Error) => error);
  expect(error).toBeInstanceOf(StophyError);
  expect(error).toMatchObject({
    status: rejection.status,
    code: rejection.code,
    retryable: rejection.retryable,
    retryAfterSeconds: rejection.retryAfterSeconds,
    requestId: "req-retry",
    outcomeUnknown: true,
    details: { idempotencyKey: fake.received[0]?.key },
  });
  expect(fake.received).toHaveLength(rejection.sends);
  expect(jobs.charges).toEqual(["job_1"]);
  if (!(error instanceof StophyError)) throw error;
  const key = error.details.idempotencyKey;
  if (!isString(key)) throw new Error("Missing recovery key");
  expect(error.message).toContain("may still complete");
  recovering = true;
  await expect(client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({ id: "job_1" });
  expect(jobs.charges).toEqual(["job_1"]);
  expect(new Set(fake.received.map((request) => request.key))).toEqual(new Set([key]));
});

test.each(["", "<html>gateway</html>", '{"success":true,"id":'])(
  "an unreadable success response retains a key that recovers the accepted job: %j",
  async (text) => {
    const jobs = acceptJobs([]);
    let recovering = false;
    const fake = api((request, count) => {
      const answer = jobs.answer(request, count);
      return recovering
        ? answer
        : new Response(text, { status: 200, headers: { "x-request-id": "req-bad" } });
    });
    const { client } = fake;
    const body = { url: "https://a.test" };
    const error: unknown = await client.crawl(body).catch((error: Error) => error);
    expect(error).toBeInstanceOf(StophyError);
    expect(error).toMatchObject({
      status: 200,
      retryable: false,
      requestId: "req-bad",
      outcomeUnknown: true,
      details: { idempotencyKey: fake.received[0]?.key },
    });
    expect(fake.received).toHaveLength(1);
    if (!(error instanceof StophyError)) throw error;
    const key = error.details.idempotencyKey;
    if (!isString(key)) throw new Error("Missing recovery key");
    recovering = true;
    await expect(client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
      id: "job_1",
    });
    expect(jobs.charges).toEqual(["job_1"]);
    expect(fake.received.map((request) => request.key)).toEqual([key, key]);
  },
);

test.each(["", "not json"])(
  "an unprotected write with an unreadable success response stops with an unknown outcome: %j",
  async (text) => {
    const fake = api(() => new Response(text, { status: 201 }));
    await expect(fake.client.signup()).rejects.toMatchObject({
      status: 201,
      outcomeUnknown: true,
      details: {},
    });
    expect(fake.received).toHaveLength(1);
    expect(fake.received[0]?.key).toBeUndefined();
  },
);

test("a rejection without a lost send does not claim an unknown outcome or expose a key", async () => {
  const fake = api(() => ({
    status: 429,
    body: { success: false, code: "rateLimited", retryable: true, retryAfterSeconds: 0 },
  }));
  const error: unknown = await fake.client
    .crawl({ url: "https://a.test" })
    .catch((error: Error) => error);
  expect(error).toMatchObject({ status: 429, code: "rateLimited", details: {} });
  expect(error).not.toHaveProperty("outcomeUnknown");
  expect(fake.received).toHaveLength(3);
});

test("exhausted lost replies preserve the network error and its recovery key", async () => {
  const jobs = acceptJobs(["drop", "drop", "drop"]);
  const fake = api(jobs.answer);
  const body = { url: "https://a.test" };
  const error: unknown = await fake.client.crawl(body).catch((error: Error) => error);
  const key = fake.received[0]?.key;
  expect(error).toBeInstanceOf(TypeError);
  expect(error).toMatchObject({ idempotencyKey: key, outcomeUnknown: true });
  expect(fake.received).toHaveLength(3);
  if (key === undefined) throw new Error("Missing recovery key");
  await expect(fake.client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
    id: "job_1",
  });
  expect(jobs.charges).toEqual(["job_1"]);
});

test.each([502, 504])(
  "repeated ambiguous HTTP %i replies retain the key that recovers the accepted job",
  async (status) => {
    const jobs = acceptJobs([]);
    let recovering = false;
    const fake = api((request, count) => {
      const answer = jobs.answer(request, count);
      return recovering
        ? answer
        : new Response("<html>gateway</html>", {
            status,
            headers: { "x-request-id": "req-gateway", "retry-after": "0" },
          });
    });
    const body = { url: "https://a.test" };
    const error: unknown = await fake.client.crawl(body).catch((error: Error) => error);
    expect(error).toBeInstanceOf(StophyError);
    expect(error).toMatchObject({
      status,
      retryable: true,
      requestId: "req-gateway",
      retryAfterSeconds: 0,
      outcomeUnknown: true,
      details: { idempotencyKey: fake.received[0]?.key },
    });
    expect(fake.received).toHaveLength(3);
    if (!(error instanceof StophyError)) throw error;
    const key = error.details.idempotencyKey;
    if (!isString(key)) throw new Error("Missing recovery key");
    recovering = true;
    await expect(fake.client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
      id: "job_1",
    });
    expect(jobs.charges).toEqual(["job_1"]);
    expect(new Set(fake.received.map((request) => request.key))).toEqual(new Set([key]));
  },
);

test.each([
  { status: 401, retryAfter: "0", maxRetries: 2 },
  { status: 429, retryAfter: "120", maxRetries: 2 },
  { status: 504, retryAfter: "0", maxRetries: 0 },
])("an ambiguous HTTP reply retains recovery through $status", async (last) => {
  const jobs = acceptJobs([]);
  let recovering = false;
  const fake = api(
    (request, count) => {
      const answer = jobs.answer(request, count);
      if (recovering) return answer;
      return new Response("gateway", {
        status: count === 1 ? 504 : last.status,
        headers: { "retry-after": count === 1 ? "0" : last.retryAfter },
      });
    },
    { maxRetries: last.maxRetries },
  );
  const body = { url: "https://a.test" };
  const error: unknown = await fake.client.crawl(body).catch((error: Error) => error);
  expect(error).toMatchObject({
    status: last.status,
    outcomeUnknown: true,
    details: { idempotencyKey: fake.received[0]?.key },
  });
  expect(fake.received).toHaveLength(last.maxRetries === 0 ? 1 : 2);
  if (!(error instanceof StophyError)) throw error;
  const key = error.details.idempotencyKey;
  if (!isString(key)) throw new Error("Missing recovery key");
  recovering = true;
  await expect(fake.client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
    id: "job_1",
  });
  expect(jobs.charges).toEqual(["job_1"]);
});

test.each([new Error("stop"), new DOMException("stop", "AbortError")])(
  "concurrent crawls sharing an abort reason retain independent recovery keys: $name",
  async (reason) => {
    const jobs = acceptJobs([]);
    const received: Received[] = [];
    const controller = new AbortController();
    let recovering = false;
    const client = new Stophy({
      apiKey: "k",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        const item = {
          path: new URL(request.url).pathname,
          key: request.headers.get("idempotency-key") ?? undefined,
          body: await request.text(),
        };
        received.push(item);
        const answer = jobs.answer(item, received.length);
        if (recovering && answer instanceof Object) {
          return Response.json(answer.body, { status: answer.status });
        }
        return new Promise<Response>((_, reject) => {
          request.signal.addEventListener("abort", () => reject(request.signal.reason), {
            once: true,
          });
          if (received.length === 2) controller.abort(reason);
        });
      },
    });
    const body = { url: "https://a.test" };
    const errors = await Promise.all(
      [0, 1].map(() =>
        client.crawl(body, { signal: controller.signal }).catch((error: Error) => error),
      ),
    );
    expect(errors[0]).not.toBe(errors[1]);
    expect(received).toHaveLength(2);
    expect(new Set(received.map((request) => request.key)).size).toBe(2);
    expect(controller.signal.reason).toBe(reason);
    expect(reason).not.toHaveProperty("idempotencyKey");
    expect(reason).not.toHaveProperty("outcomeUnknown");
    recovering = true;
    for (const [index, error] of errors.entries()) {
      expect(error).not.toBe(reason);
      expect(error).toMatchObject({
        name: reason.name,
        message: reason.message,
        cause: reason,
        outcomeUnknown: true,
        idempotencyKey: received[index]?.key,
      });
      if (!(error instanceof Error) || !("idempotencyKey" in error)) throw error;
      expect(error.idempotencyKey).toBeString();
      const key = String(error.idempotencyKey);
      await expect(client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
        id: `job_${index + 1}`,
      });
    }
    expect(jobs.charges).toEqual(["job_1", "job_2"]);
  },
);

test.each(["fetch", "body"])(
  "cancelling during %s after job acceptance retains the recovery key",
  async (phase) => {
    const jobs = acceptJobs([]);
    const received: Received[] = [];
    const controller = new AbortController();
    const reason = new DOMException("stop", "AbortError");
    let recovering = false;
    const client = new Stophy({
      apiKey: "k",
      retryInitialDelayMs: 0,
      fetch: async (input, init) => {
        const request = new Request(input, init);
        const item = {
          path: new URL(request.url).pathname,
          key: request.headers.get("idempotency-key") ?? undefined,
          body: await request.text(),
        };
        received.push(item);
        const answer = jobs.answer(item, received.length);
        if (recovering && answer instanceof Object) {
          return Response.json(answer.body, { status: answer.status });
        }
        if (phase === "fetch") {
          controller.abort(reason);
          throw reason;
        }
        return new Response(
          new ReadableStream({
            pull(stream) {
              controller.abort(reason);
              stream.error(reason);
            },
          }),
        );
      },
    });
    const body = { url: "https://a.test" };
    const error: unknown = await client
      .crawl(body, { signal: controller.signal })
      .catch((error: Error) => error);
    expect(error).not.toBe(reason);
    expect(error).toMatchObject({
      name: "AbortError",
      cause: reason,
      outcomeUnknown: true,
      idempotencyKey: received[0]?.key,
    });
    expect(received).toHaveLength(1);
    if (!(error instanceof Error) || !("idempotencyKey" in error)) throw error;
    expect(error.idempotencyKey).toBeString();
    const key = String(error.idempotencyKey);
    recovering = true;
    await expect(client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
      id: "job_1",
    });
    expect(received.map((request) => request.key)).toEqual([key, key]);
    expect(jobs.charges).toEqual(["job_1"]);
  },
);

test.each(["drop", "gateway", "rejection"])(
  "cancelling the retry wait after %s exposes recovery only for a possibly accepted write",
  async (reply) => {
    const jobs = acceptJobs([]);
    const controller = new AbortController();
    const reason = new Error("stop waiting");
    let recovering = false;
    const fake = api(
      (request, count) => {
        if (recovering) return jobs.answer(request, count);
        setImmediate(() => controller.abort(reason));
        if (reply === "rejection") {
          return { status: 429, body: { code: "rateLimited", retryAfterSeconds: 30 } };
        }
        jobs.answer(request, count);
        if (reply === "drop") return "drop";
        return new Response("gateway", { status: 502, headers: { "retry-after": "30" } });
      },
      { retryInitialDelayMs: 30_000 },
    );
    const body = { url: "https://a.test" };
    const error: unknown = await fake.client
      .crawl(body, { signal: controller.signal })
      .catch((error: Error) => error);
    expect(fake.received).toHaveLength(1);
    if (reply === "rejection") {
      expect(error).toBe(reason);
      expect(error).not.toHaveProperty("outcomeUnknown");
      expect(error).not.toHaveProperty("idempotencyKey");
      expect(jobs.charges).toEqual([]);
      return;
    }
    expect(error).not.toBe(reason);
    expect(error).toMatchObject({
      cause: reason,
      outcomeUnknown: true,
      idempotencyKey: fake.received[0]?.key,
    });
    if (!(error instanceof Error) || !("idempotencyKey" in error)) throw error;
    expect(error.idempotencyKey).toBeString();
    const key = String(error.idempotencyKey);
    recovering = true;
    await expect(fake.client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
      id: "job_1",
    });
    expect(fake.received.map((request) => request.key)).toEqual([key, key]);
    expect(jobs.charges).toEqual(["job_1"]);
  },
);

test("a call cancelled before sending has no unknown outcome or recovery key", async () => {
  const controller = new AbortController();
  const reason = new Error("already stopped");
  controller.abort(reason);
  const fake = api(() => {
    throw reason;
  });
  const error: unknown = await fake.client
    .crawl({ url: "https://a.test" }, { signal: controller.signal })
    .catch((error: Error) => error);
  expect(error).toBe(reason);
  expect(error).not.toHaveProperty("outcomeUnknown");
  expect(error).not.toHaveProperty("idempotencyKey");
  expect(fake.received).toHaveLength(0);
});

test.each([
  { name: "string", reason: "stop" },
  { name: "null", reason: null },
  { name: "frozen error", reason: Object.freeze(new Error("stop")) },
])("cancellation with a $name reason still provides a usable recovery key", async ({ reason }) => {
  const jobs = acceptJobs([]);
  const controller = new AbortController();
  let recovering = false;
  const fake = api((request, count) => {
    const answer = jobs.answer(request, count);
    if (recovering) return answer;
    controller.abort(reason);
    throw reason;
  });
  const body = { url: "https://a.test" };
  const error: unknown = await fake.client
    .crawl(body, { signal: controller.signal })
    .catch((error: Error) => error);
  expect(error).toBeInstanceOf(Error);
  expect(error).toMatchObject({
    outcomeUnknown: true,
    idempotencyKey: fake.received[0]?.key,
    cause: reason,
  });
  expect(fake.received).toHaveLength(1);
  if (!(error instanceof Error) || !("idempotencyKey" in error)) throw error;
  expect(error.idempotencyKey).toBeString();
  const key = String(error.idempotencyKey);
  recovering = true;
  await expect(fake.client.crawl(body, { idempotencyKey: key })).resolves.toMatchObject({
    id: "job_1",
  });
  expect(fake.received.map((request) => request.key)).toEqual([key, key]);
  expect(jobs.charges).toEqual(["job_1"]);
});

test.each([
  { status: 503, code: "busy" },
  { status: 504, code: "sourceTimeout" },
])("a definite $code API failure does not invent a recovery key", async ({ status, code }) => {
  const fake = api(() => ({
    status,
    body: { success: false, code, retryable: true, retryAfterSeconds: 0 },
  }));
  const error: unknown = await fake.client.search({ query: "x" }).catch((error: Error) => error);
  expect(error).toMatchObject({ status, code, retryable: true, details: {} });
  expect(error).not.toHaveProperty("outcomeUnknown");
  expect(fake.received).toHaveLength(3);
});
