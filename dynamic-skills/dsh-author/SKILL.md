---
name: dsh-author
description: >
  Dynamic Cordis plugin authoring aid. Five tools: dsh_author_inspect (4-step
  inspect), dsh_author_define (define template), dsh_author_run (run pattern),
  dsh_author_validate (6 authoring mistakes), dsh_author_recover (rebuild
  commands). Use when writing or maintaining a dynamic plugin, or after a DSH
  restart to recover plugin IDs.
whenToUse: "Use when the user wants to author a new Dynamic Cordis plugin, or recover an existing plugin after a DSH restart."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [dsh_author_inspect, dsh_author_define, dsh_author_run, dsh_author_validate, dsh_author_recover]
---
# dsh-author — Plugin authoring aid
Part of the dyno-pony merged bundle. Five model-facing tools for writing, linting, recovering plugins.
## Tools and actions
| Tool | What it does |
|---|---|
| `dsh_author_inspect(target?)` | 4-step recipe: providers → service → builtins → self. |
| `dsh_author_define(kind, idPrefix?, existingPluginId?, toolName?)` | `cordis_define` template with constraints. |
| `dsh_author_run(mode?)` | `cordis_run` pattern + all outcomes. |
| `dsh_author_validate(codeHost)` | String check for the 6 mistakes below. |
| `dsh_author_recover(pluginId)` | Rebuild commands for an existing pluginId. |
## The 6 mistakes `validate` catches
1. idPrefix not 3-6 lowercase letters. 2. host body ends `});` (unopened call). 3. `registerTool` without `defineTool` wrap. 4. `defineTool` missing `output: { schema, render }`. 5. params use unsupported `minItems`. 6. TS types (`string | number`) or JSX.
## When to use
New plugin; post-restart recovery; pre-define validation; inspect catalog/contracts.
## When NOT to use
Non-plugin work; built-in packages — those use `pnpm run build`.
## Activating
Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. No default preset.
## Deactivating
nothing to switch off (templates and string checks); whole arsenal: `cordis_stop pluginId=<the bundle's id>`.
## Source of truth
`~/Projects/dyno-pony/packages/dsh-author.js`
