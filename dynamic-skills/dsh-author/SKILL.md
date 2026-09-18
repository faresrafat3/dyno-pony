---
name: dsh-author
description: >
  Authoring aid for Dynamic Cordis plugins. Five tools: dsh_author_inspect (4-step inspect recipe),
  dsh_author_define (cordis_define parameter template), dsh_author_run (cordis_run pattern),
  dsh_author_validate (catches the 6 most common authoring mistakes), dsh_author_recover (returns
  the rebuild commands for an existing pluginId). Use when writing or maintaining a dynamic
  plugin, or after a DSH restart to recover plugin IDs.
whenToUse: "Use when the user wants to author a new Dynamic Cordis plugin, or recover an existing plugin after a DSH restart."
metadata:
  pluginId: dsha-4 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-10
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [dsh_author_inspect, dsh_author_define, dsh_author_run, dsh_author_validate, dsh_author_recover]
---

# dsh-author — Plugin authoring aid

A Dynamic Cordis plugin (pluginId `dsha-4`, packageId `pkg-10`). Five tools, all model-facing.

## What this skill does

Specialized authoring workflow. Helps the model write new Dynamic Cordis plugins correctly, lint candidate source, and recover plugin IDs after a DSH restart.

## Tools and actions

| Tool | What it does |
|---|---|
| `dsh_author_inspect(target?)` | Returns the 4-step inspect recipe: list providers → query service → list builtins → inspect self. |
| `dsh_author_define(kind, idPrefix?, existingPluginId?, toolName?)` | Returns the cordis_define parameter template, with constraints filled in. |
| `dsh_author_run(mode?)` | Returns the cordis_run pattern with all possible outcomes explained. |
| `dsh_author_validate(codeHost)` | Pure string check; catches 6 common mistakes: idPrefix length, body ends with `};` not `});`, missing `defineTool` wrap, missing output block, minItems, TypeScript leakage. |
| `dsh_author_recover(pluginId)` | Returns the rebuild commands for an existing pluginId. |

## The 6 mistakes `validate` catches

1. idPrefix not 3-6 lowercase letters.
2. code.host ends with `});` (closes a call that was never opened).
3. `harness.registerTool` used without `harness.defineTool` wrap.
4. `harness.defineTool` body missing `output: { schema, render }`.
5. parameters schema uses `minItems` (not supported by unified DSL).
6. TypeScript types (e.g. `string | number`) or JSX detected.

## When to use

- Authoring a new Dynamic Cordis plugin.
- Recovering plugin IDs after a DSH restart.
- Validating a candidate plugin body before `cordis_define`.
- Discovering the inspect catalog and service contracts.

## When NOT to use

- For non-plugin work.
- For non-dynamic (built-in) packages — those go through `pnpm run build` instead.

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=dsha-4 packageId=pkg-10 mode=run
```

## Deactivating

`cordis_stop pluginId=dsha-4`. Consider stopping after you're done authoring — this is a specialized tool.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/dsh-author.js`
