import { afterEach, expect, test } from "bun:test";
import { Stophy } from "../../packages/typescript/src/index";
import type { JsonObject, JsonValue } from "../../packages/typescript/src/json";
import { fakeApi } from "./fake-api";

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

const accepted = {
  success: true,
  id: "job_1",
  url: "https://api.stophy.dev/v1/batch/scrape/job_1",
};

test("a batch whose answer was lost is accepted once, and the retry carries the same key", async () => {
  const jobs = new Map<string, JsonValue>();
  const fake = await api(({ key }, count) => {
    const job = jobs.get(key ?? "") ?? accepted;
    jobs.set(key ?? "", job);
    return count === 1 ? "drop" : { status: 200, body: job };
  });
  const client = new Stophy({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    maxRetries: 2,
    retryInitialDelayMs: 0,
  });
  await client.batch.scrape({ urls: ["https://a.test"] });
  expect(fake.received.length).toBe(2);
  expect(fake.received[0]?.key).toBeString();
  expect(fake.received[1]?.key).toBe(fake.received[0]?.key);
  expect(jobs.size).toBe(1);
});

test("two submits get two keys, and a key the caller sets is kept", async () => {
  const fake = await api(() => ({ status: 200, body: accepted }));
  const client = new Stophy({ apiKey: "k", baseUrl: fake.baseUrl });
  await client.crawl({ url: "https://a.test" });
  await client.crawl({ url: "https://a.test" });
  expect(fake.received[0]?.key).not.toBe(fake.received[1]?.key);
  const own = new Stophy({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    headers: { "Idempotency-Key": "mine" },
  });
  await own.crawl({ url: "https://a.test" });
  expect(fake.received[2]?.key).toBe("mine");
});

test("reads carry no key and are retried after a lost answer", async () => {
  const fake = await api((_, count) =>
    count === 1 ? "drop" : { status: 200, body: { success: true, data: {} } },
  );
  const client = new Stophy({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    maxRetries: 2,
    retryInitialDelayMs: 0,
  });
  await client.search({ query: "x" });
  expect(fake.received.map((r) => r.key)).toEqual([undefined, undefined]);
});

test("aborting during the wait between tries stops at once", async () => {
  const fake = await api(() => ({
    status: 429,
    body: flat("rateLimited", true, { retryAfterSeconds: 30 }),
  }));
  const client = new Stophy({ apiKey: "k", baseUrl: fake.baseUrl, maxRetries: 2 });
  const controller = new AbortController();
  const started = Date.now();
  const call = client.search({ query: "x" }, { signal: controller.signal });
  await fake.answered;
  controller.abort(new Error("stop"));
  await expect(call).rejects.toThrow("stop");
  expect(Date.now() - started).toBeLessThan(2000);
  expect(fake.received.length).toBe(1);
});
