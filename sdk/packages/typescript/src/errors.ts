import type { _Error } from "./generated/types.gen";
import type { JsonValue } from "./json";

export type StophyErrorCode = _Error["code"];

export class StophyError extends Error {
  readonly code?: string;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;
  readonly status: number;
  readonly requestId?: string;
  readonly details: Record<string, JsonValue>;
  declare readonly outcomeUnknown?: true;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string;
      retryable: boolean;
      retryAfterSeconds?: number;
      requestId?: string;
      details?: Record<string, JsonValue>;
    },
  ) {
    super(message);
    this.name = "StophyError";
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.requestId = options.requestId;
    this.details = options.details ?? {};
  }
}
