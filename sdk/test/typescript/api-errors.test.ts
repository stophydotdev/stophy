import { afterEach, expect, test } from "bun:test";
import { Stophy } from "../../packages/typescript/src/index";
import type { JsonObject } from "../../packages/typescript/src/json";
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

test("a permanent sourceChanged is tried once and keeps its code and request id", async () => {
  const fake = await api(() => ({ status: 502, body: flat("sourceChanged", false) }));
  const client = new Stophy({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    maxRetries: 3,
    retryInitialDelayMs: 0,
  });
  const error = await client.scrape({ url: "https://a.test" }).catch((e) => e);
  expect(fake.received.length).toBe(1);
  expect(error).toMatchObject({
    code: "sourceChanged",
    retryable: false,
    requestId: "body-request-id",
    status: 502,
  });
});

test("a profileBusy 409 is retryable and is sent again", async () => {
  const fake = await api((_, count) =>
    count === 1
      ? { status: 409, body: flat("profileBusy", true, { retryAfterSeconds: 0 }) }
      : { status: 200, body: { success: true, data: {} } },
  );
  const client = new Stophy({
    apiKey: "k",
    baseUrl: fake.baseUrl,
    maxRetries: 2,
    retryInitialDelayMs: 0,
  });
  await client.scrape({ url: "https://a.test" });
  expect(fake.received.length).toBe(2);
});

test("billing and signup fields of an error stay on details", async () => {
  const fake = await api(() => ({
    status: 402,
    body: flat("insufficientCredits", false, {
      requiredUsd: 0.5,
      availableUsd: 0.1,
      billingUrl: "https://stophy.dev/billing",
    }),
  }));
  const client = new Stophy({ apiKey: "k", baseUrl: fake.baseUrl });
  const error = await client.scrape({ url: "https://a.test" }).catch((e) => e);
  expect(error.details).toEqual({
    requiredUsd: 0.5,
    availableUsd: 0.1,
    billingUrl: "https://stophy.dev/billing",
  });
});

test("a legacy nested error still gives its code and retryability", async () => {
  const fake = await api(() => ({
    status: 503,
    body: { success: false, error: { code: "busy", message: "Busy.", retryable: true } },
  }));
  const client = new Stophy({ apiKey: "k", baseUrl: fake.baseUrl });
  const error = await client.scrape({ url: "https://a.test" }).catch((e) => e);
  expect(error).toMatchObject({ code: "busy", message: "Busy.", retryable: true });
});
