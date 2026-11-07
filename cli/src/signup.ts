import { z } from "zod";
import { agentName } from "./agent.js";
import { RequestError, request } from "./client.js";
import {
  type PendingSignup,
  assertConfigWritable,
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
  `Ask your person to open ${claimUrl} to approve this account. The link works until ${expiresAt}. Then run the same command again. Or set STOPHY_API_KEY.`;

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
  assertConfigWritable();
  const response = await request({
    method: "POST",
    path: "/v1/signup",
    accept: "application/json",
  });
  const parsed = started.safeParse(response.json);
  if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
  const pending = parsed.data.data;
  const config = await loadConfig();
  await saveConfig({ ...config, pendingSignups: [...(config.pendingSignups ?? []), pending] });
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
    if (!(error instanceof RequestError)) throw error;
    if (statusFrom(error) === 404) {
      return (await resolveRuntimeConfig()).apiKey ? "approved" : "gone";
    }
    if (error.failure.retryable) return "waiting";
    throw error;
  }
}

async function pollAll(list: readonly PendingSignup[]): Promise<PendingSignup[] | "approved"> {
  const open: PendingSignup[] = [];
  for (const pending of list) {
    const state = await collect(pending);
    if (state === "approved") return "approved";
    if (state === "waiting") open.push(pending);
  }
  if (open.length !== list.length) {
    await saveConfig({ ...(await loadConfig()), pendingSignups: open });
  }
  return open;
}

const LAST_WAIT_MS = 60_000;

const deadlineOf = (list: readonly PendingSignup[]) =>
  Math.max(
    Date.now() + LAST_WAIT_MS,
    ...list.map(({ expiresAt }) => Date.parse(expiresAt) + LAST_WAIT_MS).filter(Number.isFinite),
  );

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function ensureKey(): Promise<void> {
  let open = await pollAll((await loadConfig()).pendingSignups ?? []);
  if (open === "approved") return;
  if (process.env.CI) {
    throw new CliError(
      "No API key. Set STOPHY_API_KEY from your CI secrets. A signup needs a person to approve it.",
    );
  }
  const pending = open.at(-1) ?? (await startSignup());
  if (!canPrompt()) throw claimRequired(pending);

  process.stderr.write(waitMessage(pending));
  open = [...open.filter((entry) => entry !== pending), pending];
  const deadline = deadlineOf(open);
  while (open.length > 0 && Date.now() < deadline) {
    await sleep(POLL_MS);
    const result = await pollAll(open);
    if (result === "approved") return;
    open = result;
  }
  throw new CliError(
    "That link expired or was already used. Run the command again to get a new one.",
  );
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
