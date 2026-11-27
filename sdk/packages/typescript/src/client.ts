import type { RequestOptions } from "./bind";
import { endpointsFromOpenApi, parsersFromOpenApi } from "./catalog";
import type { ParserName } from "./generated/parsers.gen";
import { Surface } from "./generated/surface.gen";
import type {
  BatchScrapeStatusResponse,
  CrawlStatusResponse,
  ScrapeData,
  ScrapeResponse,
} from "./generated/types.gen";
import { checkpointResults, type ResultsEnd, type ResultsOptions } from "./results";
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
  readonly endpoints: (options?: RequestOptions) => ReturnType<typeof endpointsFromOpenApi>;
  readonly parsers: (options?: RequestOptions) => ReturnType<typeof parsersFromOpenApi>;
  constructor(input: StophyClientInput = {}) {
    const options = input instanceof Object ? input : { apiKey: input };
    const apiKey = options.apiKey?.trim() || env("STOPHY_API_KEY")?.trim();
    const call = createCaller({
      ...options,
      apiKey,
      baseUrl: options.baseUrl ?? env("STOPHY_BASE_URL"),
    });
    super(call);
    this.endpoints = (options) => endpointsFromOpenApi(call, options);
    this.parsers = (options) => parsersFromOpenApi(call, options);
  }

  crawlResults(
    id: string,
    options?: ResultsOptions,
  ): AsyncGenerator<NonNullable<CrawlStatusResponse["data"]>[number], ResultsEnd> {
    return checkpointResults(
      (checkpoint, call) => this.crawl.status({ id, checkpoint }, call),
      options,
    );
  }

  batchScrapeResults(
    id: string,
    options?: ResultsOptions,
  ): AsyncGenerator<NonNullable<BatchScrapeStatusResponse["data"]>[number], ResultsEnd> {
    return checkpointResults(
      (checkpoint, call) => this.batch.scrape.status({ id, checkpoint }, call),
      options,
    );
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
