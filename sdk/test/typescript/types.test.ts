import {
  Stophy,
  type ScrapeData,
  type ScrapeResponse,
  type StophyErrorCode,
} from "../../packages/typescript/src/index";

const client = new Stophy({ apiKey: "st_test" });

type Expect<T extends true> = T;
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type _ScrapeBody = Expect<Same<ScrapeData["body"], Parameters<Stophy["scrape"]>[0]>>;
type _ScrapeResponse = Expect<Same<ScrapeResponse, Awaited<ReturnType<Stophy["scrape"]>>>>;
type _FlatErrorCode = Expect<"apiKeyRequired" extends StophyErrorCode ? true : false>;

export async function typedCalls(): Promise<void> {
  const page = await client.scrape({ url: "https://example.com", formats: ["markdown"] });
  const markdown: string | undefined = page.data.markdown;
  if (markdown === "") throw new Error("unreachable");
  const mapped = await client.map({ url: "https://bun.sh" });
  const first: string | undefined = mapped.links[0]?.url;
  if (first === "") throw new Error("unreachable");
  const parsed = await client.parsed("google-maps", "https://www.google.com/maps/search/dentists", {
    minRating: 4.5,
  });
  void parsed.data.json;
  await client.crawl.cancel({ id: "job_1" });
  await client.extract.result({ id: "ext_1" });
  await client.logs({ days: 7 });
  await client.usage();

  // @ts-expect-error url is required
  await client.scrape({});
  // @ts-expect-error parsers are named by GET /v1/parsers
  await client.parsed("not-a-parser", "https://example.com");
  // @ts-expect-error cancel needs the job id
  await client.crawl.cancel({});
  // @ts-expect-error site endpoints are parsers now
  await client.youtube.search({ query: "bun" });
  // @ts-expect-error map answers with links, not data
  void mapped.data;
}
