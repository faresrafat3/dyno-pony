---
name: drift
description: >
  Live transcript loop / contradiction detector. One tool: `drift` with three
  actions — `loop` (re-read last 3-5 turns for circular restatement),
  `contradict` (check last 3-5 turns for disagreeing factual claims),
  `silent` (no-op when the fossil was a legitimate recap). Drift watches for
  the linguistic fossils of context loss ("as I mentioned", "earlier we…",
  "as before") and fires a self-check every ~5 turns after turn 8. Off with
  `stop drift`. Pairs with trace (POST-HOC logs) and codex (repo-archaeology).
  Drift is LIVE: it inspects the running turn's transcript, not saved logs.
whenToUse: "Use when the model catches itself saying 'as I mentioned' / 'earlier we…' / 'as before', or after ~5 turns past turn 8 of a long session."
metadata:
  pluginId: dft-1 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-1
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [loop, contradict, silent]
---

# Drift — live loop & contradiction detector

A Dynamic Cordis plugin (pluginId `dft-1`, packageId `pkg-1`). One tool: `drift`.

## What this skill does

Live transcript self-check. Drift is **NOT** a post-hoc auditor (that is
`trace`) and **NOT** a repo-archaeology tool (that is `codex`). Drift
watches the *running* conversation for the linguistic fossils of context
loss and gives the model a private self-loop it may use to re-read its
own recent turns.

## The 6 fossil phrases (do not add more — false positives)

- `as I mentioned` / `as I said` / `as I noted` / `as I stated`
- `as we discussed` / `as we covered` / `as we established`
- `earlier we discussed` / `earlier we covered` / `earlier I noted`
- `as before` / `as mentioned,` / `as discussed,`
- `like I said` / `like I just said`
- `remember when we` (genuine recap is fine; flag only when the claim is restated as fresh)

## When to use

- After the model catches itself saying one of the 6 fossil phrases
- After turn 8, every ~5 turns (turns 8, 13, 18, 23, 28, …) of a long session

## When NOT to use

- For a legitimate recap (a real "as I mentioned" pointing back to a previous turn is fine)
- For a refinement (turn A said X, turn B narrows to X' — that's not a contradiction)
- Always-on (the fossil + cadence is the trigger, not "every turn")

## Three actions

- `loop` — re-read last 3 statements. For each pair, did you restate claim i as if it were new in claim j? If yes, name it; if not, `clean. continue.`
- `contradict` — list each factual claim from last 3-5 turns. For each pair, do they disagree on a fact? If yes, name it; if refinement, say so; if clean, `clean. continue.`
- `silent` — acknowledge the fossil was a legitimate recap. No-op.

## Deactivate

`stop drift`. Also auto-deactivates after 10 consecutive clean turns.

## Pairing

- `trace` (POST-HOC) — extracts from saved session logs
- `codex` (repo-archaeology) — reads the working tree, not the transcript
- `sphinx` (context budget) — orthogonal, fires on counters not on language

## Anti-pair (do NOT confuse)

- drift never reads `~/.dsh/sessions/.../*.jsonl.zstd` (that's `trace`)
- drift never reads the working tree (that's `codex`)
- drift's output is **private** — the model does not narrate it to the user
