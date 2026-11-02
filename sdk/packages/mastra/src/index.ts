import { createTool } from "@mastra/core/tools";
import { Stophy, type StophyClientInput } from "stophy";
import { z } from "zod";

export type { StophyClientInput };

export const webSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-web-search",
    description:
      "Search the web. Returns ranked pages with title, url and description. Use stophy-read-page to get the full text of one.",
    inputSchema: z.object({
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
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.web.search(input, { signal: abortSignal })).data,
  });
};

export const readPageTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-read-page",
    description: "Read a web page or PDF and return its text as markdown.",
    inputSchema: z.object({
      url: z.string().describe("The page to read, such as https://bun.com/docs."),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.web.scrape(input, { signal: abortSignal })).data,
  });
};

export const redditSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-reddit-search",
    description:
      "Search Reddit posts to read what people say about a product, place or topic. Returns posts with title, url, score and comment count.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Words to find."),
      subreddit: z.string().optional().describe("Only this subreddit, such as typescript."),
      sort: z.enum(["relevance", "hot", "top", "newest", "mostComments"]).optional(),
      time: z
        .enum(["pastHour", "today", "pastWeek", "pastMonth", "pastYear", "allTime"])
        .optional(),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.reddit.search(input, { signal: abortSignal })).data,
  });
};

export const placeSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-place-search",
    description:
      "Find places on Google Maps, such as restaurants, shops or clinics near a location. Returns name, address, rating, review count and hours.",
    inputSchema: z.object({
      query: z.string().min(1).describe("What to find, such as coffee."),
      location: z.string().min(1).describe("Where, such as Austin, TX."),
      openNow: z.boolean().optional().describe("Only places open right now."),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.google.maps.search(input, { signal: abortSignal })).data,
  });
};

export const productSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-product-search",
    description: "Search Amazon products. Returns title, price, rating, review count and url.",
    inputSchema: z.object({
      query: z.string().min(1).describe("What to buy, such as wireless earbuds."),
      maxPrice: z.number().positive().optional().describe("Highest price in the store's currency."),
      sort: z
        .enum(["relevance", "priceLow", "priceHigh", "avgCustomerReview", "newest", "bestSelling"])
        .optional(),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.amazon.search(input, { signal: abortSignal })).data,
  });
};

export const jobSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-job-search",
    description:
      "Search job listings on Indeed. Returns title, company, location, salary when listed and url.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Role or skill, such as data analyst."),
      location: z.string().optional().describe("City, region or postal code."),
      remote: z.enum(["remote", "hybrid"]).optional(),
      datePosted: z.enum(["last24Hours", "last3Days", "last7Days", "last14Days"]).optional(),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.indeed.search(input, { signal: abortSignal })).data,
  });
};

export const homeSearchTool = (options?: StophyClientInput) => {
  const stophy = new Stophy(options);
  return createTool({
    id: "stophy-home-search",
    description:
      "Search US homes for sale or rent on Zillow. Returns address, price, beds, baths, size and url.",
    inputSchema: z.object({
      location: z.string().min(1).describe("City, ZIP code or neighborhood, such as Austin, TX."),
      status: z.enum(["forSale", "forRent", "sold"]).optional(),
      minPrice: z.number().nonnegative().optional().describe("Lowest price in US dollars."),
      maxPrice: z.number().nonnegative().optional().describe("Highest price in US dollars."),
      minBedrooms: z.number().int().nonnegative().optional(),
    }),
    execute: async (input, { abortSignal }) =>
      (await stophy.zillow.search(input, { signal: abortSignal })).data,
  });
};

export const stophyTools = (options?: StophyClientInput) => ({
  webSearch: webSearchTool(options),
  readPage: readPageTool(options),
  redditSearch: redditSearchTool(options),
  placeSearch: placeSearchTool(options),
  productSearch: productSearchTool(options),
  jobSearch: jobSearchTool(options),
  homeSearch: homeSearchTool(options),
});
