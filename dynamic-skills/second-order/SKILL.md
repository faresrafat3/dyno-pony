---
name: second-order
description: >
  Think one step past the change. One composite tool with 3 actions: `trace`
  (1-2 hop causal chain), `blast` (who/what breaks — callers, tests, docs,
  sessions, future-Fares), `gate` (single GO/HOLD/REDESIGN verdict + one
  reason). Self-activates on hard-to-undo actions (delete, schema, dep,
  preset edit, shared-merge, public-doc, ship). Anti-pony default: pony
  says "don't build"; second-order says "build, but see what happens".
  Pairs with pony, vet, audit. Off with "stop second-order".
whenToUse: "Use when the model is about to do something irreversible — file deletion, schema change, dep add, preset edit, shared merge, public doc, or a publish/release/deploy action — and 15+ turns have passed since the last check."
metadata:
  pluginId: so-1 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-1
  preset: sentinel-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [trace, blast, gate, heuristic, help]
---

# Second-order — think past the change

A Dynamic Cordis plugin (pluginId `so-1`, packageId `pkg-1`). One tool: `second_order`.

## What this skill does

Forces the model to walk one step past the change before committing.
Three actions + a heuristic card + a help card:

- `trace(change)` — walk the causal chain 1-2 hops from the proposed change
- `blast(change, [scope=workspace])` — enumerate callers, tests, docs, sessions, future-Fares
- `gate(change, reason)` — single GO / HOLD / REDESIGN verdict with one reason
- `heuristic()` — show the trigger rule + quiet gate state
- `help()` — quick reference card

## The 7 hard-to-undo triggers (do not add more — false positives)

| Class | Regex | Why it counts |
|---|---|---|
| delete | `rm`, `unlink`, `file_remove`, `trash` | removal of a tracked file is hard to recover |
| schema | `migrate`, `alter table`, `drop column`, `addColumn`, `prisma.schema` | schema changes cascade to every reader |
| dependency | `pnpm add`, `npm install --save`, `yarn add` | a new dep is forever in the lockfile |
| preset-edit | `cordis_define`, `cordis_undefine`, `cordis_stop`, `agent.cordis.yml` | preset changes inherit to the next session |
| shared-merge | `git push origin main|master|develop`, `gh pr merge` | merge to a shared branch is visible to everyone |
| public-doc | `README.md`, `CHANGELOG`, `docs/`, `AGENTS.md` | public-facing docs are read outside this session |
| public-facing | `ship`, `publish`, `release`, `deploy` | an outbound action is hard to retract |

## Quiet gate

Fire only if **15+ turns have passed** since the last second-order check.
This prevents over-firing on benign edits within a single tight task.

## Anti-pony default (the contract)

- `ponytail(mode=ultra)` — "does this need to exist? → if no, skip." (stops at rung 1)
- `second-order` — "this exists, now what happens next?" (goes one rung past)

They stack, not compete. After pony says "build it", second-order says
"build it, but see what happens".

## When to use

- Right before a delete / schema / dep / preset / merge / public-doc / ship action
- Whenever the model catches itself about to mutate something it cannot undo in 5 minutes

## When NOT to use

- For benign edits (rename, refactor, format, docstring)
- For read-only operations
- Within 15 turns of the last check (the quiet gate enforces this)

## Deactivate

`stop second-order` / `normal mode`. Tool is one composite, no separate toggle.

## Pairing

- `ponytail` — "does this need to exist?" (stop before rung 1)
- `vet` / `audit` — surface-specific correctness reviews
- `sphinx` — orthogonal, fires on budget counters not on causality
- `drift` — orthogonal, fires on linguistic fossils not on causality

## Verdict format (gate)

```
verdict: <GO|HOLD|REDESIGN>
reason: <one line, the deciding fact>
```

Never hedge. Two reasons = pick the strongest one and drop the other.
