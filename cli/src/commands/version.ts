import type { Command } from "commander";
import packageJson from "../../package.json" with { type: "json" };
import { resolveRuntimeConfig } from "../config.js";

export function registerVersionCommand(program: Command) {
  program
    .command("version")
    .description(
      "Show the CLI version and where its credentials come from. Run status to check them",
    )
    .option("--json", "Print raw JSON")
    .action(async (options) => {
      const { apiKey, apiKeySource, sessionCookie } = await resolveRuntimeConfig();
      const credentials = apiKey ? apiKeySource : sessionCookie ? "session" : "none";

      if (options.json) {
        console.log(JSON.stringify({ version: packageJson.version, credentials }, null, 2));
        return;
      }

      console.log(`version: ${packageJson.version}`);
      console.log(`credentials: ${credentials}`);
    });
}
