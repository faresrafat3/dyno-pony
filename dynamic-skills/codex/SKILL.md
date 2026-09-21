---
name: codex
description: >
  Read-only codebase archaeology. Five tools: cdx_map (directory tree walk),
  cdx_symbols (top-level exported symbols), cdx_imports (import edges),
  cdx_owner (owning package + subsystem page + Agent Note), cdx_diff (git diff
  plan vs baseline). Planner only; model runs the command. Use before reviewing
  changes, exploring a new repo, or mapping a complex codebase.
whenToUse: "Use when the user wants a map of the repo, the exported symbols of a file, import edges, the owner of a file in DSH, or a git diff plan."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [cdx_map, cdx_symbols, cdx_imports, cdx_owner, cdx_diff]
---
# codex — Read-only codebase archaeology
Part of the dyno-pony merged bundle. Five model-facing tools.
## What this skill does
Planner only: returns bash/git command, model runs it, summarizes.
## Tools and actions
| Tool | Returns |
|---|---|
| `cdx_map(root?, depth?)` | `find` plan: file counts + language breakdown. |
| `cdx_symbols(filePath, body?, language?)` | Top-level exports (TS/JS/Python). |
| `cdx_imports(filePath, body?, language?)` | Import graph edges. |
| `cdx_owner(filePath)` | Owning package + subsystem page + Agent Note. |
| `cdx_diff(baseline?, root?, pathspec?)` | `git diff --name-status` plan vs baseline. |
## When to use
Repo map; file exports/imports; owner package/subsystem/Note; pre-diff plan.
## When NOT to use
Edits/writes (read-only); ad-hoc reads (use bash/read/grep).
## Activating
Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. No default preset.
## Deactivating
nothing to switch off (codex only plans); whole arsenal: `cordis_stop pluginId=<the bundle's id>`.
## Source of truth
`~/Projects/dyno-pony/packages/codex.js`
