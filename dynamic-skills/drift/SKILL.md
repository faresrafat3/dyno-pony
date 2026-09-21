---
name: drift
description: >
  Live transcript loop / contradiction detector. One tool: `drift` with three
  actions — `loop` (last 3-5 turns for circular restatement),
  `contradict` (last 3-5 turns for disagreeing claims),
  `silent` (fossil was legitimate recap). Watches for context-loss fossils
  ("as I mentioned", "earlier we…", "as before"); self-check every ~5 turns
  after turn 8. Off with `stop drift`. LIVE: running transcript, not saved logs.
whenToUse: "Use when the model catches itself saying 'as I mentioned' / 'earlier we…' / 'as before', or after ~5 turns past turn 8 of a long session."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [loop, contradict, silent]
---
# Drift — live loop & contradiction detector
Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). One tool: `drift`. Live self-check of the *running* transcript — NOT post-hoc audit (`trace`), NOT repo reads (`codex`).
## The 6 fossil phrases (do not add more — false positives)
`as I mentioned/said/noted/stated` · `as we discussed/covered/established` · `earlier we discussed/covered` · `earlier I noted` · `as before` · `as mentioned/discussed,` · `like I said/just said` · `remember when we` (flag only restated-as-fresh)
## When to use
Self-caught fossil; turns 8, 13, 18, 23, 28, … of long sessions.
## When NOT to use
Legitimate recap; refinements (X → X′); every-turn checks (fossil + cadence is the trigger).
## Three actions
- `loop` — re-read last 3 statements; restated-as-new? name it, else `clean. continue.`
- `contradict` — factual claims, last 3-5 turns; disagree? name it, refinement? say so, else clean.
- `silent` — legitimate recap. No-op.
## Deactivate
`stop drift`. Auto-deactivates after 10 consecutive clean turns.
## Pairing
`trace` POST-HOC logs · `codex` working tree · `sphinx` budget counters. Never reads `~/.dsh/sessions/.../*.jsonl.zstd` or tree; output stays **private**.
