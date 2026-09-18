---
name: memory
description: >
  Hierarchical memory per the home AGENTS.md: per-agent < per-group < per-company
  < global. Four tools: mem_write (plan a write of a note at a scope), mem_read
  (plan a read of the k most recent notes from a scope), mem_search (plan a
  keyword search over a scope), mem_promote (plan a promotion of a note up the
  hierarchy). Notes are stored as Markdown files under ~/.dsh/memory/<scope>/.
  Use when the model needs persistent recall across sessions, or to record a
  decision / convention / finding for later retrieval.
whenToUse: "Use when the user wants to record, recall, search, or promote a memory note at any of the four hierarchy levels."
metadata:
  pluginId: mem-5 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-11
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [mem_write, mem_read, mem_search, mem_promote]
---

# memory — Hierarchical recall

A Dynamic Cordis plugin (pluginId `mem-5`, packageId `pkg-11`). Four tools, all model-facing.

## What this skill does

Specialized workflow for **persistent recall**. Notes live as Markdown files under `~/.dsh/memory/<scope>/<date>-<slug>.md`. The scope hierarchy (per-agent < per-group < per-company < global) follows the home `AGENTS.md` memory design.

## Tools and actions

| Tool | What it returns |
|---|---|
| `mem_write(scope, title, body, tagsCsv?)` | Plan a write. Returns the file path, frontmatter, and body. The model calls native `write` to persist. |
| `mem_read(scope?, k?, tagsCsv?)` | Plan a read. Returns the `ls -1t` bash command. The model reads the top `k` files. |
| `mem_search(query, scope?, k?)` | Plan a keyword search. Returns the `grep -rli` bash command. |
| `mem_promote(notePath, toScope)` | Plan a promotion. Returns the `mv` + `edit` recipe. Refuses demotion. |

## The 4 scopes (rank low to high)

- `per-agent` — private to one agent. Default for new notes.
- `per-group` — shared within a team.
- `per-company` — shared within an organization.
- `global` — distilled experience everyone benefits from.

A `mem_promote` only moves a note **up** the hierarchy. Demotion is refused; archive the old note instead.

## When to use

- User wants to record a decision, convention, or finding for later retrieval.
- User wants to recall what they learned in past sessions (per-agent scope).
- User wants to share a finding with the team (per-group, per-company, global).
- User wants to move a note from a private scope to a shared one.

## When NOT to use

- For ephemeral session state (use `ctx.sessions` instead).
- For source code or documentation (use the DSH substrate for those).
- For non-note text (memory is for notes specifically).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=mem-5 packageId=pkg-11 mode=run
```

## Deactivating

`cordis_stop pluginId=mem-5`. Consider stopping after you're done.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/memory.js`
