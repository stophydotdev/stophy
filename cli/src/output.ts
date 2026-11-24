import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { isAgentMode } from "./agent.js";
import { RequestError } from "./client.js";
import { CliError } from "./errors.js";
import type { OutputOptions } from "./types/api.js";

export function writeOutput(content: string, output?: string, silent = false) {
  if (output) {
    writeFile(output, content.endsWith("\n") ? content : `${content}\n`);
    if (!silent) console.error(`Output written to: ${output}`);
    return;
  }
  process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
}

function writeFile(path: string, content: string) {
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "write failed";
    throw new CliError(`Could not write ${path}: ${reason}`);
  }
}

export function handleOutput<Value>(value: Value, options: OutputOptions = {}) {
  const indent = isAgentMode() ? undefined : 2;
  writeOutput(
    JSON.stringify(value, null, indent) ?? "null",
    options.output,
    Boolean(options.output),
  );
}

export function written(stream: NodeJS.WriteStream, text: string): Promise<void> {
  return new Promise((resolve) => {
    stream.write(text, () => resolve());
  });
}

export function exitAfter(writes: readonly Promise<void>[], code: number): void {
  process.exitCode = code;
  void Promise.all(writes).then(() => process.exit(code));
}

export function writeFailure(error: CliError): Promise<void> {
  const failure =
    error instanceof RequestError
      ? error.failure
      : { code: "cliError", message: error.message, retryable: false };
  const { requestId, ...body } = failure;
  return written(process.stdout, `${JSON.stringify({ success: false, error: body, requestId })}\n`);
}

export function writeFailureMessage(error: CliError): Promise<void> {
  return written(process.stderr, `${error.message}\n`);
}
