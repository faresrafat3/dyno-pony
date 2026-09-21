---
name: workflow
description: >
  Bridge orch plans into ctx.workflowEngine. Three tools:
  wf_compose (orch_pipeline plan → workflow script fanning each step to a
  subagent with a mode overlay), wf_run (meta + args for the native
  `workflow` tool), wf_collect (wait for settle, return final JSON). Use for a
  real multi-mode subagent pipeline — parallel/pipeline primitives — not just
  sequential orch_pipeline.
whenToUse: "Use when the user wants to compose an orch plan into a real workflow script and run it on the substrate's workflow engine."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [wf_compose, wf_run, wf_collect]
---

# workflow — Bridge to ctx.workflowEngine

Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). Composes an `orch_pipeline` plan into a real **workflow script** (`agent`, `parallel`, `pipeline`, `phase`, `log`) and submits it to `ctx.workflowEngine` — model submits via the native `workflow` tool.

| Tool | Returns |
|---|---|
| `wf_compose(stepsJson, name?)` | Script body; each step = one `agent()` call with mode overlay |
| `wf_run(script, name?, argsJson?)` | `meta` + `args` block for the native `workflow` tool |
| `wf_collect(runId, timeoutMs?)` | Polling bash recipe to wait for settle |

## Mode overlays

`pony` → YAGNI ladder, first rung that holds · `caveman` → terse, drop filler · `baseline` → normal prose/reasoning. All reply with the working result.

## When / NOT

- Real multi-agent workflow (parallel fan-out) · substrate structured-output guarantee.
- NOT one-step tasks (`orch_route`/`orch_pipeline`) · NOT read-only archaeology (`codex`) · NOT tests/specs (`plugin-test`).

## Activating / Deactivating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Nothing to disarm (these plan; the native `workflow` tool submits).

## Source of truth

`~/Projects/dyno-pony/packages/workflow.js`
