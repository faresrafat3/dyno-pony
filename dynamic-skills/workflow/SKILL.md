---
name: workflow
description: >
  Bridge orch plans into the substrate's ctx.workflowEngine. Three tools:
  wf_compose (convert an `orch_pipeline` plan into a workflow script body that
  fans out each step to a subagent with the chosen mode as a prompt overlay),
  wf_run (plan a submit to ctx.workflowEngine.start — the model actually submits
  via the native `workflow` tool), wf_collect (plan a wait for the run to settle
  and return the final JSON value). Use when the model wants to run a real
  multi-mode pipeline with subagents, parallel, and pipeline primitives, not
  just a sequential orch_pipeline.
whenToUse: "Use when the user wants to compose an orch plan into a real workflow script and run it on the substrate's workflow engine."
metadata:
  pluginId: wkfl-6 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-12
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [wf_compose, wf_run, wf_collect]
---

# workflow — Bridge to ctx.workflowEngine

A Dynamic Cordis plugin (pluginId `wkfl-6`, packageId `pkg-12`). Three tools, all model-facing.

## What this skill does

Composes an `orch_pipeline` plan into a real **workflow script** (with `agent`, `parallel`, `pipeline`, `phase`, `log`) and submits it to the substrate's `ctx.workflowEngine`. The model does the actual submission via the native `workflow` tool.

## Tools and actions

| Tool | What it returns |
|---|---|
| `wf_compose(stepsJson, name?)` | The workflow script body. Each step becomes one `agent()` call with a mode overlay. |
| `wf_run(script, name?, argsJson?)` | The `meta` + `args` block to pass to the native `workflow` tool. |
| `wf_collect(runId, timeoutMs?)` | The polling bash recipe to wait for the run to settle. |

## The mode overlays

- `pony` → "Apply the YAGNI ladder. Stop at the first rung that holds. Reply with the working result."
- `caveman` → "Terse prose. Drop filler. Reply with the working result."
- `baseline` → "Normal prose, normal reasoning. Reply with the working result."

## When to use

- User wants to run a real workflow with subagents (not a sequential orch_pipeline).
- User wants to fan out work to multiple agents in parallel.
- User wants the substrate's structured-output guarantee (per cookbook line 107).

## When NOT to use

- For one-step tasks (use orch_route / orch_pipeline instead).
- For read-only archaeology (use codex instead).
- For tests / specs (use plugin-test instead).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=wkfl-6 packageId=pkg-12 mode=run
```

## Deactivating

`cordis_stop pluginId=wkfl-6`. Consider stopping after the run is done.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/workflow.js`
