import { afterEach, expect, test } from "bun:test";
import { Stophy } from "../../packages/typescript/src/index";
import { fakeApi } from "./fake-api";

const closers: (() => void)[] = [];
afterEach(() => closers.splice(0).forEach((close) => close()));

const api = async (...args: Parameters<typeof fakeApi>) => {
  const fake = await fakeApi(...args);
  closers.push(fake.close);
  return fake;
};

const page = (status: string, checkpoint: string, urls: string[] = []) => ({
  status: 200,
  body: {
    success: true,
    status,
    checkpoint,
    data: urls.map((url) => ({ metadata: { sourceURL: url }, markdown: url })),
  },
});

const clientFor = (baseUrl: string) =>
  new Stophy({ apiKey: "k", baseUrl, maxRetries: 0, retryInitialDelayMs: 0 });

const sentCheckpoints = (paths: string[]) =>
  paths.map((path) => new URL(path, "http://x").searchParams.get("checkpoint"));

async function collect<Item>(results: AsyncGenerator<Item, unknown>) {
  const items: Item[] = [];
  for await (const item of results) items.push(item);
  return items;
}

test("reads from ck_start and follows each returned checkpoint until the job ends", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa", ["https://a.test/"])
      : count === 2
        ? page("completed", "ck_bbbbbbbbbbbbbbbbbbbb", ["https://b.test/"])
        : page("completed", "ck_bbbbbbbbbbbbbbbbbbbb"),
  );
  const urls = (await collect(clientFor(fake.baseUrl).crawlResults("job_1"))).map(
    (item) => item.markdown,
  );
  expect(urls).toEqual(["https://a.test/", "https://b.test/"]);
  expect(fake.received.every(({ path }) => path.startsWith("/v1/crawl/job_1?"))).toBe(true);
  expect(sentCheckpoints(fake.received.map(({ path }) => path))).toEqual([
    "ck_start",
    "ck_aaaaaaaaaaaaaaaaaaaa",
    "ck_bbbbbbbbbbbbbbbbbbbb",
  ]);
});

test("batch results read the batch route", async () => {
  const fake = await api(() => page("completed", "ck_aaaaaaaaaaaaaaaaaaaa"));
  await collect(clientFor(fake.baseUrl).batchScrapeResults("job_2"));
  expect(fake.received[0]?.path.startsWith("/v1/batch/scrape/job_2?")).toBe(true);
});

test("at the live tail it waits and polls again with the same checkpoint", async () => {
  const idle = page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa");
  const fake = await api((_, count) =>
    count < 3
      ? idle
      : count === 3
        ? page("scraping", "ck_bbbbbbbbbbbbbbbbbbbb", ["https://a.test/"])
        : page("completed", "ck_bbbbbbbbbbbbbbbbbbbb"),
  );
  const items = await collect(clientFor(fake.baseUrl).crawlResults("job_1", { pollIntervalMs: 1 }));
  expect(items).toHaveLength(1);
  expect(sentCheckpoints(fake.received.map(({ path }) => path))).toEqual([
    "ck_start",
    "ck_aaaaaaaaaaaaaaaaaaaa",
    "ck_aaaaaaaaaaaaaaaaaaaa",
    "ck_bbbbbbbbbbbbbbbbbbbb",
  ]);
});

test("a reconnect resumes from the checkpoint the caller kept", async () => {
  const fake = await api(() => page("completed", "ck_bbbbbbbbbbbbbbbbbbbb"));
  await collect(
    clientFor(fake.baseUrl).crawlResults("job_1", { checkpoint: "ck_aaaaaaaaaaaaaaaaaaaa" }),
  );
  expect(sentCheckpoints(fake.received.map(({ path }) => path))).toEqual([
    "ck_aaaaaaaaaaaaaaaaaaaa",
  ]);
});

test("distinct records that share a final URL are all delivered", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? page("completed", "ck_aaaaaaaaaaaaaaaaaaaa", ["https://a.test/", "https://a.test/"])
      : page("completed", "ck_aaaaaaaaaaaaaaaaaaaa"),
  );
  expect(await collect(clientFor(fake.baseUrl).crawlResults("job_1"))).toHaveLength(2);
});

test("a failed or cancelled job still hands over its finished results, then ends", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? page("cancelled", "ck_aaaaaaaaaaaaaaaaaaaa", ["https://a.test/"])
      : page("cancelled", "ck_aaaaaaaaaaaaaaaaaaaa"),
  );
  const results = clientFor(fake.baseUrl).crawlResults("job_1");
  const seen: unknown[] = [];
  let next = await results.next();
  while (!next.done) {
    seen.push(next.value);
    next = await results.next();
  }
  expect(seen).toHaveLength(1);
  expect(next.value).toEqual({ status: "cancelled", checkpoint: "ck_aaaaaaaaaaaaaaaaaaaa" });
});

test("it reads one page at a time: stopping early asks for nothing more", async () => {
  const fake = await api(() =>
    page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa", ["https://a.test/", "https://b.test/"]),
  );
  const checkpoints: string[] = [];
  for await (const _ of clientFor(fake.baseUrl).crawlResults("job_1", {
    onCheckpoint: (checkpoint) => checkpoints.push(checkpoint),
  })) {
    break;
  }
  expect(fake.received).toHaveLength(1);
  expect(checkpoints).toEqual([]);
});

test("onCheckpoint fires only after the page's results were taken", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa", ["https://a.test/", "https://b.test/"])
      : page("completed", "ck_aaaaaaaaaaaaaaaaaaaa"),
  );
  const log: string[] = [];
  for await (const item of clientFor(fake.baseUrl).crawlResults("job_1", {
    onCheckpoint: (checkpoint) => log.push(`checkpoint ${checkpoint}`),
  })) {
    log.push(String(item.markdown));
  }
  expect(log.slice(0, 3)).toEqual([
    "https://a.test/",
    "https://b.test/",
    "checkpoint ck_aaaaaaaaaaaaaaaaaaaa",
  ]);
});

test("aborting the signal stops the wait", async () => {
  const controller = new AbortController();
  const fake = await api(() => {
    controller.abort(new Error("stop"));
    return page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa");
  });
  const error = await collect(
    clientFor(fake.baseUrl).crawlResults("job_1", {
      pollIntervalMs: 10_000,
      signal: controller.signal,
    }),
  ).catch((e) => e);
  expect(error).toMatchObject({ message: "stop" });
  expect(fake.received).toHaveLength(1);
});

test("gives up at the time limit and hands back the checkpoint to resume from", async () => {
  const fake = await api(() => page("scraping", "ck_aaaaaaaaaaaaaaaaaaaa"));
  const error = await collect(
    clientFor(fake.baseUrl).crawlResults("job_1", { pollIntervalMs: 5, timeoutMs: 20 }),
  ).catch((e) => e);
  expect(error).toMatchObject({
    code: "resultsTimeout",
    retryable: true,
    details: { checkpoint: "ck_aaaaaaaaaaaaaaaaaaaa" },
  });
});

test("an expired job raises the API's error with its request id", async () => {
  const fake = await api(() => ({
    status: 404,
    headers: { "x-request-id": "req-expired" },
    body: { success: false, error: "The job expired.", code: "notFound", retryable: false },
  }));
  const error = await collect(clientFor(fake.baseUrl).crawlResults("job_1")).catch((e) => e);
  expect(error).toMatchObject({ status: 404, code: "notFound", requestId: "req-expired" });
});

test("an answer with no checkpoint stops instead of replaying forever", async () => {
  const fake = await api(() => ({
    status: 200,
    body: { success: true, status: "scraping", data: [{ markdown: "x" }] },
  }));
  const error = await collect(clientFor(fake.baseUrl).crawlResults("job_1")).catch((e) => e);
  expect(error).toMatchObject({ code: "checkpointMissing" });
});
