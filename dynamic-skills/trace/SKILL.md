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
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [trc_mode_flow, trc_diff]
---

# trace — Session mode-flow extraction

Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). Reviews **dyno-pony tool usage**: reads `session.jsonl.zstd`, extracts dyno-pony calls in order, diffs two sessions side-by-side.

| Tool | Returns |
|---|---|
| `trc_mode_flow(sessionId?)` | `zstdcat + grep` extraction plan; model summarizes ordered list |
| `trc_diff(sessionA, sessionB)` | Side-by-side plan: per-tool counts, ordering, union/intersection |

## Tracked tools

One bundle, so a current log names the same `dyno-*` plugin for all of them — group by owner:
ponytail `ponytail` · caveman `caveman` · orch `orch_route/compare/pipeline/status` · dsh-author `dsh_author_inspect/define/run/validate/recover` · memo `memo_classify/format/link/scope/archive/review` · plugin-test `ptest_template/assertions/harness` · codex `cdx_map/symbols/imports/owner/diff` · memory `mem_write/read/search/promote` · workflow `wf_compose/run/collect` · trace `trc_mode_flow/diff` (recursive) · sphinx `sphinx` · drift `drift` · second-order `second_order` · ultimate `ultimate`. Counts: `scripts/counts.cjs`.
Pre-merge logs (before 2026-09-04) name per-plugin ids (`pony-1`, `cavm-2`, …) — match by tool name, not id.

## When / NOT

- Which tools a session used · compare two sessions (e.g. before/after a plugin) · audit over-use of one tool.
- NOT full traces (`SessionTelemetryBackend`) · NOT non-dyno-pony calls.

## Activating / Deactivating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Nothing to switch off (the tools only plan extractions).

## Source of truth

`~/Projects/dyno-pony/packages/trace.js`
