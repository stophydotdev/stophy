import type { RequestOptions } from "./bind";
import type { ParserName } from "./generated/parsers.gen";
import { Surface } from "./generated/surface.gen";
import type { ScrapeData, ScrapeResponse } from "./generated/types.gen";
import { type CallOptions, createCaller, type FetchLike } from "./transport";

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

type JsonFormat = Extract<NonNullable<ScrapeData["body"]["formats"]>[number], { type: "json" }>;

export type ParserOptions = NonNullable<JsonFormat["options"]>;

function env(name: string): string | undefined {
  return globalThis.process?.env[name];
}

export class Stophy extends Surface {
  constructor(input: StophyClientInput = {}) {
    const options = input instanceof Object ? input : { apiKey: input };
    const apiKey = options.apiKey?.trim() || env("STOPHY_API_KEY")?.trim();
    const call = createCaller({
      ...options,
      apiKey,
      baseUrl: options.baseUrl ?? env("STOPHY_BASE_URL"),
    });
    super(call);
  }

  parsed(
    parser: ParserName,
    url: string,
    options?: ParserOptions,
    request?: RequestOptions,
  ): Promise<ScrapeResponse> {
    return this.scrape({ url, formats: [{ type: "json", parser, options }] }, request);
  }
}
