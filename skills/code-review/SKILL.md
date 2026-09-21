---
name: code-review
description: Two-axis review of the diff since a fixed point. Standards (does the code follow the repo's documented standards + a Fowler smell baseline) and Spec (does the code match what the originating issue/spec asked for). Both axes run as parallel sub-agents so they don't pollute each other's context. Use when the user wants to review a branch, a PR, work-in-progress changes, or says "review since X", "review the diff", "is this ready to merge".
whenToUse: "Run a two-axis review. (1) Pin the fixed point (commit SHA, branch, tag, merge-base). (2) Find the spec source. (3) Find the standards sources. (4) Spawn two parallel sub-agents, Standards + Spec. (5) Aggregate under separate headings, never merge. End with one line per axis: total findings, worst issue. Don't pick a winner across axes — the separation is the point."
metadata:
  category: engineering
  scope: review
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, code-review)
---

# Code Review

`HEAD` vs user fixed point on two axes: **Standards** (repo conventions?) + **Spec** (implements issue/spec?). **Parallel sub-agents** (no context pollution), then aggregate. Separate reporting stops one axis masking the other (all-standards/wrong-thing vs exact-issue/broken-conventions).

## Process

### 1. Pin the fixed point

User's ref (SHA/branch/tag/`main`/`HEAD~5`); else ask. Capture: `git diff <fixed-point>...HEAD` (three-dot = merge-base) + `git log <fixed-point>..HEAD --oneline`. Verify ref (`git rev-parse`) + non-empty diff — fail here, not in sub-agents.

### 2. Spec source

Order: (1) commit issue refs (`#123`, `Closes #45`, `!67`) via tracker; (2) user-passed path; (3) `docs/`/`specs/`/`.scratch/` match; (4) none → ask; "no spec" → **Spec** agent reports "no spec available".

### 3. Standards sources

`CODING_STANDARDS.md`, `CONTRIBUTING.md`, workspace `AGENTS.md` + fixed **Fowler baseline** (_Refactoring_ ch.3, applies with zero docs). Rules: **repo overrides** (documented wins); **judgement call** (labelled heuristic e.g. "possible Feature Envy", never violation; skip tooling-enforced).
Smells: **Mysterious Name** (hides behavior) · **Duplicated Code** (same shape 2+ places) · **Feature Envy** (grabs other's data) · **Data Clumps** (co-traveling fields = unborn type) · **Primitive Obsession** (primitive for concept) · **Repeated Switches** · **Shotgun Surgery** (one change, scattered edits) · **Divergent Change** (one file, unrelated reasons) · **Speculative Generality** · **Message Chains** (`a.b().c().d()`) · **Middle Man** (pure delegate) · **Refused Bequest** (ignores inheritance).

### 4. Spawn in parallel

**Standards:** diff + commits, standards files, **smell baseline pasted full**, brief <400w. **Spec:** diff + commits, spec path/contents, brief <400w. Missing spec → skip Spec agent, note it.

### 5. Aggregate

Reports under `## Standards` / `## Spec`, verbatim or lightly cleaned; **never** merge/rerank. End: one line per axis (count + worst issue). No cross-axis winner.
