---
name: orch
description: >
  Mode orchestrator. Composes pony + caveman + baseline into smart plans. Four tools:
  orch_route (pick the best mode for one task), orch_compare (run the same task under all
  4 modes side-by-side and save outputs), orch_pipeline (chain modes turn by turn),
  orch_status (introspect which modes are active). Use when the user wants AI-driven mode
  selection or a multi-mode comparison plan.
whenToUse: "Use when the user wants smart mode dispatch, side-by-side mode comparison, or sequential mode chaining."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: simple, pony-mode, caveman-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [orch_route, orch_compare, orch_pipeline, orch_status]
---

# Orchestrator — Smart mode dispatcher

Part of the dyno-pony merged bundle; four tools over `pony` + `caveman` + `baseline` (no overlay).

## Tools

| Tool | Does |
|---|---|
| `orch_route(task, force?)` | Heuristic mode-pick; returns prompt overlay |
| `orch_compare(task, armsCsv?, outputDir?)` | 4-arm plan; model runs each, saves to `~/.dsh/orch-comparisons/<timestamp>/` |
| `orch_pipeline(stepsJson)` | `{mode, task}` chain; mode holds one turn per step |
| `orch_status()` | Active plugins |

## Route heuristic

build/create/implement/refactor/fix/test → +pony · review/audit/simplify/bloat/yagni → +pony (heavy) · short/tldr/brief/one-line/no-fluff → +caveman · why/broken/failing/crash → +pony · <80 chars → +caveman. `force=` overrides.

## When to use

Auto mode-pick; 4-way compare; per-step modes; plugin introspection.

## When NOT to use

Named mode (`ponytail`/`caveman` directly); non-DSH work (needs pony/caveman).

## Activating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. In `simple`/`pony-mode`/`caveman-mode`; `orch_status` shows what is live.

## Source of truth

`~/Projects/dyno-pony/packages/orch.js`
