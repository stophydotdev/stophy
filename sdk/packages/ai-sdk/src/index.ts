import { type Tool, tool } from "ai";
import { type ParserName, type ParserOptions, Stophy, type StophyClientInput } from "stophy";
import { z } from "zod";

export type { StophyClientInput };

type DataOf<Endpoint extends (...args: never[]) => Promise<{ data?: object }>> = Awaited<
  ReturnType<Endpoint>
>["data"];

type SiteData = DataOf<Stophy["parsed"]>["json"];

interface SitePage {
  url: string;
  options?: ParserOptions;
}

function siteTool<Input extends z.ZodType>(
  options: StophyClientInput | undefined,
  description: string,
  inputSchema: Input,
  parser: ParserName,
  pageOf: (input: z.infer<Input>) => SitePage,
): Tool<z.infer<Input>, SiteData> {
  const stophy = new Stophy(options);
  return tool({
    description,
    inputSchema,
    execute: async (input: z.infer<Input>, { abortSignal }) => {
      const page = pageOf(input);
      const reply = await stophy.parsed(parser, page.url, page.options, { signal: abortSignal });
      return reply.data.json;
    },
  });
}

function withParams(base: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.href;
}

function definedOptions(
  values: Record<string, ParserOptions[string] | undefined>,
): ParserOptions | undefined {
  const defined: ParserOptions = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) defined[key] = value;
  }
  return Object.keys(defined).length > 0 ? defined : undefined;
}

const webSearchInput = z.object({
  query: z.string().min(1).max(400).describe("What to search for."),
  limit: z.number().int().min(1).max(100).optional().describe("Most results to return."),
  time: z
    .enum(["pastWeek", "pastMonth", "pastYear"])
    .optional()
    .describe("Only pages from this period. Leave out for any time."),
  includeDomains: z
    .array(z.string())
    .max(10)
    .optional()
    .describe("Only pages from these sites, such as reddit.com."),
});

const PERIODS = { pastWeek: "qdr:w", pastMonth: "qdr:m", pastYear: "qdr:y" } as const;

export function webSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof webSearchInput>, DataOf<Stophy["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Search the web. Returns ranked pages with title, url and description. Use readPage to get the full text of one.",
    inputSchema: webSearchInput,
    execute: async ({ time, ...input }, { abortSignal }) =>
      (
        await stophy.search(
          { ...input, tbs: time === undefined ? undefined : PERIODS[time] },
          { signal: abortSignal },
        )
      ).data,
  });
}

const readPageInput = z.object({
  url: z.string().describe("The page to read, such as https://bun.com/docs."),
});

export function readPage(
  options?: StophyClientInput,
): Tool<z.infer<typeof readPageInput>, DataOf<Stophy["scrape"]>> {
  const stophy = new Stophy(options);
  return tool({
    description: "Read a web page or PDF and return its text as markdown.",
    inputSchema: readPageInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.scrape({ ...input, formats: ["markdown"] }, { signal: abortSignal })).data,
  });
}

const redditSearchInput = z.object({
  query: z.string().min(1).describe("Words to find."),
  subreddit: z.string().optional().describe("Only this subreddit, such as typescript."),
  sort: z.enum(["relevance", "hot", "top", "newest", "mostComments"]).optional(),
  time: z.enum(["pastHour", "today", "pastWeek", "pastMonth", "pastYear", "allTime"]).optional(),
});

const REDDIT_SORTS = {
  relevance: "relevance",
  hot: "hot",
  top: "top",
  newest: "new",
  mostComments: "comments",
} as const;

const REDDIT_TIMES = {
  pastHour: "hour",
  today: "day",
  pastWeek: "week",
  pastMonth: "month",
  pastYear: "year",
  allTime: "all",
} as const;

export function redditSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof redditSearchInput>, SiteData> {
  return siteTool(
    options,
    "Search Reddit posts to read what people say about a product, place or topic. Returns posts with title, url, score and comment count.",
    redditSearchInput,
    "reddit-search",
    ({ query, subreddit, sort, time }) => ({
      url: withParams("https://www.reddit.com/search/", {
        q: query,
        sort: sort === undefined ? undefined : REDDIT_SORTS[sort],
        t: time === undefined ? undefined : REDDIT_TIMES[time],
      }),
      options: definedOptions({ subreddit }),
    }),
  );
}

const placeSearchInput = z.object({
  query: z.string().min(1).describe("What to find, such as coffee."),
  location: z.string().min(1).describe("Where, such as Austin, TX."),
  openNow: z.boolean().optional().describe("Only places open right now."),
});

export function placeSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof placeSearchInput>, SiteData> {
  return siteTool(
    options,
    "Find places on Google Maps, such as restaurants, shops or clinics near a location. Returns name, address, rating, review count and hours.",
    placeSearchInput,
    "google-maps",
    ({ query, location, openNow }) => ({
      url: `https://www.google.com/maps/search/${encodeURIComponent(`${query} in ${location}`)}`,
      options: definedOptions({ openNow }),
    }),
  );
}

const productSearchInput = z.object({
  query: z.string().min(1).describe("What to buy, such as wireless earbuds."),
  maxPrice: z.number().positive().optional().describe("Highest price in the store's currency."),
  sort: z
    .enum(["relevance", "priceLow", "priceHigh", "avgCustomerReview", "newest", "bestSelling"])
    .optional(),
});

const AMAZON_SORTS = {
  relevance: undefined,
  priceLow: "price-asc-rank",
  priceHigh: "price-desc-rank",
  avgCustomerReview: "review-rank",
  newest: "date-desc-rank",
  bestSelling: "exact-aware-popularity-rank",
} as const;

export function productSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof productSearchInput>, SiteData> {
  return siteTool(
    options,
    "Search Amazon products. Returns title, price, rating, review count and url.",
    productSearchInput,
    "amazon-search",
    ({ query, maxPrice, sort }) => ({
      url: withParams("https://www.amazon.com/s", {
        k: query,
        "high-price": maxPrice,
        s: sort === undefined ? undefined : AMAZON_SORTS[sort],
      }),
    }),
  );
}

const jobSearchInput = z.object({
  query: z.string().min(1).describe("Role or skill, such as data analyst."),
  location: z.string().optional().describe("City, region or postal code."),
  remote: z.enum(["remote", "hybrid"]).optional(),
  datePosted: z.enum(["last24Hours", "last3Days", "last7Days", "last14Days"]).optional(),
});

export function jobSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof jobSearchInput>, SiteData> {
  return siteTool(
    options,
    "Search job listings on Indeed. Returns title, company, location, salary when listed and url.",
    jobSearchInput,
    "indeed-search",
    ({ query, location, remote, datePosted }) => ({
      url: withParams("https://www.indeed.com/jobs", { q: query, l: location }),
      options: definedOptions({ remote, datePosted }),
    }),
  );
}

const homeSearchInput = z.object({
  location: z.string().min(1).describe("City, ZIP code or neighborhood, such as Austin, TX."),
  status: z.enum(["forSale", "forRent", "sold"]).optional(),
  minPrice: z.number().nonnegative().optional().describe("Lowest price in US dollars."),
  maxPrice: z.number().nonnegative().optional().describe("Highest price in US dollars."),
  minBedrooms: z.number().int().nonnegative().optional(),
});

export function homeSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof homeSearchInput>, SiteData> {
  return siteTool(
    options,
    "Search US homes for sale or rent on Zillow. Returns address, price, beds, baths, size and url.",
    homeSearchInput,
    "zillow-search",
    ({ location, ...filters }) => ({
      url: `https://www.zillow.com/homes/${encodeURIComponent(location.replaceAll(" ", "-"))}_rb/`,
      options: definedOptions(filters),
    }),
  );
}
