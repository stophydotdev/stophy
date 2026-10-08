---
name: stophy-social
description: |
  Get posts, profiles, and threads from Reddit, Instagram, LinkedIn, and Pinterest. Use for "search Reddit for", "what does this profile post about", "read this thread's replies", "what is this company posting on LinkedIn", "find pins about". Reddit search works without an API key. For YouTube or TikTok videos use stophy-video. For ad libraries use stophy-ads. For LinkedIn job posts use stophy-jobs.
metadata:
  author: stophy
  version: "4.0.2"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy social

Search and read posts, profiles, and threads on four social platforms.

**Prerequisite:** `stophy reddit search` works without a key, within a free limit. Every other command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search Reddit, then read a subreddit or one post with its comments
stophy reddit search "bun vs node" --sort top --time pastMonth --json -o .stophy/reddit.json
stophy reddit subreddit rust --sort top --time pastWeek --json
stophy reddit post "https://www.reddit.com/r/rust/comments/abc123/example/" --json

# a profile's bio, stats, and a page of recent posts and reels
stophy instagram profile natgeo --json -o .stophy/profile.json

# a person's or company's LinkedIn profile and posts
stophy linkedin profile satyanadella --json
stophy linkedin company openai --json
stophy linkedin posts --companyId openai --json -o .stophy/li-posts.json

# pins on a topic, and a profile's pins
stophy pinterest search "kitchen ideas" --json -o .stophy/pins.json
stophy pinterest profile marthastewart --json
```

Run `stophy <source> --help` for every command. The sources are `reddit`, `instagram`, `linkedin`, and `pinterest`.

**Done when:** you quote the posts or replies that answer the question, with a link to the profile, post, or thread.

## Tips

- To point at one thing, give its link or its id, never both. Posts take `--postUrl` or `--postId` (Instagram: `--postCode`), people take `--userUrl` or `--username`, and LinkedIn takes `--profileUrl` or `--profileId`, or `--companyUrl` or `--companyId`.
- Use `profile` or `search` to find a person or topic, and `post` for one item with its replies. `reddit post` and `instagram post` return the replies in `results`. An Instagram profile returns its recent posts in `results`, and `posts` is its post count. When the output ends with a `cursor`, run the same command with `--cursor <cursor>` for the next page.
- `instagram profile` and `linkedin profile` cost 2 credits per call. Every other command here costs 1, including Reddit.
- `linkedin posts` takes one of `--profileUrl`, `--profileId`, `--companyUrl` or `--companyId`. It returns only the few posts LinkedIn shows publicly, with no next page.
- `reddit search` takes `--type` (`posts`, `subreddits` or `users`) and `--subreddit` to search inside one community. Page it with `--cursor`.
- For the replies to one Reddit comment, pass its id or link as `--comment` to `reddit post`. For replies to an Instagram comment, pass the comment's `commentId` as `--comment` to `instagram comments`.
- `reddit discussions` shows where else on Reddit one post's link was shared.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube, TikTok and Instagram videos
- [stophy-jobs](../stophy-jobs/SKILL.md): LinkedIn job search
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries for Meta, LinkedIn, Pinterest, and more
