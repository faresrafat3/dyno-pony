---
name: memory
description: >
  Hierarchical memory per home AGENTS.md: per-agent < per-group < per-company
  < global. Four tools: mem_write, mem_read (k most recent), mem_search,
  mem_promote (up the hierarchy). Notes under ~/.dsh/memory/<scope>/. Use
  for persistent recall across sessions, or recording a decision /
  convention / finding.
whenToUse: "Use when the user wants to record, recall, search, or promote a memory note at any of the four hierarchy levels."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [mem_write, mem_read, mem_search, mem_promote]
---

# memory — Hierarchical recall

Part of the dyno-pony merged bundle; four tools. Notes: `~/.dsh/memory/<scope>/<date>-<slug>.md`, hierarchy per home `AGENTS.md`.

## Tools

| Tool | Returns |
|---|---|
| `mem_write(scope, title, body, tagsCsv?)` | Write plan (path + frontmatter + body); model persists via `write` |
| `mem_read(scope?, k?, tagsCsv?)` | `ls -1t` command; model reads top `k` |
| `mem_search(query, scope?, k?)` | `grep -rli` command |
| `mem_promote(notePath, toScope)` | `mv` + `edit` recipe; up only, refuses demotion |

## Scopes (low → high)

`per-agent` (private, default) < `per-group` < `per-company` < `global`. Demotion refused — archive instead.

## When to use

Record/recall/search/promote decisions, conventions, findings at any level. Never for ephemeral state (`ctx.sessions`), source/docs (DSH substrate), or non-note text.

## Activating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Off by default; nothing to switch off (the tools only plan reads/writes).

## Source of truth

`~/Projects/dyno-pony/packages/memory.js`
