import { expect, test } from "bun:test";
import { anonymize, hideSearchLinks, money } from "./reference";

const person = { id: "8f", name: "Pat Lee", handle: "patlee", url: "https://x.example/patlee", avatarUrl: "https://cdn.example/a.jpg" };

test("anonymize replaces list authors but keeps the author of the page and the profile subject", () => {
  const post = { data: { json: { author: person, commentList: [{ author: person }] } } };
  expect(anonymize(post)).toEqual({
    data: { json: { author: person, commentList: [{ author: { id: "0", name: "Example user", handle: "example_user", url: "https://example.com/example_user", avatarUrl: null } }] } },
  });
  const profile = { handle: "patlee", recentPosts: [{ author: person }] };
  expect(anonymize(profile)).toEqual(profile);
});

test("anonymize replaces follower entries and reddit authors", () => {
  const reddit = { author: { ...person, url: "https://www.reddit.com/user/patlee/" } };
  expect(anonymize(reddit)).toEqual({ author: { id: "0", name: "Example user", handle: "example_user", url: "https://example.com/example_user", avatarUrl: null } });
  expect(anonymize({ results: [{ ...person, followers: 3, bio: "hi" }] })).toEqual({
    results: [{ id: "0", name: "Example user", handle: "example_user", url: "https://example.com/example_user", avatarUrl: null, followers: 3, bio: null }],
  });
});

test("hideSearchLinks replaces image fields and redirect wrappers and keeps plain links", () => {
  const answer = {
    imageUrl: "https://cdn.test/a.png",
    thumbnailUrl: "https://cdn.test/t.png",
    link: "https://tracker.test/r?u=https%3A%2F%2Fnews.test%2Fa",
    url: "https://news.test/a?page=2",
  };
  expect(hideSearchLinks({ news: [answer] })).toEqual({
    news: [{ imageUrl: "https://example.com/", thumbnailUrl: "https://example.com/", link: "https://example.com/", url: "https://news.test/a?page=2" }],
  });
});

test("money writes cents on one-decimal prices and leaves the rest alone", () => {
  expect(money("adds $2.5 per 1,000 pages and $0.5 per page, $0.001 each, $3 flat, $0.24 per hour")).toBe(
    "adds $2.50 per 1,000 pages and $0.50 per page, $0.001 each, $3 flat, $0.24 per hour",
  );
});
