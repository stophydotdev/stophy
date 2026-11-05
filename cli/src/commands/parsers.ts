import type { Command } from "commander";
import { z } from "zod";
import { request } from "../client.js";
import { CliError } from "../errors.js";
import { handleOutput, writeOutput } from "../output.js";
import type { OutputOptions } from "../types/api.js";

const parsersSchema = z.object({
  data: z.object({
    parsers: z.array(z.looseObject({ name: z.string(), takes: z.string(), example: z.string() })),
  }),
});

export function registerParsersCommand(program: Command) {
  program
    .command("parsers")
    .description("List the parsers that scrape --parser reads a site with")
    .argument("[term]", "Only show parsers that contain this text")
    .option("--json", "Print raw JSON")
    .option("-o, --output <file>", "Write output to a file")
    .addHelpText(
      "after",
      `
Examples:
  $ stophy parsers reddit
  $ stophy scrape "https://www.reddit.com/search/?q=bun" --parser reddit-search
`,
    )
    .action(async (term: string | undefined, options: OutputOptions) => {
      const response = await request({
        method: "GET",
        path: "/v1/parsers",
        accept: "application/json",
      });
      const parsed = parsersSchema.safeParse(response.json);
      if (!parsed.success) throw new CliError("Server returned an unexpected response shape.");
      const query = term?.trim().toLowerCase() ?? "";
      const parsers = parsed.data.data.parsers.filter((parser) => parser.name.includes(query));
      if (options.json || options.output) {
        handleOutput(parsers, options);
        return;
      }
      if (parsers.length === 0) {
        writeOutput(`No parsers match \`${term?.trim()}\`.`);
        return;
      }
      writeOutput(
        parsers
          .map((parser) => `${parser.name}\n  ${parser.takes}\n  ${parser.example}`)
          .join("\n"),
      );
    });
}
