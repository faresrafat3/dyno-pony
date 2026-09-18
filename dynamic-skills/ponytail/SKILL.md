---
name: ponytail
description: >
  Lazy senior dev mode (وضع المطور الكسلان الذكي). Use before writing code, when reviewing changes,
  or when the user says "ponytail", "lazy mode", "simplest solution", "minimal", "yagni", "do less",
  "shortest path", or complains about over-engineering, bloat, boilerplate, or unnecessary
  dependencies. Stops at the first rung that holds (YAGNI → reuse → stdlib → native → dep → one-liner
  → minimum). NOT for non-coding requests. Fares-localized fork of github.com/DietrichGebert/ponytail
  (MIT). Active every response; off with "stop ponytail" or "normal mode".
whenToUse: "Use when the user wants a YAGNI / lazy mindset on a coding task, or when they ask for a review / audit of changes."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: none (no pony-mode/simple preset is installed locally)
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk (see Activating)"
  actions: [mode, review, audit, debt, gain, help]
---

# Ponytail — Lazy senior dev

One tool among the 38 in the merged **dyno-pony** dynamic Cordis plugin. The bundle is
process-local: it disappears on every DSH restart. Its source persists on disk, so recovery
is loading it again — not hand-writing the tool. See "Activating this skill" below.

## What this skill does

Governs **WHAT the model builds**. Enforces a "stop at the first rung that holds" ladder:

1. Does it need to exist at all? (YAGNI)
2. Already in this codebase? Reuse it.
3. Stdlib does it? Use it.
4. Native platform feature? Use it.
5. Already-installed dependency? Use it.
6. One line? One line.
7. Only then: minimum code that works.

Also: no unrequested abstractions, deletion over addition, boring over clever, shortest working diff.

## Tools and actions

| Action | Effect |
|---|---|
| `ponytail(action="mode", level="lite")` | Build what's asked; name the lazier alternative in one line. |
| `ponytail(action="mode", level="full")` | The ladder enforced. **Default.** |
| `ponytail(action="mode", level="ultra")` | YAGNI extremist. Challenge requirements before building. |
| `ponytail(action="review", target="...")` | One-line review of changes for over-engineering only. NOT correctness. |
| `ponytail(action="audit", target="...")` | Whole-repo audit, ranked biggest cut first. |
| `ponytail(action="debt", target="...")` | Harvest every `ponytail:` comment into a tracked ledger. |
| `ponytail(action="gain")` | Show published benchmark medians (NOT per-repo). |
| `ponytail(action="help")` | Quick reference card. |

## When to use

- User says "ponytail" / "lazy mode" / "simplest solution" / "minimal" / "yagni" / "do less".
- User complains about over-engineering, bloat, boilerplate, unnecessary dependencies.
- User asks to review or audit code for over-engineering.
- User wants minimum code that works.

## When NOT to use

- Non-coding requests (general knowledge, prose, translation, recipes).
- Correctness / security / performance review (out of scope; route to a normal review pass).

## Activating this skill — PREFER THE LOADER (verified 2026-09-18)

**The whole dyno-pony arsenal already exists on disk**, and one ~700-byte loader brings back
all 38 tools including `ponytail`. Do NOT hand-re-author a single tool unless the bundle is
unavailable.

Source of truth (exists — verified):
`/home/fares/Projects/deepseek-harness/.agents/skills/dyno-pony/packages/dyno-pony.js`
(2730 lines / 139 KB, 38 tools, one `apply()`, one disposer).

**Step 1 — stop any plugin already holding a tool name.** The bundle registers all 38; any
standalone copy of one of them collides and the whole load fails with
`tool "X" is already registered`. Find and stop it first:

```
cordis_inspect_self                     # list this session's plugins
cordis_stop pluginId=<holder>           # keeps its packages for instant rollback
```

**Step 2 — define the loader** (`kind=new`, idPrefix `dyno`). The ONE recipe lives in the
repo README §Recovery (`~/Projects/dyno-pony/README.md`) — read it there, never restate it
here. Shape: ~700 bytes, `inject: ['fs']`, reads the bundle at apply time from the first
existing candidate (`~/.dsh/dyno-pony/packages/dyno-pony.js` deployed copy ->
`~/Projects/dyno-pony/packages/dyno-pony.js` canonical -> legacy harness checkout), evaluates
it with `new Function('harness', 'ctx', body)`, and calls `inner.apply(ctx)`.

**Step 3 — `cordis_run` the returned pluginId/packageId with mode=run.**

**Step 4 — verify, do not assume.** `cordis_inspect_query Tool listTools` must show all 38
dyno-pony tool names. Checking the run result alone is not evidence the tools registered.

### Why the loader works

Verified sandbox facts (probed live, 2026-09-18): the dynamic host sandbox exposes
`Function`, `eval`, `require`, and `process` is `undefined`. `inject: ['fs']` gives
`ctx.fs.resolve(path)` + `ctx.fs.readText(target)`. Paths must be absolute.

### If you must re-author a single tool instead

Only when the bundle file is missing or broken. `cordis_define` with `kind=new` and
`idPrefix=pony`, host-only, single composite tool, then `cordis_run`. If the bundle DOES
exist but the loader failed, the failure is in the loader or a name collision — not evidence
that the source is gone. Read the source path first; do not conclude it is absent from a
failed run.

Rebuild the bundle after editing any `packages/*.js` original:
`node /home/fares/Projects/deepseek-harness/.agents/skills/dyno-pony/scripts/merge-plugins.cjs`

## Schema contract for `harness.defineTool` — VERIFIED 2026-09-18

The two halves are NOT symmetric, and getting them backwards costs ~3 failed
`cordis_run` attempts per restart. Every line below was tested by calling the real
`sandboxDefineTool` (`@deepseek-ai/dsh-cordis-host-runner/lib/types/guard.js`), not inferred.

`parameters` accepts **two mutually exclusive forms** — the rules INVERT between them, which
is what makes this so easy to get wrong. Pick one and stay in it; mixing them is the failure.

**(a) Direct DSL — a bare property map (what this plugin uses):**

```js
parameters: {
  action: { type: 'string', enum: ['a', 'b'], required: true },  // ✓ required is PER-PROPERTY
  target: { type: 'string' },
}                                       // ← no `type`, no `properties`, no `required` array
```
- per-property `required: true` ✓ · `required: false` → `must be true when present`
- omission is how a property becomes optional. All-required is fine but not mandatory.

**(b) Raw JSON-Schema wrapper — `type: 'object'` + `properties`:**

```js
parameters: {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['a', 'b'] },   // ← NO required here
    target: { type: 'string' },
  },
  required: ['action'],          // ✓ required-ness is declared HERE, by name
  // additionalProperties: false // ✗ throws "must be true or omitted"
}
```
- per-property `required: true` → `parameters.X.required belongs to the containing raw object schema`
- root `additionalProperties: false` → `must be true or omitted because the implicit parameter root is open`
- a root `required` name that no property declares → `names undeclared property "X"`

Both forms normalize to the same JSON Schema, so choose by taste — (a) for a flat tool,
(b) when nesting. The rejected variants above are verified error text, not paraphrase.

**`output.schema` — per-property `required: true` and explicit `additionalProperties`:**

```js
output: {
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', required: true },   // ✓ the mirror image of parameters
      body:  { type: 'string', required: true },
    },
    additionalProperties: false,   // ✓ MANDATORY: must be explicitly true or false
  },
  render(args, value) {
    return [{ type: 'text', text: value.title + '\n\n' + value.body }]
  },
}
```
- omitting `additionalProperties` → `schema.additionalProperties must be explicitly true or false`
- a root-level `required` array here → `schema.required is not supported by the value schema DSL`

`output.render(args, value)` is mandatory and must return an **array** of content blocks.

**Validate your shape before a `cordis_run` attempt** (catches all of the above in one shot):

```bash
node --input-type=module -e '
const { sandboxDefineTool } = await import(
  "/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-cordis-host-runner/lib/types/guard.js")
try {
  sandboxDefineTool({ name: "x", description: "d", execute: async () => ({}), parameters, output })
  console.log("schema OK")
} catch (e) { console.log("THROWS:", e.message) }'
```

This validation runs at `cordis_run` (apply) time, not at `cordis_define` — a define that
returns success can still fail on its first run.

## Deactivating

`cordis_stop pluginId=<current pony pluginId>` removes the tool from the registry.

## Source of truth

- Bundle source: `~/Projects/deepseek-harness/.agents/skills/dyno-pony/packages/dyno-pony.js`
  (merged, 38 tools). Present locally — verified 2026-09-18.
- This tool's original source: `.../packages/pony.js` (8517 bytes) — also present locally,
  kept for diffing against the merged file. Both exist; an earlier version of this file
  wrongly claimed `pony.js` was missing.
- Merge script: `.../dyno-pony/scripts/merge-plugins.cjs`.
- `.../dyno-pony/rebuild.sh` documents the rebuild steps (it is documentation, not executable
  recovery — the `cordis_define`/`cordis_run` calls must be issued by the assistant).

## Upstream

github.com/DietrichGebert/ponytail (MIT, 120K stars). Local additions: AR description, single composite tool, soft call-count note.
