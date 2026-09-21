---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker. Edges as text in one file per ticket locally, or native blocking links on a real tracker. Use when the user wants a spec broken into agent-grabbable slices, or says "break this into tickets", "split into vertical slices", "what are the tickets".
whenToUse: "(1) Gather context. (2) Explore codebase; look to prefactor. (3) Draft vertical slices, each fitting a fresh context window. (4) Quiz user on granularity + blocking edges. (5) Publish approved tickets to configured tracker (local markdown default, `tracker` skill). Tickets ready-for-agent by construction."
metadata:
  category: engineering
  scope: tickets
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, to-tickets)
---

# To Tickets

Break plan/spec/conversation into **tracer-bullet vertical slices**, each declaring its **blocking edges**. Tracker via `tracker` skill (local markdown default `~/.dsh/tracker/`).

## Process

### 1. Gather context

Work from conversation. User-passed ref (spec path, issue #/URL) → fetch full body + comments.

### 2. Explore codebase (optional)

If unexplored, do so. Domain-glossary titles/descriptions; respect area ADRs. Look to **prefactor** ("make the change easy, then make the easy change").

### 3. Draft vertical slices

**Rules:** each slice = narrow but COMPLETE path through every layer (schema, API, UI, tests) — vertical, never horizontal; demoable/verifiable alone; fits one fresh context window; prefactor first. Each ticket lists **blocking edges** (tickets gating it; none = start immediately).

**Wide refactors excepted.** A wide refactor = one mechanical change (rename column, retype shared symbol) whose **blast radius** breaks thousands of call sites — no vertical slice lands green. Sequence as **expand–contract**: (1) **Expand** — new form beside old, nothing breaks; (2) **Migrate** — call sites in batches sized by blast radius (per package/dir), each its own ticket blocked by expand, CI green batch-to-batch; (3) **Contract** — delete old form once callers gone, blocked by every migrate batch. Batches that can't stay green alone share an integration branch blocking a final integrate-and-verify ticket; green promised only there.

### 4. Quiz user

Numbered list per ticket: **Title** · **Blocked by** · **What it delivers** (end-to-end behavior). Ask: granularity right (coarse/fine)? edges correct (only genuine gates)? merge/split any? Iterate to approval.

### 5. Publish

Same tickets, only edge shape differs: **Local** — one file per ticket `~/.dsh/tracker/tickets/<NN>-<slug>.md`, numbered `01…` in dependency order (blockers first), "Blocked by" = numbers/titles, never one combined file. **Real tracker** (GitHub/Linear/…) — one issue per ticket in dependency order so edges reference real IDs; use native blocking/sub-issue links. Label `ready-for-agent` unless told otherwise (agent-grabbable by construction). Work the **frontier** (blockers all done; linear chain = top to bottom). Never close/modify parent issue.

## Local ticket template

```markdown
---
kind: ticket
state: ready-for-agent
created: 2026-09-05
---

# <NN>: <Ticket title>

**What to build:** end-to-end behavior, user perspective, not layer-by-layer list.

**Blocked by:** gating numbers/titles, or "None (can start immediately)".

**Status:** ready-for-agent

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
```

No file paths/snippets (stale fast) — EXCEPT prototype snippets encoding a decision better than prose: inline trimmed decision-rich parts, note prototype origin.
