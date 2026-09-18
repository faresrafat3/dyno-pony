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
  pluginId: orch-3 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-8
  preset: simple, pony-mode, caveman-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [orch_route, orch_compare, orch_pipeline, orch_status]
---

# Orchestrator — Smart mode dispatcher

A Dynamic Cordis plugin (pluginId `orch-3`, packageId `pkg-8`). Four tools, all model-facing.

## What this skill does

Composes `pony` + `caveman` + `baseline` (no overlay) into actionable plans. **Decides WHICH mode to use**, or plans multi-mode runs.

## Tools and actions

| Tool | What it does |
|---|---|
| `orch_route(task, force?)` | Heuristic picks the best mode (`baseline` / `pony` / `caveman`) based on task signals (build / review / terse / debug). Returns a prompt overlay. |
| `orch_compare(task, armsCsv?, outputDir?)` | Returns a 4-arm plan (`baseline`, `pony`, `caveman`, `pony-caveman`). The model executes each and saves outputs to `~/.dsh/orch-comparisons/<timestamp>/`. |
| `orch_pipeline(stepsJson)` | Sequential mode chain; JSON array of `{mode, task}` steps. Each step keeps its own mode for that turn only. |
| `orch_status()` | Introspect which dyno-pony plugins are active right now. |

## How orch_route picks (the heuristic)

Signals scored against each mode:
- "build / create / implement / refactor / fix / test" → +pony
- "review / audit / simplify / over-engineer / bloat / yagni" → +pony (heavy)
- "short / tldr / brief / one line / no fluff" → +caveman
- "why / broken / failing / crash / exception" → +pony
- task length < 80 chars → +caveman

Use `force=pony|caveman|baseline` to override.

## When to use

- User wants the model to pick the right mode automatically.
- User wants to compare all 4 modes side-by-side.
- User wants multi-step work with different modes per step.
- User wants to know which dyno-pony plugins are running.

## When NOT to use

- When the user already named a specific mode (use `ponytail` or `caveman` directly).
- For non-DSH work (orch depends on pony / caveman tools being available).

## Activating

Part of the `simple`, `pony-mode`, and `caveman-mode` presets.

```
cordis_run pluginId=orch-3 packageId=pkg-8 mode=run
```

## Deactivating

`cordis_stop pluginId=orch-3`.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/orch.js`
