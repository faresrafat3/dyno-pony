---
name: to-spec
description: Turn the current conversation into a spec and publish it to the project issue tracker. No interview — just synthesis of what you've already discussed. Use when the user wants a spec for what's been decided, or says "write a spec", "turn this into a spec", "document the design", "publish to the tracker".
whenToUse: "(1) Use the project's domain glossary and respect ADRs. (2) Sketch the test seams first — existing preferred, highest possible, one is ideal. Confirm with the user. (3) Write the spec using the template below. (4) Publish to the configured tracker (local by default, via the `tracker` skill). Apply the `ready-for-agent` label."
metadata:
  category: engineering
  scope: spec
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, to-spec)
---

# To Spec

Synthesize current conversation + codebase understanding into a spec. **No interview — just synthesize.** Tracker via `tracker` skill (local markdown default `~/.dsh/tracker/`); none configured → ask which.

## Process

1. **Explore repo** (if not done). Domain-glossary vocabulary throughout; respect area ADRs.
2. **Sketch test seams.** Existing > new; highest possible; fewer = better, ideal = one. **Confirm with user.**
3. **Write + publish** per template below. Label `ready-for-agent` — no triage needed.

## Spec template

```markdown
# <Title>

## Problem Statement
User-facing problem.

## Solution
User-facing solution.

## User Stories
LONG numbered list, `1. As an <actor>, I want a <feature>, so that <benefit>` — extensive, all aspects.

## Implementation Decisions
Modules built/modified · interfaces touched · technical clarifications · architectural decisions · schema/API contracts · key interactions. NO file paths or snippets (stale fast) — EXCEPT prototype snippets encoding a decision better than prose (state machine, reducer, schema, type shape): inline trimmed decision-rich parts, note prototype origin.

## Testing Decisions
What makes a good test (external behavior, not internals) · modules tested · prior-art tests in codebase.

## Out of Scope
What this spec excludes.

## Further Notes
Anything else.
```

## Publishing

Local (default): next number (`ls ~/.dsh/tracker/specs | wc -l` → `printf '%02d'`), kebab slug from title, write `~/.dsh/tracker/specs/<NN>-<slug>.md` (body above + YAML front-matter: kind: spec, status: ready-for-agent, created: YYYY-MM-DD), report path.

Real tracker (GitHub/Linear/…): matching CLI (`gh issue create`, …) + `ready-for-agent` label.
