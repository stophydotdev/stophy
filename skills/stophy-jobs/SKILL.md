---
name: stophy-jobs
description: |
  Get job postings from Indeed, LinkedIn, and Upwork: search by keyword, location, or rate, and read one posting in full. Use for "find jobs for", "who is hiring for this role", "find freelance work for", "what does this job pay", "remote jobs in this field". For a company's LinkedIn profile or posts, not its job listings, use stophy-social.
metadata:
  author: stophy
  version: "3.0.0"
allowed-tools:
  - Bash(stophy *)
  - Bash(npx -y @stophy/cli *)
---

# stophy jobs

Search and read job postings on Indeed, LinkedIn, and Upwork.

**Prerequisite:** every command here needs `stophy login --browser` or `STOPHY_API_KEY`. See [stophy](../stophy/SKILL.md).

## Quick start

```bash
# full-time roles by keyword and location
stophy indeed search --query "data analyst" --location "Chicago, IL" --remote -o .stophy/indeed.md

# the same on LinkedIn, with job-type and experience filters
stophy linkedin jobs search --query "product manager" --location "New York" --jobTypes fullTime -o .stophy/linkedin-jobs.md

# freelance work by rate and duration
stophy upwork search --query "react developer" --jobType hourly --experience intermediate -o .stophy/upwork.md

# one posting in full, by ID or URL from a search result
stophy indeed job "https://www.indeed.com/viewjob?jk=abc123def456" -o .stophy/job.md
```

Run `stophy <source> --help` for every command. The sources here are `indeed`, `linkedin`, and `upwork`.

**Done when:** you name the specific role, company, pay, and posting link. A generic summary of "several openings" is not enough.

## Tips

- Search first to get a job ID or URL, then run `job` on it for the full description and requirements.
- LinkedIn jobs live under `linkedin jobs`. `linkedin posts` and `linkedin profile` cover people and companies, and belong to stophy-social.

## See also

- [stophy-social](../stophy-social/SKILL.md): LinkedIn company profiles and posts
