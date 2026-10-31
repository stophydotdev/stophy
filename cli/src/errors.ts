export interface ErrorDetails {
  readonly status: number;
  readonly retryAfter?: string;
}

export class CliError extends Error {
  readonly details?: ErrorDetails;
  readonly exitCode: number;

  constructor(message: string, exitCode = 1, details?: ErrorDetails) {
    super(message);
    this.exitCode = exitCode;
    this.details = details;
    this.name = "CliError";
  }
}

export function statusFrom(error: CliError): number | undefined {
  return error.details?.status;
}

export function toCliError(cause: unknown): CliError {
  if (cause instanceof CliError) {
    return cause;
  }

  if (cause instanceof Error) {
    return new CliError(cause.message);
  }

  return new CliError("An unexpected error occurred.");
}
