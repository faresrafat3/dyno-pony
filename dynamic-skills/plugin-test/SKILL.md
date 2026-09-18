---
name: plugin-test
description: >
  Authoring aid: scaffold Vitest specs for Dynamic Cordis plugins. Three tools:
  ptest_template (emit a Vitest spec body for a given tool name), ptest_assertions
  (returns the 4 standard assertions + 3 optional ones every dyno-pony spec must
  contain), ptest_harness (returns the source for fake-ctx.ts, a tiny builder
  that simulates enough of the host context to mount a dyno-pony plugin in a Vitest
  process). Use when the model wants to author tests for a dynamic plugin, or
  review a generated spec against the standard 4-assertion checklist.
whenToUse: "Use when the user wants to author, generate, or review a Vitest spec for a Dynamic Cordis plugin."
metadata:
  pluginId: ptst-3 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-9
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [ptest_template, ptest_assertions, ptest_harness]
---

# plugin-test — Test scaffolding for dyno-pony plugins

A Dynamic Cordis plugin (pluginId `ptst-3`, packageId `pkg-9`). Three tools, all model-facing.

## What this skill does

Specialized workflow for **authoring tests** for Dynamic Cordis plugins. Generates Vitest spec templates, the standard assertion list, and a fake-`ctx.ts` builder so a plugin can mount in isolation.

## Tools and actions

| Tool | What it does |
|---|---|
| `ptest_template(toolName, pluginId, packageId)` | Emit a Vitest spec body. The model writes the emitted string to a `.test.ts` file. |
| `ptest_assertions(includeOptional?)` | Returns the 4 required + 3 optional assertions. Use as a review checklist. |
| `ptest_harness()` | Returns the source for `fake-ctx.ts`. Tiny Cordis-shaped stub. |

## The 4 required assertions

1. `mounts without throwing` — `expect(() => pluginApply(fake.ctx)).not.toThrow()`.
2. `registers the named tool` — apply then assert the tool registry received the entry.
3. `exposes a valid parameter schema` — `parameters.type === "object"` and `properties` is a non-empty object.
4. `exposes an output block with schema + render`.

## The 3 optional assertions

5. `every effect returns a disposer` — call every effect's callback, expect each to return a `() => void`. Catches leaks.
6. `uses harness.defineTool then harness.registerTool` — search the plugin source for `registerTool` and assert the argument is wrapped by `defineTool`.
7. `code body ends with `};` (object literal), not `});` (call)`. The #1 dynamic plugin bug.

## When to use

- Authoring tests for a new Dynamic Cordis plugin.
- Generating a spec body for a tool you just wrote.
- Reviewing an existing spec against the 4-assertion checklist.

## When NOT to use

- For non-dyno-pony plugins (this skill generates specs for the user-space plugin model only).
- For runtime testing (the model still runs `pnpm vitest` from the harness checkout).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=ptst-3 packageId=pkg-9 mode=run
```

## Deactivating

`cordis_stop pluginId=ptst-3`. Consider stopping after you're done authoring.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/plugin-test.js`
