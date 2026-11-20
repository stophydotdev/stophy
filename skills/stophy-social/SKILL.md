---
name: stophy-social
description: Use for posts, profiles, comments and threads on Reddit, X, Instagram, LinkedIn, Facebook, Threads, Bluesky and Pinterest, like "search Reddit for", "what does this account post", "read this thread's replies", "how many views did this post get".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy social

Setup, keys and errors: [stophy](../stophy/SKILL.md). Scrape the page a person would open, with the parser that reads it:

```bash
stophy scrape "https://www.reddit.com/search/?q=bun+vs+node" --parser reddit-search -o .stophy/reddit.json --json
stophy scrape "https://x.com/NASA/status/2118041009766678695" --parser x-post
stophy scrape "https://www.facebook.com/NASA" --parser facebook-page --parserOptions '{"view":"posts"}'
```

| Parser | Page |
|---|---|
| `reddit-search` (no key) | reddit.com/search/?q=..., or a subreddit's search. Add `type=sr` for communities, `type=user` for people |
| `reddit-subreddit`, `reddit-post`, `reddit-user`, `reddit-subreddits` | /r/name/ (or /r/name/top/?t=week), a post, /user/name, /subreddits/ |
| `x-profile`, `x-post`, `x-community` (no key) | x.com/handle, x.com/handle/status/id, x.com/i/communities/id |
| `instagram-profile`, `instagram-post`, `instagram-comments` | instagram.com/handle (or /reels), a post or reel |
| `instagram-feed` | a hashtag, place or keyword page, like instagram.com/explore/tags/travel |
| `linkedin-profile`, `linkedin-company`, `linkedin-posts` | linkedin.com/in/name, linkedin.com/company/name |
| `facebook-page`, `facebook-group`, `facebook-post`, `facebook-comments` | facebook.com/name, /groups/name, a post, reel or fb.watch link |
| `threads-profile`, `threads-post` | threads.com/@handle, a post |
| `bsky-profile`, `bsky-post` | bsky.app/profile/handle, a post |
| `pinterest-pin` (no key), `pinterest-search`, `pinterest-board`, `pinterest-profile` | a pin or pin.it link, /search/pins/?q=..., a board, a profile |
| `link-in-bio` | a Linktree, Komi, Linkbio or Linkme page |

- `--parserOptions '{"view":"posts"}'` returns the posts of an X, Facebook, Threads or Bluesky profile.
- Put Reddit's sort and time in the URL, like `?sort=top&t=month`. `reddit-post` returns its comments in `commentList`.
- `x-post` and `x-profile` return exact counts: likes, views, reposts, replies and followers.
- Prefer first-hand posts over summaries. Quote a post as a quote, with its link.

**Done when:** you quote the posts or replies that answer the question, each with its link.

## Price

$0.001 a call, except `reddit-post`: $0.001 per 200 comments.
