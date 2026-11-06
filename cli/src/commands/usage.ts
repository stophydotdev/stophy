import type { Command } from "commander";
import { formatBalance, limitsSchema, usageDataSchema } from "../account.js";
import { request } from "../client.js";
import { CliError } from "../errors.js";
import { handleOutput, writeOutput } from "../output.js";
import type { OutputOptions } from "../types/api.js";

export function registerUsageCommand(program: Command) {
  program
    .command("usage")
    .description("Show your balance and all-time usage")
    .option("--json", "Print raw JSON")
    .option("-o, --output <file>", "Write output to a file")
    .addHelpText(
      "after",
      `
Examples:
  $ stophy usage
  $ stophy usage --json
`,
    )
    .action(async (options: OutputOptions) => {
      const [usageResponse, limitsResponse] = await Promise.all([
        request({ method: "GET", path: "/v1/usage", accept: "application/json" }),
        request({ method: "GET", path: "/v1/limits", accept: "application/json" }),
      ]);
      const usage = usageDataSchema.safeParse(usageResponse.json);
      const limits = limitsSchema.safeParse(limitsResponse.json);
      if (!usage.success || !limits.success) {
        throw new CliError("Server returned an unexpected response shape.");
      }
      const account = { balanceCredits: limits.data.data.balanceCredits, ...usage.data };
      if (options.json || options.output) {
        handleOutput(account, options);
        return;
      }
      writeOutput(
        [
          `balance: ${formatBalance(account.balanceCredits)}`,
          `credits used (all time): ${account.creditsUsed}`,
          `requests (all time): ${account.requestCount}`,
        ].join("\n"),
      );
    });
}
