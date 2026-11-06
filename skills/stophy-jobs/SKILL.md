---
name: stophy-jobs
description: |
  Get job postings from LinkedIn, Indeed, Upwork and company careers pages, and Glassdoor company reviews and salaries: search by keyword, location or rate, and read one posting in full. Use for "find jobs for", "who is hiring for this role", "find freelance work for", "what does this job pay", "remote jobs in this field", "what roles is this company hiring for". For a company's LinkedIn profile or posts, not its job listings, use stophy-social.
metadata:
  author: stophy
  version: "5.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx @stophy/cli *)
  - Bash(npx @stophy/cli@latest *)
---

# stophy jobs

Find open roles and what they pay.

**Prerequisite:** the Stophy CLI 2.0.0 or later (`stophy --version`). Every parser here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# job searches by keyword and place
stophy scrape "https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=United%20States&f_TPR=r604800" --parser linkedin-jobs --json -o .stophy/jobs.json
stophy scrape "https://www.indeed.com/jobs?q=nurse&l=Austin%2C+TX" --parser indeed-search
stophy scrape "https://www.upwork.com/nx/search/jobs/?q=react&sort=recency" --parser upwork-search

# one company's open roles, and what it pays
stophy scrape "https://boards.greenhouse.io/figma" --parser careers-jobs
stophy scrape "https://www.glassdoor.com/Overview/Working-at-Google-EI_IE9079.11,17.htm" --parser glassdoor-salaries
```

**Done when:** you list each role with its title, company, place and link, and quote pay only where the output gives it.

## Parsers

| Parser | Page to scrape | Options |
|---|---|---|
| `linkedin-jobs` | linkedin.com/jobs/search with keywords, a location or a company | company, easyApply, fewApplicants, page |
| `linkedin-job` | a LinkedIn job page or lnkd.in link | |
| `indeed-search` | indeed.com/jobs with `q` or `l` | remote, jobType, datePosted, sort, cursor |
| `indeed-job` | indeed.com/viewjob?jk=... | country |
| `upwork-search` | upwork.com/nx/search/jobs/?q=... | jobType, experienceLevel, minHourlyRate, page |
| `upwork-job` | an Upwork job page | |
| `careers-jobs` | a job board on Greenhouse, Lever, Ashby, Workday, Workable or SmartRecruiters | cursor |
| `careers-job` | one job on such a board | |
| `glassdoor-company`, `glassdoor-reviews`, `glassdoor-salaries` | a Glassdoor company page: overview, reviews or salaries | page |

## Tips

- Search first, then scrape one job page for the full description.
- In a LinkedIn search URL, `f_TPR=r604800` keeps jobs posted in the past week.
- Every call here costs 1 credit.

## See also

- [stophy-social](../stophy-social/SKILL.md): a company's LinkedIn profile and posts
- [stophy-web](../stophy-web/SKILL.md): search the web for anything else about a company
