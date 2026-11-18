import { afterEach, expect, test } from "bun:test";
import { Stophy, StophyError, type StophyOptions } from "../../packages/typescript/src/index";
import type { JsonObject } from "../../packages/typescript/src/json";
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

test("every POST carries a fresh key, and the same key on each retry of one call", async () => {
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

test("a key set in the client headers never joins two calls", async () => {
  const jobs = acceptJobs([]);
  const fake = await api(jobs.answer);
  const client = clientFor(fake.baseUrl, { headers: { "Idempotency-Key": "mine" } });
  const first = await client.crawl({ url: "https://a.test" });
  const second = await client.crawl({ url: "https://a.test" });
  expect([first, second]).toMatchObject([{ id: "job_1" }, { id: "job_2" }]);
  expect(fake.received.map((received) => received.key)).not.toContain("mine");
});

test("a charged call that keeps no data is not sent again after a lost answer", async () => {
  const jobs = acceptJobs();
  const fake = await api(jobs.answer);
  const error = await clientFor(fake.baseUrl)
    .scrape({ url: "https://a.test", zeroDataRetention: true })
    .catch((e) => e);
  expect(error).toBeInstanceOf(StophyError);
  expect(error.code).toBe("outcomeUnknown");
  expect(fake.received.length).toBe(1);
});

test("a crawl that times out is sent again with the same key and runs once", async () => {
  const jobs = acceptJobs(["hang"]);
  const fake = await api(jobs.answer);
  await clientFor(fake.baseUrl, { timeoutMs: 100 }).crawl({ url: "https://a.test" });
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
  expect(error).toMatchObject({ status: 503, code: "internalError", retryable: false });
  expect(error.message).toContain("may still complete");
  expect(error.details.idempotencyKey).toBe(fake.received[0]?.key);
  expect(fake.received.length).toBe(3);
});

test("a first answer of 503 internalError, or a busy 503, is not marked as possibly running", async () => {
  const first = await api(() => ({ status: 503, body: flat("internalError", true) }));
  const error = await clientFor(first.baseUrl, { maxRetries: 0 })
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(error.details).toEqual({});
  const busy = await api(() => ({
    status: 503,
    body: flat("busy", true, { retryAfterSeconds: 0 }),
  }));
  const busyError = await clientFor(busy.baseUrl)
    .crawl({ url: "https://a.test" })
    .catch((e) => e);
  expect(busyError.details).toEqual({});
  expect(busyError.retryable).toBe(true);
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
