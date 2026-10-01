---
name: stophy-social
description: |
  Get posts, profiles, and threads from Reddit, Instagram, LinkedIn, and Pinterest. Use for "search Reddit for", "what does this profile post about", "read this thread's replies", "what is this company posting on LinkedIn", "find pins about". For YouTube or TikTok videos use stophy-video. For ad libraries use stophy-ads. For LinkedIn job posts use stophy-jobs.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy social

Search and read posts, profiles, and threads on four social platforms.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search Reddit, then read a subreddit or one post with its comments
stophy reddit search "bun vs node" --sort top --within month --json -o .stophy/reddit.json
stophy reddit subreddit rust --sort top --within week --json

# a profile's bio, stats, and a page of recent posts
stophy instagram profile natgeo --json -o .stophy/profile.json

# a company's LinkedIn profile and posts
stophy linkedin company openai --json
stophy linkedin posts --company openai --limit 10 --json -o .stophy/li-posts.json

# pins on a topic
stophy pinterest search "kitchen ideas" --limit 25 --json -o .stophy/pins.json
```

Run `stophy <source> --help` for every command. The sources are `reddit`, `instagram`, `linkedin`, and `pinterest`.

**Done when:** you quote the posts or replies that answer the question, with a link to the profile, post, or thread.

## Tips

- Use `profile` or `search` to find a person or topic, and `post` for one item with its replies. An Instagram profile returns its recent posts in `results`, and `posts` is its post count. Use `--limit` and `--cursor` for the next page.
- `instagram profile` costs 2 credits per call. Every other command here costs 1, including Reddit.
- `linkedin posts` takes `--profile <p>` for a person or `--company <c>` for a company. It returns only the few posts LinkedIn shows publicly.
- `reddit search --type users` returns one page and no cursor.
- For replies to an Instagram comment, pass the comment's `repliesCursor` as `--comment` to `instagram comments`.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok
- [stophy-jobs](../stophy-jobs/SKILL.md): LinkedIn job search
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries for Meta, LinkedIn, Pinterest, and more
