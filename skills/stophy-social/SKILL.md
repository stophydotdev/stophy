---
name: stophy-social
description: |
  Get posts, profiles, comments and threads from Reddit, Instagram, LinkedIn, Pinterest, Facebook, X and Threads. Use for "search Reddit for", "what does this profile post about", "read this thread's replies", "what is this company posting on LinkedIn", "find pins about", "what is this page posting on Facebook", "how many views did this X post get". Reddit search, X profiles and posts, and Pinterest pins work without an API key. For YouTube or TikTok videos use stophy-video. For ad libraries use stophy-ads. For LinkedIn job posts use stophy-jobs.
metadata:
  author: stophy
  version: "4.0.7"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy social

Search and read posts, profiles and threads on seven social platforms.

**Prerequisite:** the parsers marked "no key" work without a key, 50 calls a day, first page only. The rest need `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# no key needed: search Reddit, read an X post and profile, and a pin
stophy scrape "https://www.reddit.com/search/?q=bun+vs+node" --parser reddit-search --json -o .stophy/reddit.json
stophy scrape "https://x.com/NASA/status/2118041009766678695" --parser x-post
stophy scrape "https://x.com/nasa" --parser x-profile
stophy scrape "https://www.pinterest.com/pin/32088216099796013/" --parser pinterest-pin

# key needed: a subreddit's top posts, and one post with its comments
stophy scrape "https://www.reddit.com/r/programming/top/?t=week" --parser reddit-subreddit
stophy scrape "https://www.reddit.com/r/programming/comments/1xjiofl/how_curl_was_accidentally_turingcomplete_for_nine/" --parser reddit-post

# a profile, a company's posts, a page's latest posts
stophy scrape "https://www.instagram.com/natgeo/" --parser instagram-profile
stophy scrape "https://www.linkedin.com/in/satyanadella" --parser linkedin-profile
stophy scrape "https://www.linkedin.com/company/microsoft" --parser linkedin-posts
stophy scrape "https://www.facebook.com/NASA" --parser facebook-page --parserOptions '{"view":"posts"}'
stophy scrape "https://www.threads.com/@nasa" --parser threads-profile --parserOptions '{"view":"posts"}'
stophy scrape "https://www.pinterest.com/search/pins/?q=kitchen%20ideas" --parser pinterest-search
```

**Done when:** you quote the posts or replies that answer the question, with a link to the profile, post or thread.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `reddit-search` (no key) | reddit.com/search/?q=..., or a subreddit's search; add `type=sr` for communities, `type=user` for people | cursor |
| `reddit-subreddit` | reddit.com/r/name/, or /r/name/top/?t=week | cursor |
| `reddit-post` | a post page or a redd.it link | comment, sort, view: discussions, cursor |
| `reddit-user` | reddit.com/user/name, or its /comments tab | tab, sort, time, cursor |
| `reddit-subreddits` | reddit.com/subreddits/ | cursor |
| `x-profile` (no key) | x.com/handle | view: posts |
| `x-post` (no key) | x.com/handle/status/id | |
| `instagram-profile` | instagram.com/handle, or its /reels tab | cursor |
| `instagram-post`, `instagram-comments` | a post, reel or share link | cursor |
| `instagram-feed` | a hashtag, location or keyword page, like instagram.com/explore/tags/travel | cursor |
| `linkedin-profile` | linkedin.com/in/name | |
| `linkedin-company` | linkedin.com/company/name | |
| `linkedin-posts` | a profile or company page | cursor |
| `facebook-page` | facebook.com/name | view: posts |
| `facebook-post`, `facebook-comments` | a post, reel or video page, or an fb.watch link | cursor |
| `threads-profile` | threads.com/@handle | view: posts |
| `threads-post` | threads.com/@handle/post/code | cursor |
| `pinterest-search` | pinterest.com/search/pins/?q=... | cursor |
| `pinterest-pin` (no key) | a pin page or a pin.it link | |
| `pinterest-board`, `pinterest-profile` | pinterest.com/user/board/, pinterest.com/user/ | cursor |

## Tips

- Put Reddit's own sort and time in the page URL, like `?sort=top&t=month`.
- `reddit-post` returns the comments in `commentList`. For the other subreddits that shared the same link, send `--parserOptions '{"view":"discussions"}'`.
- `x-post` returns exact `likes`, `views`, `reposts` and `replies`. `x-profile` returns exact `followers` and `posts`.
- Every call here costs $0.0015, except `reddit-post`, which costs $0.0015 per 200 comments.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube, TikTok and Instagram videos and transcripts
- [stophy-jobs](../stophy-jobs/SKILL.md): LinkedIn job search
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries for Meta, Google, TikTok and LinkedIn
