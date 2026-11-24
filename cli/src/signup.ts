import { z } from "zod";
import { agentName } from "./agent.js";
import {
  type Failure,
  RequestError,
  request,
  unexpectedResponse,
  withRequestId,
} from "./client.js";
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

const started = z.object({
  data: z.object({ claimUrl: z.string(), code: z.string(), expiresAt: z.string() }),
});

const collected = z.object({ data: z.object({ apiKey: z.string().optional() }) });

export const canPrompt = (): boolean => Boolean(process.stdin.isTTY) && agentName() === undefined;

const claimMessage = ({ claimUrl, expiresAt }: PendingSignup) =>
  `Ask your person to open ${claimUrl} to approve this account. The link works until ${expiresAt}. Then run the same command again. Or set STOPHY_API_KEY.`;

const waitMessage = ({ claimUrl, expiresAt }: PendingSignup) =>
  `Open ${claimUrl} to approve this account. The link works until ${expiresAt}.\nWaiting for approval...\n`;

function withReason(refusal: RequestError | undefined, failure: Failure): RequestError {
  const message = [refusal?.failure.message, failure.message].filter(Boolean).join(" ");
  const requestId = refusal?.failure.requestId;
  return new RequestError(
    withRequestId(message, requestId ?? null),
    { ...failure, message, requestId },
    refusal?.details,
  );
}

const claimRequired = (pending: PendingSignup, refusal?: RequestError) =>
  withReason(refusal, {
    code: "claimRequired",
    message: claimMessage(pending),
    retryable: true,
    claimUrl: pending.claimUrl,
    expiresAt: pending.expiresAt,
  });

const NO_KEY = "Set STOPHY_API_KEY. A signup needs a person to approve it.";

async function startSignup(): Promise<PendingSignup> {
  assertConfigWritable();
  const response = await request({
    method: "POST",
    path: "/v1/signup",
    accept: "application/json",
  });
  const parsed = started.safeParse(response.json);
  if (!parsed.success) throw unexpectedResponse(response);
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
    if (!parsed.success) throw unexpectedResponse(response);
    const { apiKey } = parsed.data.data;
    if (apiKey === undefined) return "waiting";
    await setStoredApiKey(apiKey);
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

export async function ensureKey(refusal?: RequestError): Promise<void> {
  let open = await pollAll((await loadConfig()).pendingSignups ?? []);
  if (open === "approved") return;
  if (process.env.CI) {
    if (!refusal) throw new CliError(`No API key. ${NO_KEY}`);
    throw withReason(refusal, { ...refusal.failure, message: NO_KEY });
  }
  const pending = open.at(-1) ?? (await startSignup());
  if (!canPrompt()) throw claimRequired(pending, refusal);

  if (refusal) process.stderr.write(`${refusal.failure.message}\n`);
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
    if (!(error instanceof RequestError) || error.failure.code !== "apiKeyRequired") throw error;
    const { apiKey, sessionCookie } = await resolveRuntimeConfig();
    if (apiKey || sessionCookie) throw error;
    await ensureKey(error);
    return send();
  }
}
