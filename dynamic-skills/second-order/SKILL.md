---
name: second-order
description: >
  Think one step past the change. One tool, 3 actions: `trace`
  (1-2 hop causal chain), `blast` (who/what breaks), `gate` (GO/HOLD/REDESIGN
  + one reason). Self-activates on hard-to-undo actions (delete, schema, dep,
  preset edit, shared-merge, public-doc, ship). Anti-pony to pony's "don't
  build": "build, but see what happens". Off with "stop second-order".
whenToUse: "Use when the model is about to do something irreversible — file deletion, schema change, dep add, preset edit, shared merge, public doc, or a publish/release/deploy action — and 15+ turns have passed since the last check."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [trace, blast, gate, heuristic, help]
---
# Second-order — think past the change
Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). One tool: `second_order`. Walk one step past change before committing.
## Actions
- `trace(change)` — causal chain 1-2 hops · `blast(change, [scope=workspace])` — callers, tests, docs, sessions, future-Fares · `gate(change, reason)` — one GO/HOLD/REDESIGN + one reason · `heuristic()` — trigger rule + quiet-gate state · `help()` — reference
## 7 hard-to-undo triggers (do not add more — false positives)
| Class | Regex | Why |
|---|---|---|
| delete | `rm`, `unlink`, `file_remove`, `trash` | tracked removal, hard to recover |
| schema | `migrate`, `alter table`, `drop column`, `addColumn`, `prisma.schema` | cascades to every reader |
| dependency | `pnpm add`, `npm install --save`, `yarn add` | forever in lockfile |
| preset-edit | `cordis_define`, `cordis_undefine`, `cordis_stop`, `agent.cordis.yml` | inherits to next session |
| shared-merge | `git push origin main|master|develop`, `gh pr merge` | visible to everyone |
| public-doc | `README.md`, `CHANGELOG`, `docs/`, `AGENTS.md` | read outside session |
| public-facing | `ship`, `publish`, `release`, `deploy` | hard to retract |
## Quiet gate
Fire only if **15+ turns** since last check — no over-firing in one tight task.
## Anti-pony contract
`ponytail`: "need this? if no, skip" (rung 1). `second-order`: "exists — what next?" (one rung past). Stack, don't compete.
## When to use
Before delete/schema/dep/preset/merge/public-doc/ship; mutating the un-5-minute-undoable.
## When NOT to use
Benign edits; read-only; within 15 turns of last check.
## Deactivate
`stop second-order` / `normal mode`. One composite, no toggle.
## Pairing
`ponytail` pre-check · `vet`/`audit` correctness · `sphinx` budget · `drift` fossils.
## Verdict format
```
verdict: <GO|HOLD|REDESIGN>
reason: <one line, deciding fact>
```
No hedging — two reasons = keep strongest, drop other.
