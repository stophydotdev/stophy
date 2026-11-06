---
name: stophy-job-postings
description: |
  Find open roles across LinkedIn, Indeed, Upwork and company job boards, read the full postings, and add what the company pays. Use for "find remote React jobs posted this week", "who is hiring for this role in Austin", "what roles is this company hiring for", "what does this company pay engineers", "find freelance gigs for". For a quick look at one site's jobs, stophy-jobs lists every jobs parser. For a company's posts, not its jobs, use stophy-social.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy job postings

Search every job board, then read the roles that fit.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Every jobs parser needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# 1. search the boards: LinkedIn (past week), Indeed, Upwork
stophy scrape "https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=United%20States&f_TPR=r604800" --parser linkedin-jobs --json -o .stophy/linkedin.json
stophy scrape "https://www.indeed.com/jobs?q=nurse&l=Austin%2C+TX" --parser indeed-search
stophy scrape "https://www.upwork.com/nx/search/jobs/?q=react&sort=recency" --parser upwork-search

# 2. one company's own job board, and one role in full
stophy scrape "https://boards.greenhouse.io/figma" --parser careers-jobs
stophy scrape "https://boards.greenhouse.io/figma/jobs/5813967004" --parser careers-job

# 3. what the company pays
stophy scrape "https://www.glassdoor.com/Overview/Working-at-Google-EI_IE9079.11,17.htm" --parser glassdoor-salaries
```

**Done when:** each role has its title, company, place and link, and pay appears only where a posting or Glassdoor gives it.

## Tips

- Put the search in the board's own URL: keywords, place and date filters, like LinkedIn's `f_TPR=r604800` for the past week.
- The same role often shows on several boards. Match on title and company, and keep the company's own posting.
- `careers-jobs` reads Greenhouse, Lever, Ashby, Workday, Workable and SmartRecruiters boards. A company's careers page usually links to one.
- Every call here costs 1 credit.

## See also

- [stophy-jobs](../stophy-jobs/SKILL.md): every jobs parser and its options
- [stophy-lead-gen](../stophy-lead-gen/SKILL.md): company details and contacts
