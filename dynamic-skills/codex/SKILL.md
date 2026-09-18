---
name: codex
description: >
  Read-only codebase archaeology. Five tools: cdx_map (plan a directory tree walk
  with file counts and language breakdown), cdx_symbols (top-level exported
  symbols for a file), cdx_imports (import graph edges for a file), cdx_owner
  (DSH conventions for finding a file's owning package + subsystem page + Agent
  Note), cdx_diff (plan a file-level git diff against a baseline ref). Codex is
  a planner; the model runs the suggested bash/git command. Use before reviewing
  changes, exploring a new repo, or mapping a complex codebase.
whenToUse: "Use when the user wants a map of the repo, the exported symbols of a file, import edges, the owner of a file in DSH, or a git diff plan."
metadata:
  pluginId: cdx-4 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-10
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [cdx_map, cdx_symbols, cdx_imports, cdx_owner, cdx_diff]
---

# codex — Read-only codebase archaeology

A Dynamic Cordis plugin (pluginId `cdx-4`, packageId `pkg-10`). Five tools, all model-facing.

## What this skill does

Read-only archaeology. Codex is a **planner** — it returns the bash/git command to run, not the data. The model runs it, then summarizes.

## Tools and actions

| Tool | What it returns |
|---|---|
| `cdx_map(root?, depth?)` | Plan a `find` command with file counts and language breakdown. |
| `cdx_symbols(filePath, body?, language?)` | Top-level exported symbols (TypeScript / JavaScript / Python). |
| `cdx_imports(filePath, body?, language?)` | Import graph edges for a file. |
| `cdx_owner(filePath)` | DSH conventions for finding the owning package + subsystem page + Agent Note. |
| `cdx_diff(baseline?, root?, pathspec?)` | Plan a `git diff --name-status` against a baseline ref. |

## When to use

- User wants a map of the repo at a glance.
- User wants to know what a file exports without reading every line.
- User wants to know what a file imports (dependency surface).
- User wants to find the owning package / subsystem / Agent Note for a file.
- User wants to plan a diff against a ref before doing the diff.

## When NOT to use

- For edits or writes. Codex is read-only.
- For runtime data (use bash / read / grep directly for ad-hoc questions).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=cdx-4 packageId=pkg-10 mode=run
```

## Deactivating

`cordis_stop pluginId=cdx-4`. Consider stopping after the archaeology is done.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/codex.js`
