import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { countTokens } from "gpt-tokenizer/encoding/o200k_base";

const root = join(import.meta.dir, "..");
const skip = new Set(["node_modules", "scripts", "images", "logo"]);
const guides = new Set(["AGENTS.md", "README.md", "STYLE.md"]);

function* pages(dir: string): Generator<string> {
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		if (skip.has(e.name)) continue;
		const p = join(dir, e.name);
		if (e.isDirectory()) yield* pages(p);
		else if (/\.mdx?$/.test(e.name) && !guides.has(e.name)) yield p;
	}
}

const rows = [...pages(root)].map((p) => {
	const path = relative(root, p);
	const parts = path.split("/");
	const section = parts.length === 1 ? "(root)" : parts.length > 2 && parts[0] === "scrape" ? `${parts[0]}/${parts[1]}` : parts[0];
	return { path, section, tokens: countTokens(readFileSync(p, "utf8")) };
});

if (process.argv.includes("--json")) {
	console.log(JSON.stringify(rows, null, 1));
} else if (process.argv.includes("--pages")) {
	for (const r of rows.sort((a, b) => b.tokens - a.tokens)) console.log(`${r.tokens}\t${r.path}`);
} else {
	const by = new Map<string, { pages: number; tokens: number }>();
	for (const r of rows) {
		const s = by.get(r.section) ?? { pages: 0, tokens: 0 };
		s.pages++;
		s.tokens += r.tokens;
		by.set(r.section, s);
	}
	console.log("| Section | Pages | Tokens |\n| --- | ---: | ---: |");
	for (const [k, v] of [...by].sort((a, b) => b[1].tokens - a[1].tokens)) console.log(`| ${k} | ${v.pages} | ${v.tokens} |`);
	console.log(`| **Total** | ${rows.length} | ${rows.reduce((n, r) => n + r.tokens, 0)} |`);
}
