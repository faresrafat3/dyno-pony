---
name: ts-deep-modules
description: Wire dependency-cruiser into a TypeScript repo so each package is a deep module — implementation hidden in subfolders, reachable only through its entry-point files at the package root. Use when the user has a TypeScript repo with multiple packages and wants to enforce the deep-module discipline structurally.
whenToUse: "(1) Detect package manager + packages root. (2) Install dependency-cruiser as devDep. (3) Write .dependency-cruiser.cjs with four rules (entry boundary, intra-package freedom, tests-via-entry, no cycles). (4) Wire `lint:boundaries` into umbrella check. (5) Scaffold example package. (6) Prove rules bite (deliberate deep import must fail)."
metadata:
  category: engineering
  scope: boundaries
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, setup-ts-deep-modules)
---

# TS Deep Modules

Each package = **deep module**: behavior behind small interface. Public surface = **entry points** (root files); subfolders hidden. Installs `dependency-cruiser` + rules making entry points the only way in, then proves they bite. Vocabulary: `domain` skill Part 2.

## Shape

```
src/packages/
  <name>/
    index.ts        ← entry point (public; import from outside)
    client.ts       ← SEVERAL entry points allowed
    lib/            ← hidden impl, free mutual imports
    tests/          ← co-located tests + fixtures (private)
```

Surface = root files (no blessed `index.ts`); convention `lib/`+`tests` per package. General: *any subfolder = private* — never extend config per folder.

## Four rules, all `error`

1. **Boundary** — outsiders import root files only, never subfolders. 2. **Intra-package freedom** — own files import freely. 3. **Tests via entry points** — `<pkg>/tests/` takes any package's entry points + own fixtures, never subfolder internals (even own); cross-package integration ok, deep imports not. 4. **No cycles.**

## Steps

### 1. Detect

**Manager**: `pnpm-lock.yaml`→pnpm, `yarn.lock`→yarn, `bun.lockb`→bun, else npm. **Root**: `src/`→`src/packages` else `packages` (confirm on other conventions). **Config**: `.dependency-cruiser.*` exists → merge four rules + options, report additions; never overwrite. **Done:** all three known.

### 2. Install

devDependency via detected manager. **Done:** listed in `devDependencies`.

### 3. Config

Repo-root `.dependency-cruiser.cjs` with `PACKAGES_ROOT` from step 1 (path-depth/extension-agnostic; nothing else adapts). **Done:** correct root + four forbiddens.

### 4. Wire checks

`lint:boundaries`: `depcruise <packages-root>` (or `depcruise src`) folded into typecheck's umbrella command. Never touch `tsconfig`/aliases. No umbrella → add script, tell user to CI it. **Done:** runs with typecheck.

### 5. Example package

Committed `<packages-root>/example/` template: `index.ts` delegates to internal file (visibly *deep*); `lib/impl.ts` unreachable outside; `tests/example.test.ts` imports only `../index`. Copy or delete. **Done:** behavior via root entry, `impl` hidden.

### 6. Prove it bites (whole-skill criterion)

Clean `lint:boundaries` → **pass**; add `import { thing } from "../lib/impl"` to test → **fail** (`tests-through-entrypoints`); revert → **pass**. No fail = miswired; fix first. **Done:** pass→fail→pass observed.

### 7. Document

`<packages-root>/README.md`: layout, "import only via root entry points", `lint:boundaries` run, **no barrels**. Pointer from `CLAUDE.md` (else `AGENTS.md`). **Done:** README + anti-barrel + link.

## Notes

`$1` back-refs let packages reach own internals, outsiders can't. Public/private = **depth**. Packages **flat** (one tier; internals nest; no nested packages). `.cjs` not `.js` for `module.exports` under `"type": "module"`.
