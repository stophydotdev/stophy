import { describe, expect, test } from "bun:test";
import { StophyError } from "../../packages/typescript/src/index";
import { makeClient } from "./helpers";

describe("error handling", () => {
  test("throws StophyError from the flat error body", async () => {
    const { client } = makeClient({
      status: 401,
      headers: { "x-request-id": "req_err" },
      json: { success: false, error: "Invalid API key", code: "unauthorized" },
    });
    const err = await client.scrape({ url: "https://example.com" }).catch((error) => error);
    expect(err).toBeInstanceOf(StophyError);
    expect(err.status).toBe(401);
    expect(err.code).toBe("unauthorized");
    expect(err.message).toBe("Invalid API key");
    expect(err.retryable).toBe(false);
    expect(err.requestId).toBe("req_err");
    expect(err.name).toBe("StophyError");
  });

  test("reads retryAfterSeconds from the body, then the header", async () => {
    const fromBody = makeClient({
      status: 429,
      json: { success: false, error: "slow down", code: "rateLimited", retryAfterSeconds: 9 },
    });
    const bodyError = await fromBody.client.usage().catch((error) => error);
    expect(bodyError.retryAfterSeconds).toBe(9);
    expect(bodyError.retryable).toBe(true);

    const fromHeader = makeClient({
      status: 429,
      headers: { "retry-after": "4" },
      json: { success: false, error: "slow down", code: "rateLimited" },
    });
    const headerError = await fromHeader.client.usage().catch((error) => error);
    expect(headerError.retryAfterSeconds).toBe(4);
  });

  test("falls back to a status message when the body is not JSON", async () => {
    const { client } = makeClient({ status: 502, raw: "bad gateway" });
    const err = await client.usage().catch((error) => error);
    expect(err).toBeInstanceOf(StophyError);
    expect(err.status).toBe(502);
    expect(err.message).toContain("502");
    expect(err.retryable).toBe(true);
  });
});
