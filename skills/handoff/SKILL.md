---
name: handoff
description: >-
  Compact the current conversation into a portable handoff document so a fresh
  agent (or session) can continue the work. Also: re-pitch a message that
  didn't land in plain English. Use when the user says "handoff", "summarize
  this session", "I need to come back to this later", "the agent in a new tab
  won't have this context", or says "wait what" / "I don't get it" / "what did
  you just say".
whenToUse: "Two related skills. (1) Handoff: write a portable markdown handoff (save to OS temp, never the workspace) summarising the current conversation; redact secrets; reference existing artifacts (specs, ADRs, commits) by path, don't duplicate them. (2) Wait-what: re-pitch a message that didn't land in plain English, with the context the user was missing, using the project's CONTEXT.md vocabulary."
metadata:
  category: productivity
  scope: context
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, handoff + wait-what)
---

# Handoff + Wait-what

Opposite-direction fixes for one **context** problem: handoff preserves it upfront, wait-what re-pitches what missed.

## 1. Handoff
Compact the conversation so a fresh agent (or future you) resumes without the full log.

### Where to save

OS temp only — never workspace (meta-artifact; don't pollute repo). `$TMPDIR` → `/tmp`; path `~/.dsh/handoffs/<YYYY-MM-DD>-<slug>.md`.

### What to include

**Goal** (1–2 lines); **Decisions** (load-bearing + *why*); **State** (done / in flight / blocked); **Next step** (single most useful action); **Skills** (e.g. `/grill-with-docs`, `/tdd`); **Artifacts** (spec/ADR/commit paths — reference, never duplicate).

### What to redact

Keys, passwords, PII → **`<REDACTED>`** on write; handoff becomes the next prompt, leaks are permanent.

### What not to do

No duplicated artifacts, no transcripts, no deferred redaction, no workspace saves.

## 2. Wait-what
Confusion signal ("I don't get it", repeated answered question, silence after a dense reply)? Re-pitch with the missing context.

### Recipe
**Plain English** (short sentences, one idea each, project terms); **project vocabulary** (canonical `CONTEXT.md` — ungrounded jargon means it didn't land); **missing context first**; **one-liner, then paragraph** (blunt restatement, then reasoning).

### When to reach for it
Confusion signal; repeated answered question; silence after long reply; dense/shorthand-heavy message.

### What not to do

No re-delivery of the rejected message; no "did you mean X or Y?"; no more detail (detail was the problem).

## How the two combine

Handoff = upfront cure; wait-what = in-moment correction — both cheaper than `drift` recovery or `sphinx` checkpointing.
