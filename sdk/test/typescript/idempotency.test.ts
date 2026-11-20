import { afterEach, expect, test } from "bun:test";
import { Stophy, StophyError, type StophyOptions } from "../../packages/typescript/src/index";
import type { JsonObject } from "../../packages/typescript/src/json";
import { createCaller } from "../../packages/typescript/src/transport";
import { acceptJobs, fakeApi } from "./fake-api";

const closers: (() => void)[] = [];
afterEach(() => closers.splice(0).forEach((close) => close()));

const api = async (...args: Parameters<typeof fakeApi>) => {
  const fake = await fakeApi(...args);
  closers.push(fake.close);
  return fake;
};

const flat = (code: string, retryable: boolean, extra: JsonObject = {}) => ({
  success: false,
  error: `${code} message`,
  code,
  retryable,
  requestId: "body-request-id",
  ...extra,
});

const clientFor = (baseUrl: string, extra: StophyOptions = {}) =>
  new Stophy({ apiKey: "k", baseUrl, maxRetries: 2, retryInitialDelayMs: 0, ...extra });

test("a crawl whose answer was lost runs and is charged once, with the same key on both sends", async () => {
  const jobs = acceptJobs();
  const fake = await api(jobs.answer);
  const job = await clientFor(fake.baseUrl).crawl({ url: "https://a.test" });
  expect(job).toMatchObject({ id: "job_1" });
  expect(fake.received.length).toBe(2);
  expect(fake.received[0]?.key).toBeString();
  expect(fake.received[1]?.key).toBe(fake.received[0]?.key);
  expect(jobs.charges.length).toBe(1);
});

test("a batch whose answer was lost runs once, even when it keeps no data", async () => {
  const jobs = acceptJobs();
  const fake = await api(jobs.answer);
  await clientFor(fake.baseUrl).batch.scrape({ urls: ["https://a.test"], zeroDataRetention: true });
  expect(fake.received.length).toBe(2);
  expect(jobs.charges.length).toBe(1);
});

test("supported writes use a fresh key for each call and hold it across retries", async () => {
  const jobs = acceptJobs(["drop"]);
  const fake = await api(jobs.answer);
  const client = clientFor(fake.baseUrl);
  await client.scrape({ url: "https://a.test" });
  await client.extract({ urls: ["https://a.test"], prompt: "price" });
  const [first, retry, second] = fake.received.map((received) => received.key);
  expect(first).toBeString();
  expect(retry).toBe(first);
  expect(second).not.toBe(first);
});

test("a key set in the client headers is kept, so the same body returns the first job", async () => {
  const jobs = acceptJobs([]);
  const fake = await api(jobs.answer);
  const client = clientFor(fake.baseUrl, { headers: { "Idempotency-Key": "mine" } });
  const first = await client.crawl({ url: "https://a.test" });
  const second = await client.crawl({ url: "https://a.test" });
  expect([first, second]).toMatchObject([{ id: "job_1" }, { id: "job_1" }]);
  expect(fake.received.map((received) => received.key)).toEqual(["mine", "mine"]);
});

test("a key in the call options wins over the client headers and a generated key", async () => {
  const jobs = acceptJobs([]);
  const fake = await api(jobs.answer);
  const client = clientFor(fake.baseUrl, { headers: { "Idempotency-Key": "client" } });
  await client.crawl({ url: "https://a.test" }, { idempotencyKey: "import-1" });
  await clientFor(fake.baseUrl).batch.scrape(
    { urls: ["https://a.test"] },
    { idempotencyKey: "import-2" },
  );
  expect(fake.received.map((received) => received.key)).toEqual(["import-1", "import-2"]);
});

test("a charged call that keeps no data is not sent again after a lost answer", async () => {
  const jobs = acceptJobs();
  const fake = await api(jobs.answer);
  const error = await clientFor(fake.baseUrl)
    .scrape({ url: "https://a.test", zeroDataRetention: true })
    .catch((e) => e);
  expect(error).toBeInstanceOf(TypeError);
  expect(error.outcomeUnknown).toBe(true);
  expect(fake.received.length).toBe(1);
});

test.each([
  ["/v1/signup", undefined],
  ["/v1/signup/poll", "caller-key"],
  ["/v1/browser", "caller-key"],
  ["/v1/interact", undefined],
  ["/v1/search/developer", undefined],
])("%s does not replay a lost answer even if the caller sends a key", async (path, key) => {
  const jobs = acceptJobs();
  const fake = await api((request, count) => jobs.answer({ ...request, key: undefined }, count));
  const call = createCaller({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    retryInitialDelayMs: 0,
  });
  await expect(
    call({ method: "POST", path, body: {}, options: { idempotencyKey: key } }),
  ).rejects.toMatchObject({ outcomeUnknown: true });
  expect(fake.received.map((request) => request.key)).toEqual([key]);
  expect(jobs.charges).toEqual(["job_1"]);
});

test.each(["/v1/agent", "/v1/browser/task"])(
  "%s replays a lost answer with a stable key",
  async (path) => {
    const jobs = acceptJobs();
    const fake = await api(jobs.answer);
    const call = createCaller({ apiKey: "k", baseUrl: fake.baseUrl, retryInitialDelayMs: 0 });
    await expect(call({ method: "POST", path, body: {} })).resolves.toMatchObject({ id: "job_1" });
    expect(fake.received).toHaveLength(2);
    expect(fake.received[0]?.key).toBeString();
    expect(fake.received[1]?.key).toBe(fake.received[0]?.key);
    expect(jobs.charges).toEqual(["job_1"]);
  },
);

test("a safe rejection can retry an unguarded write", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? { status: 429, body: flat("rateLimited", true, { retryAfterSeconds: 0 }) }
      : { status: 201, body: { success: true, data: { code: "signup-1" } } },
  );
  await expect(clientFor(fake.baseUrl).signup()).resolves.toMatchObject({
    data: { code: "signup-1" },
  });
  expect(fake.received.map((request) => request.key)).toEqual([undefined, undefined]);
});

test("a retry sends the original body even if the input changes", async () => {
  const urls = ["https://a.test"];
  const jobs = acceptJobs();
  const fake = await api((request, count) => {
    urls[0] = "https://b.test";
    return jobs.answer(request, count);
  });
  const result = await clientFor(fake.baseUrl).batch.scrape({ urls });
  expect(result.id).toBe("job_1");
  expect(fake.received.map((request) => request.body)).toEqual([
    '{"urls":["https://a.test"]}',
    '{"urls":["https://a.test"]}',
  ]);
});

test.each(["/v1/scrape", "/v1/search", "/v1/map", "/v1/parse"])(
  "keyless %s retries a 5xx and a lost reply",
  async (path) => {
    const result = { success: true, data: { answer: "found" } };
    const fake = await api((_, count) => {
      if (count === 1) return { status: 503, body: flat("internalError", true) };
      if (count === 2) return "drop";
      return { status: 200, body: result };
    });
    const call = createCaller({ baseUrl: fake.baseUrl, retryInitialDelayMs: 0 });
    await expect(call({ method: "POST", path, body: {} })).resolves.toEqual(result);
    expect(fake.received.map((request) => request.key)).toEqual([undefined, undefined, undefined]);
  },
);

test("a keyless signup poll does not replay a possibly collected key", async () => {
  const fake = await api(() => "drop");
  const client = clientFor(fake.baseUrl, { apiKey: undefined });
  await expect(client.signup.poll({ code: "claim" })).rejects.toMatchObject({
    outcomeUnknown: true,
  });
  expect(fake.received).toHaveLength(1);
});

test("a scrape that keeps no data retries a definite source failure", async () => {
  const result = { success: true, data: { markdown: "found" } };
  const fake = await api((_, count) => {
    if (count === 1) return { status: 504, body: flat("sourceTimeout", true) };
    if (count === 2) return { status: 503, body: flat("sourceUnavailable", true) };
    return { status: 200, body: result };
  });
  const page = await clientFor(fake.baseUrl).scrape({
    url: "https://a.test",
    zeroDataRetention: true,
  });
  expect(page.data.markdown).toBe("found");
  expect(fake.received).toHaveLength(3);
});

test("an ambiguous HTTP error on an unprotected write keeps its API error fields", async () => {
  const fake = await api(() => ({
    status: 504,
    body: flat("sourceTimeout", true, { retryAfterSeconds: 0 }),
    headers: { "x-request-id": "header-request-id", "retry-after": "120" },
  }));
  await expect(
    clientFor(fake.baseUrl).extract({
      urls: ["https://a.test"],
      prompt: "price",
      zeroDataRetention: true,
    }),
  ).rejects.toMatchObject({
    outcomeUnknown: true,
    status: 504,
    code: "sourceTimeout",
    retryable: true,
    requestId: "body-request-id",
    retryAfterSeconds: 0,
  });
  expect(fake.received).toHaveLength(1);
});

test("a write whose response body is lost still follows its replay policy", async () => {
  const received: (string | null)[] = [];
  const client = clientFor("https://fake.test", {
    fetch: async (_, init) => {
      received.push(new Headers(init?.headers).get("idempotency-key"));
      if (received.length === 2) return Response.json({ success: true, id: "job_1" });
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.error(new TypeError("response disconnected"));
          },
        }),
      );
    },
  });
  await expect(client.crawl({ url: "https://a.test" })).resolves.toMatchObject({ id: "job_1" });
  expect(received[0]).toBeString();
  expect(received[1]).toBe(received[0]);
  await expect(client.signup()).rejects.toMatchObject({ outcomeUnknown: true });
  expect(received).toHaveLength(3);
  expect(received[2]).toBeNull();
});

test("a browser task lookup uses its key and retries after a lost answer", async () => {
  const fake = await api((_, count) =>
    count === 1 ? "drop" : { status: 200, body: { success: true, data: { status: "done" } } },
  );
  await expect(clientFor(fake.baseUrl).browser.task.status({ id: "job_1" })).resolves.toMatchObject(
    { data: { status: "done" } },
  );
  expect(fake.received[0]?.key).toBeString();
  expect(fake.received[1]?.key).toBe(fake.received[0]?.key);
});

test("a crawl that times out is sent again with the same key and runs once", async () => {
  const jobs = acceptJobs(["hang"]);
  const fake = await api(jobs.answer);
  await clientFor(fake.baseUrl, { timeoutMs: 400 }).crawl({ url: "https://a.test" });
  expect(fake.received.length).toBe(2);
  expect(fake.received[1]?.key).toBe(fake.received[0]?.key);
  expect(jobs.charges.length).toBe(1);
});

test("a call still running on the server ends with an error that carries its key", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? "drop"
      : { status: 503, body: flat("internalError", true, { retryAfterSeconds: 0 }) },
  );
  const error = await clientFor(fake.baseUrl)
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(error).toMatchObject({ status: 503, code: "internalError", retryable: true });
  expect(error.message).toContain("may still complete");
  expect(error.details.idempotencyKey).toBe(fake.received[0]?.key);
  expect(fake.received.length).toBe(3);
});

test("an ordinary 5xx the server finished keeps its retryable and carries no key", async () => {
  const fake = await api(() => ({
    status: 504,
    body: flat("sourceTimeout", true, { retryAfterSeconds: 0 }),
  }));
  const error = await clientFor(fake.baseUrl)
    .search({ query: "x" })
    .catch((e) => e);
  expect(error).toMatchObject({ status: 504, code: "sourceTimeout", retryable: true, details: {} });
  expect(error.message).not.toContain("may still complete");
  expect(fake.received.length).toBe(3);
});

test("a busy 503 after a lost send retains the earlier send's recovery key", async () => {
  const fake = await api((_, count) =>
    count === 1 ? "drop" : { status: 503, body: flat("busy", true, { retryAfterSeconds: 0 }) },
  );
  const error = await clientFor(fake.baseUrl)
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(error).toMatchObject({
    code: "busy",
    retryable: true,
    outcomeUnknown: true,
    details: { idempotencyKey: fake.received[0]?.key },
  });
});

test("a crawl whose every attempt times out throws the same TimeoutError, with its key on it", async () => {
  const fake = await api(() => "hang");
  const error = await clientFor(fake.baseUrl, { timeoutMs: 50 })
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(error).toBeInstanceOf(DOMException);
  expect(error.name).toBe("TimeoutError");
  expect(error).not.toBeInstanceOf(StophyError);
  expect(error.idempotencyKey).toBe(fake.received[0]?.key);
  expect(fake.received.length).toBe(3);
});

test("a crawl the server took before it went away ends with its key on the refused error", async () => {
  const fake = await api(() => "drop-then-refuse");
  const error = await clientFor(fake.baseUrl)
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(error).toBeInstanceOf(TypeError);
  expect(error.code).toBe("ECONNREFUSED");
  expect(error.idempotencyKey).toBe(fake.received[0]?.key);
  expect(fake.received.length).toBe(1);
});

test("a call without an API key that times out is tried once, as before", async () => {
  const fake = await api(() => "hang");
  const error = await clientFor(fake.baseUrl, { apiKey: undefined, timeoutMs: 50 })
    .search({ query: "x" })
    .catch((e) => e);
  expect(error.name).toBe("TimeoutError");
  expect(error.idempotencyKey).toBeUndefined();
  expect(fake.received.length).toBe(1);
});

test("a refused connection is retried as before, and says nothing about a call that may have run", async () => {
  const fake = await fakeApi(() => "drop");
  const refused = fake.baseUrl;
  fake.close();
  const error = await clientFor(refused)
    .scrape({ url: "https://a.test", zeroDataRetention: true })
    .catch((e) => e);
  expect(error).not.toBeInstanceOf(StophyError);
  expect(fake.received.length).toBe(0);
});

test("reads carry no key and are retried after a lost answer", async () => {
  const fake = await api((_, count) =>
    count === 1 ? "drop" : { status: 200, body: { success: true, data: {} } },
  );
  await clientFor(fake.baseUrl).crawl.status({ id: "job_1" });
  expect(fake.received.map((received) => received.key)).toEqual([undefined, undefined]);
});

test("aborting during the wait between tries ends the call at once", async () => {
  const fake = await api(() => ({
    status: 429,
    body: flat("rateLimited", true, { retryAfterSeconds: 30 }),
  }));
  const controller = new AbortController();
  const client = clientFor(fake.baseUrl, {
    fetch: async (input, init) => {
      const answer = await fetch(input, init);
      const copy = new Response(await answer.text(), answer);
      setImmediate(() => controller.abort(new Error("stop")));
      return copy;
    },
  });
  const started = Date.now();
  await expect(client.search({ query: "x" }, { signal: controller.signal })).rejects.toThrow(
    "stop",
  );
  expect(Date.now() - started).toBeLessThan(2000);
  expect(fake.received.length).toBe(1);
});
