---
name: stophy-jobs
description: |
  Get job postings from LinkedIn, Indeed, and Upwork: search by keyword, location, or rate, and read one posting in full. Use for "find jobs for", "who is hiring for this role", "find freelance work for", "what does this job pay", "remote jobs in this field". For a company's LinkedIn profile or posts, not its job listings, use stophy-social.
metadata:
  author: stophy
  version: "4.0.1"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy jobs

Search and read job postings on LinkedIn, Indeed, and Upwork.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# roles by keyword and location, with workplace and experience filters
stophy linkedin jobs search "product manager" --location "New York" --json -o .stophy/linkedin-jobs.json

# roles on Indeed by keyword and place, from the last week
stophy indeed search "data analyst" --location "Chicago, IL" --within week --json -o .stophy/indeed.json

# freelance work by rate type and experience
stophy upwork search "react developer" --jobType hourly --experience intermediate --json -o .stophy/upwork.json

# one posting in full, by ID or link from a search result
stophy linkedin jobs job "https://www.linkedin.com/jobs/view/4467286013" --json -o .stophy/job.json
stophy indeed job 21a9db51a8d45b9d --json -o .stophy/indeed-job.json
```

Run `stophy <source> --help` for every command. The sources here are `linkedin`, `indeed`, and `upwork`.

**Done when:** you name the specific role, company, pay, and posting link. A generic summary of "several openings" is not enough.

## Tips

- Search first to get a job ID or link, then run `job` on it for the full description and requirements.
- Every command here costs 1 credit per call, including `upwork search`, `linkedin jobs search` and all of Indeed.
- `indeed search` takes `--location`, `--country`, `--remote` and `--within` (`day`, `week` or `month`). A `--location` returns jobs within about 5 miles. Use `--cursor` for the next page.
- LinkedIn jobs live under `linkedin jobs`. `linkedin posts` and `linkedin profile` cover people and companies, and belong to stophy-social.

## See also

- [stophy-social](../stophy-social/SKILL.md): LinkedIn company profiles and posts
