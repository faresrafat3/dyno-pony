---
name: ultimate
description: >
  Ultimate mode (وضع ultimate — كل حاجه شغالة). One tool: `ultimate` with
  three actions — `on` (arm the persona overlay: pony + caveman + sentinels
  + every dyno-pony tool, with smart routing), `off` (return to baseline),
  `status` (introspect the arsenal). Triggered when Fares says "ultimate
  mode" / "go all out" / "full arsenal" / "كل حاجة". Off with "stop
  ultimate" / "exit ultimate" / "normal mode". Does NOT mount new plugins
  — the dyno-pony merged bundle is already loaded. Sets a private session
  flag and returns a persona overlay prompt the model reads silently.
whenToUse: "Use when Fares says 'ultimate mode', 'go all out', 'full arsenal', 'كل حاجة', '/ultimate', or starts a session he has marked as important and wants every tool available without micro-managing which one to call."
metadata:
  pluginId: ult-1 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-1
  preset: ultimate-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [on, off, status]
---

# Ultimate — the "go all out" persona overlay

A Dynamic Cordis plugin (pluginId `ult-1`, packageId `pkg-1`). One tool: `ultimate`.

## What this skill does

When Fares is in a session he considers important and wants the model to
have **every** tool, **every** sentinel, **every** overlay available
without him having to name the tool each time, he says **"ultimate
mode"** (or "go all out" / "full arsenal" / "كل حاجة" / `/ultimate`).

The `ultimate` tool then:

1. Sets a private session flag (`s.ultimate.armed = true`).
2. Returns a **persona overlay prompt** the model reads silently.
3. Does **not** call `cordis_run` / `cordis_stop` / `cordis_define` — the
   dyno-pony merged plugin is already loaded upstream of this skill. All
   37 tools (ponytail + caveman + orch + dsh-author + memo + plugin-test
   + codex + memory + workflow + trace + sphinx + drift + second_order
   + this one) are already registered.

## The persona overlay (model reads silently)

- **Lazy by default**: `ponytail(mode=ultra)` — YAGNI, reuse, stdlib first.
- **Terse by default**: `caveman(action=terse)` — short replies, no preamble.
- **Smart-route**: `orch_route` picks the mode for each task; do not micro-manage.
- **Self-check**: `sphinx` fires on budget pressure, `drift` on linguistic fossils, `second_order` on hard-to-undo actions. Do not narrate these to the user.
- **Save judgement**: `memo_classify` + `memo_format` for any decision worth keeping; `mem_promote` when a note proves reusable.
- **Review before you build**: `cdx_map` / `cdx_symbols` / `cdx_owner` before touching a new repo.
- **Subagents when it actually fans out**: `workflow.wf_compose` → `wf_run` → `wf_collect`; otherwise just do it.
- **Post-hoc review**: `trace.trc_mode_flow` at the end of a session.

## Trigger phrases (Fares says any of these)

- `ultimate mode` (English, primary)
- `go all out`
- `full arsenal`
- `كل حاجة` (Egyptian Arabic)
- `/ultimate` (slash form, if the harness routes slashes to skills)

## Deactivation

- `stop ultimate`
- `exit ultimate`
- `normal mode`
- `ultimate(action="off")`

The flag is private. The model does **not** narrate "ultimate mode is
now on" to the user. The flag is only visible via `ultimate(action="status")`.

## The 3 actions

- `on` — arm + read the persona overlay
- `off` — disarm, return to baseline
- `status` — introspect: is it armed? what's in the arsenal? (37 tools)

## When to use

- A long, important session (Fares marks it himself by saying the trigger phrase).
- Fares wants the model to make smart choices about which tool to use without him naming it.
- Fares wants the sentinels (sphinx/drift/second_order) watching.

## When NOT to use

- For a 2-turn Q&A. Ultimate mode is overhead for short sessions.
- When Fares wants only one tool — call that tool directly, do not arm everything.
- When Fares wants terse + lazy but NOT the sentinels — use `pony-mode` or `caveman-mode` directly.

## Pairing

- `pony-mode` (subset) — pony + orch
- `caveman-mode` (subset) — caveman + orch
- `sentinel-mode` (subset) — sphinx + drift + second_order
- `ultimate-mode` (superset) — pony + caveman + orch + dsh-author + memo + plugin-test + codex + memory + workflow + trace + sphinx + drift + second_order

The superset does not replace the subsets; it co-exists. Pick the narrowest preset that fits the session.

## Disarm is one phrase

`stop ultimate`. The 37 tools stay registered. Only the persona overlay flips off.
