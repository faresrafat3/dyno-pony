---
name: plugin-test
description: >
  Scaffold Vitest specs for Dynamic Cordis plugins. Three tools:
  ptest_template (spec body per tool name), ptest_assertions
  (4 standard + 3 optional assertions per dyno-pony spec),
  ptest_harness (fake-ctx.ts source simulating host context to mount a plugin
  in Vitest). Use when authoring tests for a dynamic plugin, or reviewing a
  spec against the 4-assertion checklist.
whenToUse: "Use when the user wants to author, generate, or review a Vitest spec for a Dynamic Cordis plugin."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [ptest_template, ptest_assertions, ptest_harness]
---

# plugin-test — Test scaffolding for dyno-pony plugins

Part of the dyno-pony merged bundle; three tools: spec templates, assertion checklist, `fake-ctx.ts` for isolated mounts.

## Tools

| Tool | Does |
|---|---|
| `ptest_template(toolName, pluginId, packageId)` | Emits spec body; model writes to `.test.ts` |
| `ptest_assertions(includeOptional?)` | 4 required + 3 optional; review checklist |
| `ptest_harness()` | `fake-ctx.ts` source (tiny Cordis stub) |

## Assertions

Required: mounts clean; registers named tool; param schema valid (`type === "object"`, non-empty `properties`); output block with schema + render. Optional: effects return disposers (leak check); `registerTool` arg wrapped by `defineTool`; body ends `};` not `});` (the #1 dynamic bug).

## When to use

New plugin tests; spec body for fresh tool; review vs checklist. Never for non-dyno-pony plugins; runtime runs stay `pnpm vitest` from harness checkout.

## Activating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Off by default; nothing to switch off (spec bodies and assertions).

## Source of truth

`~/Projects/dyno-pony/packages/plugin-test.js`
