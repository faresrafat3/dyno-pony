---
name: triage
description: Move issues on the project issue tracker through a small state machine of triage roles, categorise, verify, grill if needed, and write agent-ready briefs. Use when the user wants to triage the backlog, says "triage issues", "categorise the bug reports", "what's in the queue", or runs /triage.
whenToUse: "Two categories (bug, enhancement) + five states (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix); every triaged issue carries exactly one of each. PRs: same states vs attached code. (1) Show attention items. (2) Triage one issue: context, recommend, verify, grill if needed, apply. (3) Quick override for 'move #N to X'."
metadata:
  category: engineering
  scope: triage
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, triage)
---

# Triage

Move issues through a small triage state machine. PRs = issues w/ attached code; bare `#42` resolved per tracker config (`tracker` skill; local markdown default `~/.dsh/tracker/`).

## Reference docs

- `tracker` skill — read/write local tracker.
- `grill` skill — fleshing out requests.

## Roles

**Two categories:** `bug` (broken) · `enhancement` (new/improved).

**Five states:**

- `needs-triage` — evaluate.
- `needs-info` — waiting on reporter.
- `ready-for-agent` — specified, AFK-agent-ready.
- `ready-for-human` — needs human.
- `wontfix` — no action.

PR states read vs attached code: `ready-for-agent` = brief attached, agent takes next diff step; `ready-for-human` = ready to merge.

Each triaged issue carries **exactly one** category + one state. Conflicting states → flag, ask before acting.

Canonical names; actual label strings may differ — `tracker` config maps canonical→local. Missing config → `setup-matt-pocock-skills` or set labels in `~/.dsh/tracker/config.yaml`.

Transitions: unlabeled → `needs-triage` → `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`. `needs-info` → `needs-triage` on reporter reply. Maintainer may override anytime; flag unusual transitions, ask first.

## Invocation

Maintainer runs `/triage`, describes want in prose. Examples: "Show attention items." / "Look at #42." / "Move #42 to ready-for-agent." / "What's agent-ready?"

## Show what needs attention

Three buckets, oldest first:

1. **Unlabeled** — never triaged.
2. **`needs-triage`** — in progress.
3. **`needs-info` w/ reporter activity since last notes** — re-evaluate.

Counts + one-line summary each. Maintainer picks. Local tracker: `ls ~/.dsh/tracker/issues/` + parse front-matter `state:`.

## Triage a specific issue or PR

1. **Gather context.** Full issue/PR (body, comments, labels, author, dates; PR: +diff). Parse prior triage notes — don't re-ask resolved. Explore codebase via domain glossary, respect ADRs. Two checks:
   - **(a) Redundancy** — search existing implementation by domain concept (not request wording); report where looked. Found = already-implemented `wontfix` (step 5).
   - **(b) Prior rejection** — read `.out-of-scope/*.md` (or local out-of-scope dir); surface resemblances.
2. **Recommend.** Category + state w/ reasoning + relevant codebase summary (already-implemented?). Wait for direction.
3. **Verify claim** before grilling. Bug: reproduce from reporter steps. PR: checkout, confirm diff does what it claims (run tests/commands). Report: confirmed (w/ code path) / failed / insufficient (strong `needs-info`).
4. **Grill (if needed).** Needs fleshing → `grill` skill (grill-with-docs) + `domain` inline, one question round at a time; sharpen terms, update `CONTEXT.md`/ADRs as decisions land.
5. **Apply outcome:**
   - `ready-for-agent` — front-matter `state: ready-for-agent` + **agent brief** in body.
   - `ready-for-human` — same brief shape, note why undelegatable (judgment, external access, design, manual testing).
   - `needs-info` — append notes: "What we've established" + "What we still need from you".
   - `wontfix` — move to `~/.dsh/tracker/wontfix/` (or `state: wontfix`), comment per *why*: **Already implemented** → point where it lives. **Rejected (bug)** → polite explanation. **Rejected (enhancement)** → write `.out-of-scope/`, link from comment.
   - `needs-triage` — apply role; optional comment if partial progress.

## Quick state override

"Move #42 to ready-for-agent" → trust, apply directly. Confirm planned changes (role, comment, close), act. Skip grilling; ask if they want an agent brief when skipping it.

## Needs-info template

```markdown
## Triage Notes

**What we've established so far:**

- point 1
- point 2

**What we still need from you (@reporter):**

- question 1
- question 2
```

Capture grilled resolutions under "established" so work survives. Questions specific + actionable — never "more info please".

## Resuming

Prior notes → read, check reporter answers, present updated picture. Don't re-ask resolved.
