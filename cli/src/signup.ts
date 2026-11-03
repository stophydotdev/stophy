import { z } from "zod";
import { agentName } from "./agent.js";
import { RequestError, request } from "./client.js";
import {
  type PendingSignup,
  loadConfig,
  resolveRuntimeConfig,
  saveConfig,
  setStoredApiKey,
} from "./config.js";
import { CliError, statusFrom } from "./errors.js";

const POLL_MS = 3000;
const NEEDS_KEY = new Set(["apiKeyRequired", "freeLimit"]);

const started = z.object({
  data: z.object({ claimUrl: z.string(), code: z.string(), expiresAt: z.string() }),
});

const collected = z.object({
  data: z.union([z.object({ apiKey: z.string() }), z.object({ status: z.literal("waiting") })]),
});

export const canPrompt = (): boolean => Boolean(process.stdin.isTTY) && agentName() === undefined;

const claimMessage = ({ claimUrl, expiresAt }: PendingSignup) =>
  `Ask your person to open ${claimUrl} to approve this account. The link works until ${expiresAt}. Then run the same command again.`;

const waitMessage = ({ claimUrl, expiresAt }: PendingSignup) =>
  `Open ${claimUrl} to approve this account. The link works until ${expiresAt}.\nWaiting for approval...\n`;

function claimRequired(pending: PendingSignup): RequestError {
  const message = claimMessage(pending);
  const { claimUrl, expiresAt } = pending;
  return new RequestError(message, {
    code: "claimRequired",
    message,
    retryable: true,
    claimUrl,
    expiresAt,
  });
}

async function startSignup(): Promise<PendingSignup> {
  const response = await request({
    method: "POST",
    path: "/v1/signup",
    accept: "application/json",
  });
  const parsed = started.safeParse(response.json);
  if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
  const pending = parsed.data.data;
  await saveConfig({ ...(await loadConfig()), pendingSignup: pending });
  return pending;
}

async function collect(pending: PendingSignup): Promise<"approved" | "waiting" | "gone"> {
  try {
    const response = await request({
      method: "POST",
      path: "/v1/signup/poll",
      body: { code: pending.code },
      accept: "application/json",
    });
    const parsed = collected.safeParse(response.json);
    if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
    if (!("apiKey" in parsed.data.data)) return "waiting";
    await setStoredApiKey(parsed.data.data.apiKey);
    return "approved";
  } catch (error) {
    if (error instanceof RequestError && statusFrom(error) === 404) return "gone";
    throw error;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ensureKey(): Promise<void> {
  let pending = (await loadConfig()).pendingSignup;
  if (pending) {
    const state = await collect(pending);
    if (state === "approved") return;
    if (state === "gone") pending = undefined;
  }
  pending ??= await startSignup();
  if (!canPrompt()) throw claimRequired(pending);

  process.stderr.write(waitMessage(pending));
  while (Date.parse(pending.expiresAt) > Date.now()) {
    await sleep(POLL_MS);
    const state = await collect(pending);
    if (state === "approved") return;
    if (state === "gone") break;
  }
  await saveConfig({ ...(await loadConfig()), pendingSignup: undefined });
  throw new CliError("The link expired. Run the command again to get a new one.");
}

export async function withSignup<Value>(send: () => Promise<Value>): Promise<Value> {
  try {
    return await send();
  } catch (error) {
    if (!(error instanceof RequestError) || !NEEDS_KEY.has(error.failure.code)) throw error;
    const { apiKey, sessionCookie } = await resolveRuntimeConfig();
    if (apiKey || sessionCookie) throw error;
    await ensureKey();
    return send();
  }
}
