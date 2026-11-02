import { type Tool, tool } from "ai";
import { Stophy, type StophyClientInput } from "stophy";
import { z } from "zod";

export type { StophyClientInput };

type DataOf<Endpoint extends (...args: never[]) => Promise<{ data: object }>> = Awaited<
  ReturnType<Endpoint>
>["data"];

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

export function webSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof webSearchInput>, DataOf<Stophy["web"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Search the web. Returns ranked pages with title, url and description. Use readPage to get the full text of one.",
    inputSchema: webSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.web.search(input, { signal: abortSignal })).data,
  });
}

const readPageInput = z.object({
  url: z.string().describe("The page to read, such as https://bun.com/docs."),
});

export function readPage(
  options?: StophyClientInput,
): Tool<z.infer<typeof readPageInput>, DataOf<Stophy["web"]["scrape"]>> {
  const stophy = new Stophy(options);
  return tool({
    description: "Read a web page or PDF and return its text as markdown.",
    inputSchema: readPageInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.web.scrape(input, { signal: abortSignal })).data,
  });
}

const redditSearchInput = z.object({
  query: z.string().min(1).describe("Words to find."),
  subreddit: z.string().optional().describe("Only this subreddit, such as typescript."),
  sort: z.enum(["relevance", "hot", "top", "newest", "mostComments"]).optional(),
  time: z.enum(["pastHour", "today", "pastWeek", "pastMonth", "pastYear", "allTime"]).optional(),
});

export function redditSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof redditSearchInput>, DataOf<Stophy["reddit"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Search Reddit posts to read what people say about a product, place or topic. Returns posts with title, url, score and comment count.",
    inputSchema: redditSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.reddit.search(input, { signal: abortSignal })).data,
  });
}

const placeSearchInput = z.object({
  query: z.string().min(1).describe("What to find, such as coffee."),
  location: z.string().min(1).describe("Where, such as Austin, TX."),
  openNow: z.boolean().optional().describe("Only places open right now."),
});

export function placeSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof placeSearchInput>, DataOf<Stophy["google"]["maps"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Find places on Google Maps, such as restaurants, shops or clinics near a location. Returns name, address, rating, review count and hours.",
    inputSchema: placeSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.google.maps.search(input, { signal: abortSignal })).data,
  });
}

const productSearchInput = z.object({
  query: z.string().min(1).describe("What to buy, such as wireless earbuds."),
  maxPrice: z.number().positive().optional().describe("Highest price in the store's currency."),
  sort: z
    .enum(["relevance", "priceLow", "priceHigh", "avgCustomerReview", "newest", "bestSelling"])
    .optional(),
});

export function productSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof productSearchInput>, DataOf<Stophy["amazon"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description: "Search Amazon products. Returns title, price, rating, review count and url.",
    inputSchema: productSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.amazon.search(input, { signal: abortSignal })).data,
  });
}

const jobSearchInput = z.object({
  query: z.string().min(1).describe("Role or skill, such as data analyst."),
  location: z.string().optional().describe("City, region or postal code."),
  remote: z.enum(["remote", "hybrid"]).optional(),
  datePosted: z.enum(["last24Hours", "last3Days", "last7Days", "last14Days"]).optional(),
});

export function jobSearch(
  options?: StophyClientInput,
): Tool<z.infer<typeof jobSearchInput>, DataOf<Stophy["indeed"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Search job listings on Indeed. Returns title, company, location, salary when listed and url.",
    inputSchema: jobSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.indeed.search(input, { signal: abortSignal })).data,
  });
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
): Tool<z.infer<typeof homeSearchInput>, DataOf<Stophy["zillow"]["search"]>> {
  const stophy = new Stophy(options);
  return tool({
    description:
      "Search US homes for sale or rent on Zillow. Returns address, price, beds, baths, size and url.",
    inputSchema: homeSearchInput,
    execute: async (input, { abortSignal }) =>
      (await stophy.zillow.search(input, { signal: abortSignal })).data,
  });
}
