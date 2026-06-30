# skills-sh-overrides.json — rejected

**Decision:** do not file `skills-sh-overrides.json` pull requests against `vercel-labs/skills` to hide or redirect stophydotdev skill listings.

**Date:** 2026-06-30.

## Why

The `skills-sh-overrides.json` mechanism is **proposed but not implemented** in the indexer. As of 2026-06-30:

- The file does not exist on `vercel-labs/skills` `main`.
- No code in `src/` reads it. (Verified via code search.)
- Two PRs proposing it (#1472 from 2026-06-20, #1480 from 2026-06-21) are open with no review activity.
- A third PR using the same mechanism is unlikely to land faster than the existing two.

## What to do instead

File an issue on `vercel-labs/skills` requesting a manual cleanup. The maintainers can edit the database directly. This is the path that has worked for other authors — see issues #1553, #1456, #1429, and our own #1557.

## When to revisit

When one of the open PRs (#1472, #1480) is merged, or when a `skills-sh-overrides.json` reader lands in `vercel-labs/skills` `src/`, this file can be deleted and the override PR route re-enabled.