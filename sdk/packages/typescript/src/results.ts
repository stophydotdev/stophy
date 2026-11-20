import { StophyError } from "./errors";
import type { CallOptions } from "./transport";

const START = "ck_start";
const ENDED = new Set(["completed", "failed", "cancelled"]);
const DEFAULT_POLL_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 15 * 60_000;

export interface ResultsOptions {
  checkpoint?: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
  onCheckpoint?: (checkpoint: string) => void;
}

export interface ResultsEnd {
  status: string;
  checkpoint: string;
}

interface StatusPage<Item> {
  status: string;
  checkpoint?: string;
  data?: Item[];
}

export type ReadPage<Item> = (checkpoint: string, call: CallOptions) => Promise<StatusPage<Item>>;

export async function* checkpointResults<Item>(
  readPage: ReadPage<Item>,
  options: ResultsOptions = {},
): AsyncGenerator<Item, ResultsEnd> {
  const { signal, onCheckpoint } = options;
  const pollMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
  const deadline = Date.now() + (options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let checkpoint = options.checkpoint ?? START;

  for (;;) {
    signal?.throwIfAborted();
    const page = await readPage(checkpoint, { signal });
    if (page.checkpoint === undefined) {
      throw new StophyError("The job's answer carried no checkpoint to resume from.", {
        status: 0,
        code: "checkpointMissing",
        retryable: false,
      });
    }
    const results = page.data ?? [];
    yield* results;
    checkpoint = page.checkpoint;
    onCheckpoint?.(checkpoint);
    if (results.length > 0) continue;
    if (ENDED.has(page.status)) return { status: page.status, checkpoint };
    if (Date.now() + pollMs > deadline) {
      throw new StophyError("Gave up waiting for more results. Resume with the checkpoint.", {
        status: 0,
        code: "resultsTimeout",
        retryable: true,
        details: { checkpoint },
      });
    }
    await sleep(pollMs, signal);
  }
}

function sleep(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
