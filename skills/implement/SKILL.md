---
name: implement
description: Implement the work described in a spec or a set of tickets. Use when the user says "implement this", "build it", "go ahead", "start coding", or hands over a spec/issue and wants it built.
whenToUse: "Thin wrapper. Drive the `tdd` skill at pre-agreed seams (one red-green slice at a time). Run typecheck regularly; single test files regularly; the full test suite once at the end. When done, run the `code-review` skill before committing. Commit work to the current branch. Stops when each ticket's acceptance criteria are green and the review is clean."
metadata:
  category: engineering
  scope: execution
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, implement)
---

# Implement

Build what the spec/tickets describe.

## Process

1. **Read spec + tickets** — enough to see the task graph.
2. **Confirm seams** — `tdd` tests only at pre-agreed seams; confirm first.
3. **Drive `tdd` per ticket** — fail one vertical slice → pass with minimum → refactor only on named smell (`code-review` Fowler baseline).
4. **Typecheck + test** — typecheck per meaningful change; single file per cycle; full suite once at end.
5. **Review → commit** — `code-review` since fixed point to clean; conventional message naming spec/ticket id.

## Context hygiene

One ticket = one sub-context; stop at boundaries, never mid-ticket drift; `drift` on repeat questions → re-scope; `sphinx` when dense → checkpoint beats recovery.

## When not to use

Plan → `grill-with-docs`/`to-spec`/`to-tickets`; prototype → `prototype`; bug → `diagnose`; one-shot edit → skip skill, just edit.

## Out of scope

Spec writing (input, not output); architecture review (`codebase-arch`); spec-less refactors.
