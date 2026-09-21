---
name: ponytail
description: >
  Lazy senior dev mode (وضع المطور الكسلان الذكي). Use before writing code, when reviewing changes,
  or when the user says "ponytail", "lazy mode", "simplest solution", "minimal", "yagni", "do less",
  "shortest path", or complains about over-engineering, bloat, boilerplate, or unnecessary
  dependencies. Stops at the first rung that holds (YAGNI → reuse → stdlib → native → dep → one-liner
  → minimum). NOT for non-coding requests. Fork of github.com/DietrichGebert/ponytail
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

One of 38 tools in merged **dyno-pony** dynamic Cordis plugin. Process-local: vanishes on DSH restart; source persists on disk, so recovery = reload, not re-authoring. See Activating.

## What this skill does

**WHAT to build.** Stop at first rung that holds:

1. Need it? (YAGNI)
2. In codebase? Reuse.
3. Stdlib? Use it.
4. Native platform? Use it.
5. Installed dep? Use it.
6. One line? One line.
7. Else minimum working code.

Plus: no unrequested abstractions, delete over add, boring over clever, shortest working diff.

## Tools and actions

| Action | Effect |
|---|---|
| `ponytail(action="mode", level="lite")` | Build as asked; name lazier alternative in one line. |
| `ponytail(action="mode", level="full")` | Ladder enforced. **Default.** |
| `ponytail(action="mode", level="ultra")` | YAGNI extremist. Challenge requirements first. |
| `ponytail(action="review", target="...")` | One-line over-engineering review. Not correctness. |
| `ponytail(action="audit", target="...")` | Whole-repo audit, biggest cut first. |
| `ponytail(action="debt", target="...")` | Harvest `ponytail:` comments into ledger. |
| `ponytail(action="gain")` | Published benchmark medians, not per-repo. |
| `ponytail(action="help")` | Quick reference. |

## When to use

- "ponytail" / "lazy mode" / "simplest" / "minimal" / "yagni" / "do less".
- Over-engineering, bloat, boilerplate, needless-dependency complaints.
- Review/audit for over-engineering; minimum working code.

## When NOT to use

- Non-coding (knowledge, prose, translation, recipes).
- Correctness / security / performance review (out of scope; normal review).

## Activating this skill — PREFER THE LOADER (verified 2026-09-18)

Whole arsenal on disk; one ~700-byte loader restores all 38 tools incl. `ponytail`. Never hand-re-author one unless bundle unavailable.

Source of truth: `~/Projects/dyno-pony/packages/dyno-pony.js` (one `apply()`, one disposer; counts derived by `scripts/counts.cjs`).

**Step 1 — stop any holder of a tool name.** Bundle registers all 38; a standalone copy collides (`tool "X" is already registered`) and load fails:

```
cordis_inspect_self                     # list session plugins
cordis_stop pluginId=<holder>           # keeps packages for rollback
```

**Step 2 — define loader** (`kind=new`, idPrefix `dyno`). Recipe lives in repo README §Recovery (`~/Projects/dyno-pony/README.md`), never restated here. Shape: ~700 bytes, `inject: ['fs']`, reads bundle at apply time from first existing candidate (`~/.dsh/dyno-pony/...` deployed → `~/Projects/dyno-pony/...` canonical → legacy checkout), evals via `new Function('harness','ctx',body)`, calls `inner.apply(ctx)`.

**Step 3 — `cordis_run`** returned pluginId/packageId with mode=run.

**Step 4 — verify.** `cordis_inspect_query Tool listTools` must show all 38 names. Run result alone proves nothing.

### Why the loader works

Sandbox exposes `Function`, `eval`, `require`; `process` is `undefined`. `inject: ['fs']` gives `ctx.fs.resolve(path)` + `ctx.fs.readText(target)`. Paths absolute.

### If you must re-author a single tool instead

Only if bundle file missing/broken. `cordis_define` `kind=new`, `idPrefix=pony`, host-only, single composite tool, then `cordis_run`. Loader failure with bundle present = loader bug or name collision, not missing source. Read source path first.

Rebuild after editing `packages/*.js`: `node ~/Projects/dyno-pony/scripts/merge-plugins.cjs`

## Schema contract for `harness.defineTool` — VERIFIED 2026-09-18

Halves NOT symmetric; backwards = ~3 failed `cordis_run`s per restart. Tested against real `sandboxDefineTool` (`@deepseek-ai/dsh-cordis-host-runner/lib/types/guard.js`).

`parameters` takes **two mutually exclusive forms** — rules INVERT. Pick one; mixing fails.

**(a) Direct DSL — bare property map (this plugin):**

```js
parameters: {
  action: { type: 'string', enum: ['a', 'b'], required: true },  // ✓ per-property
  target: { type: 'string' },
}                                       // ← no `type`/`properties`/`required` array
```
- `required: true` ✓ · `required: false` → `must be true when present`. Omission = optional.

**(b) Raw JSON-Schema wrapper — `type: 'object'` + `properties`:**

```js
parameters: {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['a', 'b'] },   // ← NO required here
    target: { type: 'string' },
  },
  required: ['action'],          // ✓ required-ness HERE, by name
  // additionalProperties: false // ✗ throws "must be true or omitted"
}
```
- Per-property `required: true` → `belongs to containing raw object schema`. Root `additionalProperties: false` → `implicit parameter root is open`. Unknown root `required` name → `names undeclared property "X"`.

Both normalize to same JSON Schema; (a) for flat, (b) for nesting. Above errors are verbatim.

**`output.schema` — per-property `required: true` + explicit `additionalProperties`:**

```js
output: {
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', required: true },   // ✓ mirror of parameters
      body:  { type: 'string', required: true },
    },
    additionalProperties: false,   // ✓ MANDATORY
  },
  render(args, value) {
    return [{ type: 'text', text: value.title + '\n\n' + value.body }]
  },
}
```
- Missing `additionalProperties` → `must be explicitly true or false`. Root `required` array → `not supported by the value schema DSL`.

`output.render(args, value)` mandatory, must return **array** of blocks.

**Validate before `cordis_run`:**

```bash
node --input-type=module -e '
const { sandboxDefineTool } = await import(
  "/usr/lib/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai/dsh-cordis-host-runner/lib/types/guard.js")
try {
  sandboxDefineTool({ name: "x", description: "d", execute: async () => ({}), parameters, output })
  console.log("schema OK")
} catch (e) { console.log("THROWS:", e.message) }'
```

Validation runs at `cordis_run` (apply), not `cordis_define` — successful define can still fail first run.

## Deactivating

`cordis_stop pluginId=<current pony pluginId>` removes tool from registry.

## Source of truth

- Bundle: `~/Projects/dyno-pony/packages/dyno-pony.js` (merged; present, verified 2026-09-18).
- Original: `~/Projects/dyno-pony/packages/pony.js` (8517 bytes) — for diffing merged file. Earlier claim it was missing was wrong.
- Merge: `~/Projects/dyno-pony/scripts/merge-plugins.cjs`.
- `~/Projects/dyno-pony/rebuild.sh` = rebuild docs, not executable recovery (assistant issues `cordis_define`/`cordis_run`).

## Upstream

github.com/DietrichGebert/ponytail (MIT, 120K stars). Local: AR description, single composite tool, soft call-count note.
