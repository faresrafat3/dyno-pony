---
name: trace
description: >
  Extract dyno-pony mode-flow from session logs. Two tools: trc_mode_flow
  (plan an extraction of the ordered dyno-pony tool invocations from a session
  log; the model greps the session jsonl.zstd file), trc_diff (plan a
  side-by-side comparison of two sessions' mode flows). Use when the user wants
  to review how a session used the dyno-pony tools, or compare two sessions'
  tool usage.
whenToUse: "Use when the user wants to review which dyno-pony tools a session used, or compare two sessions' tool usage patterns."
metadata:
  pluginId: trc-7 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-13
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [trc_mode_flow, trc_diff]
---

# trace — Session mode-flow extraction

A Dynamic Cordis plugin (pluginId `trc-7`, packageId `pkg-13`). Two tools, all model-facing.

## What this skill does

Specialized workflow for **reviewing dyno-pony tool usage** in a session. Reads the session log (`session.jsonl.zstd`) and extracts just the dyno-pony tool calls (filtered by name). Compares two sessions side-by-side.

## Tools and actions

| Tool | What it returns |
|---|---|
| `trc_mode_flow(sessionId?)` | Plan a `zstdcat + grep` extraction. The model summarizes the ordered list. |
| `trc_diff(sessionA, sessionB)` | Plan a side-by-side diff. Per-tool counts, ordering, union/intersection. |

## The dyno-pony tool list (auto-tracked)

42 tools across 10 plugins:
- pony-1: `ponytail` (1)
- cavm-2: `caveman` (1)
- orch-3: `orch_route`, `orch_compare`, `orch_pipeline`, `orch_status` (4)
- dsha-4: `dsh_author_inspect`, `dsh_author_define`, `dsh_author_run`, `dsh_author_validate`, `dsh_author_recover` (5)
- memo-5: `memo_classify`, `memo_format`, `memo_link`, `memo_scope`, `memo_archive`, `memo_review` (6)
- ptst-3: `ptest_template`, `ptest_assertions`, `ptest_harness` (3)
- cdx-4: `cdx_map`, `cdx_symbols`, `cdx_imports`, `cdx_owner`, `cdx_diff` (5)
- mem-5: `mem_write`, `mem_read`, `mem_search`, `mem_promote` (4)
- wkfl-6: `wf_compose`, `wf_run`, `wf_collect` (3)
- trc-7: `trc_mode_flow`, `trc_diff` (2) — recursive; trace counts itself

## When to use

- User wants to know which dyno-pony tools a session actually used.
- User wants to compare two sessions' mode usage (e.g. before/after adopting a new plugin).
- User wants to audit a session for over-use of a specific tool.

## When NOT to use

- For full session traces (use the substrate's `SessionTelemetryBackend` instead).
- For non-dyno-pony tool calls (trace only tracks the 42 dyno-pony tools).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=trc-7 packageId=pkg-13 mode=run
```

## Deactivating

`cordis_stop pluginId=trc-7`. Consider stopping after the review is done.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/trace.js`
