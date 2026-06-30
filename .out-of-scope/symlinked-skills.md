# Symlinked skills — rejected

**Decision:** do not commit local-relative symlinks pointing outside the repo as substitutes for `SKILL.md` files.

## Why

- GitHub does not resolve local-relative symlinks on push. The repo shows the symlink target as a literal string (e.g. `../.agents/skills/stophy-video`) instead of following it.
- skills.sh indexes what GitHub shows, not what the symlink resolves to. A symlinked skill produces a 32-byte entry in the indexer and cannot be installed by `npx skills add`.
- The symlink only works locally. Anyone who clones the repo fresh (without the same `../.agents/skills/` layout) sees a broken entry.

## What to do instead

Commit real `SKILL.md` files inside the repo. The 6 existing skills (`stophy-channel`, `stophy-cli`, `stophy-playlist`, `stophy-search`, `stophy-suggest`, `stophy-video`) follow this pattern and are the source of truth.

For local development against an in-progress draft, use the staging approach in your own working directory (e.g. a separate scratch repo) and only commit to `stophydotdev/skills` once the skill is real.