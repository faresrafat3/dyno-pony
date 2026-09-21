---
name: sphinx
description: >
  Context budget governor. One tool: `sphinx` with three actions — `audit`
  (session counters + recommended course), `checkpoint` (clean summary now +
  quiet window), `predict` (will the next request fit). Self-activates on:
  5+ tool calls AND idle, 3+ large reads, OR 20+ idle turns. Never always-on,
  never a fixed keyword. Off with "stop sphinx" or "normal mode".
whenToUse: "Use when the model has burned through 5+ tool calls, 3+ large file reads, 20+ idle turns, or the user says 'checkpoint'."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [audit, checkpoint, predict]
---

# Sphinx — context budget governor (حاكم ميزانية السياق)

Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). One tool: `sphinx`. Watches session counters, tells the model when context is about to overflow. Three actions:

- `audit` — peek at `s.toolCallCount`, `s.largeReadCount`, `s.idleTurnCount`, recommend a course
- `checkpoint` — clean summary now (5-step recipe below) + 5-turn quiet window
- `predict` — estimate whether the next request fits; if not, `checkpoint` first

## When to use

- 5+ tool calls since last sphinx AND idle (no new user message)
- 3+ large reads (> 200 lines) · 20+ idle turns · user says "checkpoint"/"compact"

## When NOT to use

- Always-on (nags) · fixed keyword without counter check · short Q&A

## Heuristic

```
audit() fires when ANY of: s.largeReadCount >= 3 · s.toolCallCount >= 5 AND s.idleTurnCount >= 20 · s.idleTurnCount >= 20
checkpoint() extends a 5-turn quiet window · predict() emits a band verdict
```

## Checkpoint recipe

1. Files read + one line each. 2. Decisions made (`ponytail`/`memo` tier). 3. Open questions. 4. Drop raw bodies; keep paths + takeaways. 5. Continue from summary; re-read only on ask.

## Pairing

`ponytail(mode=ultra)` laziest rebuild · `caveman(action=terse)` shortest reply · `memo_classify` checkpoint as Agent Note.

## Deactivate

`stop sphinx` / `normal mode`. One composite, no toggle.

## Example

```
Turn 23: 7 tool calls, 22 idle → heuristic trips → sphinx(action="audit")
→ "tool-calls-and-idle (7). Call checkpoint." → checkpoint(scope="files") → 5-turn quiet window.
```
