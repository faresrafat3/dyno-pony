---
name: implement-spec
description: Implement a specification in code, in parallel. Use when the user has a spec with tickets, wants the entire spec on a single branch as a PR, and is happy to run multiple implementer sub-agents concurrently. Builds the spec end-to-end, then closes out with a code review.
whenToUse: "Spec → PR. Tickets form a task graph with blocking edges. (1) Read the spec and tickets. (2) (Optional) Spin up an exploration sub-agent to gather codebase context. (3) Create a branch and a draft PR marked as closing the spec and tickets. (4) Spin up one implementer sub-agent per frontier ticket, each in its own worktree, on its own branch. (5) Merge each as it lands. (6) Repeat until all tickets done. (7) Run `code-review` on the PR; fix everything raised in a single implementer sub-agent. (8) Mark the PR ready, clean up worktrees."
metadata:
  category: engineering
  scope: parallel-build
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, implement-spec)
---

# Implement Spec

Spec → single PR via concurrent implementers. Tickets = **task graph**; **frontier** = blockers-done set.

## Steps

1. **Read spec + tickets** — blockers, front deps, sizes.
2. **(Optional) Explorer** — codebase/external context into scratch dir **outside repo**.
3. **Branch + draft PR** — marked **closing** spec + tickets; the integration surface.
4. **Implementers per frontier ticket** — own worktree + branch off PR branch; comms via context pointers, never duplicated prose; **max concurrency**.
5. **Merger per finisher** — merges to PR branch; implementer never rebases/merges/pushes.
6. **Refill frontier** — landed tickets grow it; loop to done.
7. **Review** — `code-review` on PR diff; one implementer pass fixes all; re-review.
8. **Ship** — undraft, tell user, delete worktrees. PR branch + commits = record.

## Sub-agent discipline

Implementer: own worktree/branch, commits there, never pushes/merges. Merger: conflicts, checks, merges. Explorer: read-only notes. Comms = **pointers**, not prose.

## When not to use

One ticket / one context / work-now-not-PR → `implement`. No spec → `prototype` or `grill-with-docs`.

## Anti-patterns

Sequential implementers; self-merging implementers; whole-repo reads (use explorer notes); skipping review; reusing main (PR branch is the surface).
