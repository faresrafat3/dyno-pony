---
name: sphinx
description: >
  Context budget governor. One tool: `sphinx` with three actions — `audit`
  (peek at session counters and recommend a course), `checkpoint` (capture
  a clean summary now and start a quiet window), `predict` (estimate whether
  the next request will fit). Self-activates on a narrow heuristic: 5+ tool
  calls since the last sphinx call AND idle, 3+ large file reads, OR 20+ idle
  turns. Never always-on, never on a fixed keyword. Composes with ponytail
  (lazy rebuild) and caveman (terse mode). Off with "stop sphinx" or
  "normal mode".
whenToUse: "Use when the model has burned through 5+ tool calls, 3+ large file reads, 20+ idle turns, or the user says 'checkpoint'."
metadata:
  pluginId: sphx-1 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-1
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [audit, checkpoint, predict]
---

# Sphinx — context budget governor (حاكم ميزانية السياق)

A Dynamic Cordis plugin (pluginId `sphx-1`, packageId `pkg-1`). One tool: `sphinx`.

## What this skill does

Watches the session counters and tells the model when the context is about
to overflow. Three actions:

- `audit` — peek at `s.toolCallCount`, `s.largeReadCount`, `s.idleTurnCount` and recommend a course
- `checkpoint` — capture a clean summary now (the 5-step recipe below) and start a 5-turn quiet window
- `predict` — estimate whether the next request will fit; if not, call `checkpoint` first

## When to use

- After 5+ tool calls since the last sphinx call AND the session is idle (no new user message)
- After 3+ large file reads (> 200 lines)
- After 20+ idle turns
- When the user says "checkpoint" or "compact"

## When NOT to use

- Always-on (that would be the opposite of the heuristic — it would nag)
- On a fixed keyword without the counter check (the heuristic IS the trigger)
- For short, simple Q&A turns

## Heuristic (the exact rule)

```
audit() fires when ANY of:
  s.largeReadCount >= 3
  s.toolCallCount  >= 5 AND s.idleTurnCount >= 20
  s.idleTurnCount  >= 20
checkpoint() extends a 5-turn quiet window
predict() reads the same counters and emits a band verdict
```

## The 5-step checkpoint recipe

1. List the files you have read this session and one line on each.
2. List the decisions you have made (with the `ponytail` / `memo` tier).
3. List the open questions for the user.
4. Drop every raw file body. Keep paths + takeaways.
5. Continue from the summary. Do NOT re-read files unless asked.

## Pairing

- `ponytail(mode=ultra)` for the laziest rebuild
- `caveman(action=terse)` for the shortest reply
- `memo_classify` to write the checkpoint as an Agent Note

## Deactivate

`stop sphinx` / `normal mode`. Tool is one composite, no separate toggle.

## Worked example

```
Turn 23. Tool calls since last sphinx: 7. Idle turns: 22.
→ Heuristic trips (tool-calls AND idle).
→ Call sphinx(action="audit").
→ Verdict: "tool-calls-and-idle (metric=7). Call checkpoint."
→ Call sphinx(action="checkpoint", scope="files").
→ 5-turn quiet window. User can keep working.
```
