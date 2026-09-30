---
name: stophy-social
description: |
  Get posts, profiles, and threads from Reddit, Instagram, X, Threads, Bluesky, Telegram, LinkedIn, and Pinterest. Use for "search Reddit for", "what does this profile post about", "read this thread's replies", "what is this company posting on LinkedIn", "find pins about". For YouTube or TikTok videos use stophy-video. For ad libraries use stophy-ads. For LinkedIn job posts use stophy-jobs.
metadata:
  author: stophy
  version: "4.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy social

Search and read posts, profiles, and threads on eight social platforms.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search Reddit, then read a subreddit or one post with its comments
stophy reddit search "bun vs node" --sort top --within month --json -o .stophy/reddit.json
stophy reddit subreddit rust --sort top --within week --json

# a profile's bio, stats, and a page of recent posts
stophy instagram profile natgeo --json -o .stophy/profile.json

# one post's text and stats
stophy x post "https://x.com/jack/status/20" --json

# a company's LinkedIn profile and posts
stophy linkedin company openai --json
stophy linkedin posts --company openai --limit 10 --json -o .stophy/li-posts.json

# pins on a topic
stophy pinterest search "kitchen ideas" --limit 25 --json -o .stophy/pins.json

# a public Telegram channel and its posts
stophy telegram posts durov --json
```

Run `stophy <source> --help` for every command. The sources are `reddit`, `instagram`, `x`, `threads`, `bluesky`, `telegram`, `linkedin`, and `pinterest`.

**Done when:** you quote the posts or replies that answer the question, with a link to the profile, post, or thread.

## Tips

- Most platforms follow one pattern. Use `profile` or `search` to find a person or topic, and `post` for one item with its replies. A profile returns a page of its recent posts. Use `--cursor` for the next page.
- Reddit costs 2 credits per call. Every other command here costs 1.
- `linkedin posts` takes `--profile <p>` for a person or `--company <c>` for a company.
- For replies to an Instagram comment, pass the comment's `repliesCursor` as `--comment` to `instagram comments`.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube and TikTok
- [stophy-jobs](../stophy-jobs/SKILL.md): LinkedIn job search
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries for Meta, LinkedIn, Pinterest, and more
