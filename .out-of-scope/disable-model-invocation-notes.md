# disable-model-invocation — adoption notes

**Decision:** adopted as an optional frontmatter flag on every `SKILL.md`.

## When to set `disable-model-invocation: true`

A skill is **user-invoked** when:

- It is a workflow orchestrator that should run only when the human explicitly invokes it (e.g. a future `setup-stophy-skills` skill that asks which CLI auth method to use).
- Reaching for it automatically would be wrong — the model should not decide on its own to start a setup flow or a destructive operation.

A skill is **model-invoked** (the default — no flag needed) when:

- It is a domain helper the model should reach for when the user describes a matching task.
- All 6 current `stophy-*` skills fall in this bucket.

## Format

```yaml
---
name: stophy-foo
description: <rich trigger phrasing>
disable-model-invocation: true   # user-invoked only
---
```

The flag is read by agent harnesses that support it. Harnesses that ignore it fall back to model-invocable for every skill, which is the safe direction (orchestrators stay reachable; helpers stay reachable). Set the flag explicitly on user-invoked skills so harnesses that respect it can hide them from auto-completion.

## Reviewing existing skills

If a future skill fits the "user-invoked" definition, add the flag and document the trigger in its `description:` (e.g. "Use only when the human types `/setup-stophy-skills`."). Do not retrofit the flag on the existing 6 — they are all model-invoked by design.