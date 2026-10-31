---
name: stophy-jobs
description: |
  Get job postings from LinkedIn, Indeed, Upwork, and company careers pages, and Glassdoor company reviews and salaries: search by keyword, location, or rate, and read one posting in full. Use for "find jobs for", "who is hiring for this role", "find freelance work for", "what does this job pay", "remote jobs in this field", "what roles is this company hiring for". For a company's LinkedIn profile or posts, not its job listings, use stophy-social.
metadata:
  author: stophy
  version: "4.0.4"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy jobs

Search and read job postings on LinkedIn, Indeed, Upwork, and company careers pages, and read Glassdoor company reviews and salaries.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# roles by keyword and location on LinkedIn
stophy linkedin jobs search "product manager" --location "New York" --json -o .stophy/linkedin-jobs.json

# roles on Indeed by keyword and place, from the last week
stophy indeed search "data analyst" --location "Chicago, IL" --datePosted last7Days --json -o .stophy/indeed.json

# freelance work by rate type and experience
stophy upwork search "react developer" --jobType hourly --experienceLevel intermediate --json -o .stophy/upwork.json

# one posting in full, by ID or link from a search result
stophy linkedin jobs job "https://www.linkedin.com/jobs/view/4467286013" --json -o .stophy/job.json
stophy indeed job 21a9db51a8d45b9d --json -o .stophy/indeed-job.json

# every open role on a company's careers page, and one in full
stophy careers jobs https://boards.greenhouse.io/figma --json -o .stophy/careers.json
stophy careers job https://boards.greenhouse.io/figma/jobs/5813967004 --json
```

Run `stophy <source> --help` for every command. The sources here are `linkedin`, `indeed`, `upwork`, `careers`, and `glassdoor`.

**Done when:** you name the specific role, company, pay, and posting link. A generic summary of "several openings" is not enough.

## Tips

- Search first to get a job ID or link, then run `job` on it for the full description and requirements. To point at one posting, give its link or its id, never both: `--jobUrl` or `--jobId`.
- Every command here costs 1 credit per call, including `upwork search`, `linkedin jobs search` and all of Indeed, careers and Glassdoor.
- `indeed search` takes `--location`, `--country`, `--remote` (`remote` or `hybrid`) and `--datePosted` (`last24Hours`, `last3Days`, `last7Days` or `last14Days`). Use `--cursor` for the next page.
- `upwork search` takes `--sort` (`newest` or `relevance`), `--experienceLevel`, `--minHourlyRate` and `--maxHourlyRate`, and `--page 2` for the next page.
- `linkedin jobs search` takes `--company` to keep jobs at up to five companies, and `--page 2` for the next page.
- LinkedIn jobs live under `linkedin jobs`. `linkedin posts` and `linkedin profile` cover people and companies, and belong to stophy-social.
- `careers jobs` takes the link to a company's job board, such as its Greenhouse or Lever page, and pages with `--cursor`. `careers job` takes one job's link from it.

## See also

- [stophy-social](../stophy-social/SKILL.md): LinkedIn company profiles and posts
