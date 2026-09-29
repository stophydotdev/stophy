---
name: stophy-social
description: |
  Get posts, profiles, and threads from Reddit, Instagram, X, Threads, Bluesky, Mastodon, Telegram, LinkedIn, Pinterest, Tumblr, Snapchat, and Quora. Use for "search Reddit for", "what does this profile post about", "read this thread's replies", "what is this company posting on LinkedIn", "find pins about", "read this Quora answer". For YouTube, TikTok, or Kick videos use stophy-video. For ad libraries use stophy-ads. For LinkedIn job posts use stophy-jobs.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy social

Search and read posts, profiles, and threads on a dozen social platforms.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# search Reddit
stophy reddit search "bun vs node" --sort top --within month -o .stophy/reddit.md

# a profile's bio, stats, and recent posts
stophy instagram profile natgeo -o .stophy/profile.md

# one post's text and stats
stophy x tweet "https://x.com/jack/status/20" -o .stophy/tweet.md

# a company's LinkedIn posts
stophy linkedin company posts openai --limit 10 -o .stophy/li-posts.md

# pins on a topic
stophy pinterest search "kitchen ideas" --limit 25 -o .stophy/pins.md

# a question and its answers
stophy quora question "https://www.quora.com/What-is-the-best-way-to-learn-programming" -o .stophy/quora.md
```

Run `stophy <source> --help` for every command. The sources are `reddit`, `instagram`, `x`, `threads`, `bluesky`, `mastodon`, `telegram`, `linkedin`, `pinterest`, `tumblr`, `snapchat`, and `quora`.

**Done when:** you quote the posts or replies that answer the question, with a link to the profile, post, or thread.

## Tips

- Most platforms follow one pattern. Use `profile` or `search` to find a person or topic, `posts` for a feed, and `post` for one item with its replies.
- `linkedin posts` takes `--profile <p>` for a person or `--company <c>` for a company. `linkedin company posts <company>` is the shortcut for a company.

## See also

- [stophy-video](../stophy-video/SKILL.md): YouTube, TikTok, and Kick
- [stophy-jobs](../stophy-jobs/SKILL.md): LinkedIn job search
- [stophy-ads](../stophy-ads/SKILL.md): ad libraries for Meta, LinkedIn, Pinterest, Snapchat, and more
