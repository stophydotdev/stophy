---
name: stophy-jobs
description: Use to find job postings and pay on LinkedIn, Indeed, Upwork, company careers pages and Glassdoor, like "find remote React jobs posted this week", "who is hiring for this role", "what does this company pay", "find freelance work for".
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy jobs

Setup, keys and errors: [stophy](../stophy/SKILL.md). Every parser here needs a key. Put the search in the board's own URL: keywords, place and date filters.

## Steps

1. Search the boards. `f_TPR=r604800` keeps LinkedIn jobs from the past week.

   ```bash
   stophy scrape "https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=United%20States&f_TPR=r604800" --parser linkedin-jobs -o .stophy/jobs.json --json
   stophy scrape "https://www.indeed.com/jobs?q=nurse&l=Austin%2C+TX" --parser indeed-search
   stophy scrape "https://www.upwork.com/nx/search/jobs/?q=react&sort=recency" --parser upwork-search
   ```

2. Read the roles that fit in full, from the company's own board when it has one:

   ```bash
   stophy scrape "https://boards.greenhouse.io/figma" --parser careers-jobs
   stophy scrape "https://boards.greenhouse.io/figma/jobs/5426468004" --parser careers-job
   ```

3. Add what the company pays: `stophy scrape "https://www.glassdoor.com/Overview/Working-at-Google-EI_IE9079.11,17.htm" --parser glassdoor-salaries`.

**Done when:** each role has its title, company, place and link, and pay appears only where a posting or Glassdoor gives it.

| Parser | Page |
|---|---|
| `linkedin-jobs`, `linkedin-job` | linkedin.com/jobs/search with keywords, a location or a company; a job page |
| `indeed-search`, `indeed-job` | indeed.com/jobs with `q` or `l`; indeed.com/viewjob?jk=... |
| `upwork-search`, `upwork-job` | upwork.com/nx/search/jobs/?q=...; a job page |
| `careers-jobs`, `careers-job` | a Greenhouse, Lever, Ashby, Workday, Workable or SmartRecruiters board; one job on it |
| `glassdoor-company`, `glassdoor-reviews`, `glassdoor-salaries` | a Glassdoor company page |

- The same role often shows on several boards. Match on title and company, and keep the company's own posting.

## Price

$0.001 a call.
