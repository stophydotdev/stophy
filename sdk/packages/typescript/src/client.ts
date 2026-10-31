import { type Logs, type LogsQuery, logs, type Usage, usage } from "./account";
import { bindSurface, type Surface } from "./generated/surface.gen";
import { type Caller, type CallOptions, createCaller, type FetchLike } from "./transport";

export interface StophyOptions {
  apiKey?: string;
  baseUrl?: string;
  fetch?: FetchLike;
  headers?: Record<string, string>;
  maxRetries?: number;
  retryInitialDelayMs?: number;
  timeoutMs?: number;
}

export type { CallOptions, FetchLike };

export type StophyClientInput = StophyOptions | string;

function env(name: string): string | undefined {
  return globalThis.process?.env[name];
}

export class Stophy {
  readonly #call: Caller;

  constructor(input: StophyClientInput = {}) {
    const options = input instanceof Object ? input : { apiKey: input };
    const apiKey = options.apiKey?.trim() || env("STOPHY_API_KEY")?.trim();
    this.#call = createCaller({
      ...options,
      apiKey,
      baseUrl: options.baseUrl ?? env("STOPHY_BASE_URL"),
    });
    Object.assign(this, bindSurface(this.#call));
  }

  usage(): Promise<Usage> {
    return usage(this.#call);
  }

  logs(query?: LogsQuery): Promise<Logs> {
    return logs(this.#call, query);
  }
}

export interface Stophy extends Surface {}
