import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { isAgentMode } from "./agent.js";
import { RequestError } from "./client.js";
import type { CliError } from "./errors.js";
import type { OutputOptions } from "./types/api.js";

export function writeOutput(content: string, output?: string, silent = false) {
  if (output) {
    const dir = dirname(output);
    if (dir) mkdirSync(dir, { recursive: true });
    writeFileSync(output, content.endsWith("\n") ? content : `${content}\n`, "utf8");
    if (!silent) console.error(`Output written to: ${output}`);
    return;
  }
  process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
}

export function handleOutput<Value>(value: Value, options: OutputOptions = {}) {
  const indent = isAgentMode() ? undefined : 2;
  writeOutput(
    JSON.stringify(value, null, indent) ?? "null",
    options.output,
    Boolean(options.output),
  );
}

export function writeFailure(error: CliError) {
  const failure =
    error instanceof RequestError
      ? error.failure
      : { code: "cliError", message: error.message, retryable: false };
  const { requestId, ...body } = failure;
  writeOutput(JSON.stringify({ success: false, error: body, requestId }));
}
