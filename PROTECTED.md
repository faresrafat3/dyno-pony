# PROTECTED — dyno-pony

> Local declaration of what's uneditable here + the one command proving the tree alive/true. `~/CONSTITUTION.md` §2 = umbrella index; project law wins. **Owner:** Fares. **Language:** artifacts English, chat Arabic (E8).

## Protected (do not edit in place)

| Path | Why | Enforced by |
|---|---|---|
| `packages/dyno-pony.js` | **Generated** by `scripts/merge-plugins.cjs` — a hand edit is lost on the next rebuild | the merge script + oracle |
| `tests/preflight.test.cjs` | The oracle. A red line means the docs are lying — fix the red line, not the test (E2) | preflight itself |
| `scripts/counts.cjs` | Single derivation home for headline counts — a wrong number makes every document lie | preflight (cross-checks vs mounted bundle) |
| `~/.dsh/skills/**`, `~/.dsh/dyno-pony/**` | Runtime **deployment**, not source. Live fixes flow back with `scripts/collect.sh --apply` (E3) | install/collect scripts |
| `~/.agent-presets/**` | Mounting a preset is a composition decision, not a file edit (kept explicit and reversible) | install.sh refuses to install presets |
| Runtime skills with no repo home | One copy, no history, no backup — deleting/overwriting = unrecoverable | `scripts/collect.sh` lists all found |
| `~/.dsh/plugins/**`, `~/.dsh/dspy-lab/**` | Source for runtime bundles documented by `fallback-chain`/`webchain`/`model-dashboard`/`dspy-lab` — one copy, no history | no gate over this path yet |
| Upstream-derived code + attribution (`ponytail` MIT, `caveman` MIT) | A fork change still respects the upstream license and attribution | `README.md` §Provenance |

## The gate

```
node --test tests/preflight.test.cjs   # alive + true: bundle parses, the mounted tool set matches
                                       # the derived count, schemas pass the real host guard,
                                       # rebuild.sh's numbers match disk, docs agree with disk
node --test tests/*.test.cjs           # full suite (the runner prints its own count)
```

Run preflight before every ship/restart/doc-edit. Green run ≠ tool-list proof — verify via `cordis_inspect_query Tool listTools`.

## Safe write-path

`packages/*.js` originals · `dynamic-skills/` · `skills/` · `docs/` · `scripts/` · `rebuild.sh` · `README.md` · `AGENT-ERGONOMICS.md` · `CHANGELOG.md`.

## Local laws that bind any edit here

- **E1** — the entry point tells the truth or it does not exist; an unverifiable claim marks itself `unverified`.
- **E5** — never pin a process-local identity (plugin/package/run ids) in a durable document.
- **E6** — counters are derived, never hardcoded.
- **E3** — the repo is the source of truth; the runtime is a deployment.
- **E9** — a check proves it ran: a floored count taken from outside its own code, or it reports nothing. Full entry in `AGENT-ERGONOMICS.md`.

## Counts are derived, never remembered (E6)

`scripts/counts.cjs` = single headline-count source: mounted bundle (tools/sections), merger ORDER (sources), `dynamic-skills/` (skills), `~/.agent-presets/` (presets). `rebuild.sh` prints derivations; oracle compares every number vs disk — stale count turns gate red, never survives quietly.

Rot fixed 2026-09-21: `rebuild.sh` stated **34 tools / 10 skills / 4 presets** since merge (real: 38/14/6) + pinned process-local `dp-1` id (dead after restart). Nothing checked it; oracle does now.

Divergence fixed 2026-09-21: 2026-09-20 compression shortened **33 runtime-only skills** (−32%, ~49 KB), git never saw it (`collect.sh` covered `dynamic-skills/`, not `skills/`). An `install.sh` run would have deleted all of it. Both trees collected now; script reports runtime-only skills (one copy, no history).

Five homeless skills adopted same day (`dspy-lab`, `fallback-chain`, `model-dashboard`, `openresearch`, `webchain`), each with `skills/` frontmatter. Code still lives only under `~/.dsh/` — see table.

## If you believe a protected file must change

Do not edit it. Change the generator (`merge-plugins.cjs`)/flow (`collect.sh`), re-run the gate. Ids/counts: fix the deriving source — never the pinned artifact.
