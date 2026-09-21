# PROTECTED — dyno-pony

> **What this file is:** the local declaration of what may never be edited in place here, and the
> one command that proves the tree is alive and true. It is the authoritative detail for this
> project; `~/CONSTITUTION.md` §2 is the umbrella index. Project law wins over the index.
> **Owner:** Fares. **Language:** artifacts English, chat Arabic (E8).

## Protected (do not edit in place)

| Path | Why | Enforced by |
|---|---|---|
| `packages/dyno-pony.js` | **Generated** by `scripts/merge-plugins.cjs` — a hand edit is lost on the next rebuild | the merge script + oracle |
| `tests/preflight.test.cjs` | The oracle. A red line means the docs are lying — fix the red line, not the test (E2) | preflight itself |
| `scripts/counts.cjs` | The one derivation home for the headline counts — a wrong number here would make every document lie | preflight (cross-checks it against its own mounted bundle) |
| `~/.dsh/skills/**`, `~/.dsh/dyno-pony/**` | Runtime **deployment**, not source. Live fixes flow back with `scripts/collect.sh --apply` (E3) | install/collect scripts |
| `~/.agent-presets/**` | Mounting a preset is a composition decision, not a file edit (kept explicit and reversible) | install.sh refuses to install presets |
| Runtime skills with no repo home | One copy, no git history, no backup — deleting or overwriting them is unrecoverable | `scripts/collect.sh` prints every one it finds |
| `~/.dsh/plugins/**`, `~/.dsh/dspy-lab/**` | Source for the runtime bundles that `fallback-chain`, `webchain`, `model-dashboard` and `dspy-lab` document — again one copy, no history | nothing yet; there is no gate over this path |
| Upstream-derived code + attribution (`ponytail` MIT, `caveman` MIT) | A fork change still respects the upstream license and attribution | `README.md` §Provenance |

## The gate

```
node --test tests/preflight.test.cjs   # alive + true: bundle parses, the mounted tool set matches
                                       # the derived count, schemas pass the real host guard,
                                       # rebuild.sh's numbers match disk, docs agree with disk
node --test tests/*.test.cjs           # full suite (the runner prints its own count)
```

Run preflight before every ship, after every restart, and after every doc edit. A green run result
alone is not evidence that the tool list is right — verify with `cordis_inspect_query Tool listTools`.

## Safe write-path

`packages/*.js` originals · `dynamic-skills/` · `skills/` · `docs/` · `scripts/` · `rebuild.sh` ·
`README.md` · `AGENT-ERGONOMICS.md` · `CHANGELOG.md`.

## Local laws that bind any edit here

- **E1** — the entry point tells the truth or it does not exist; an unverifiable claim marks itself `unverified`.
- **E5** — never pin a process-local identity (plugin/package/run ids) in a durable document.
- **E6** — counters are derived, never hardcoded.
- **E3** — the repo is the source of truth; the runtime is a deployment.
- **E9** — a check proves it ran: a floored count taken from outside its own code, or it reports nothing. Full entry in `AGENT-ERGONOMICS.md`.

## Counts are derived, never remembered (E6)

`scripts/counts.cjs` is the single place the headline counts come from: the mounted bundle for
tools and sections, the merger's ORDER manifest for sources, `dynamic-skills/` for skills,
`~/.agent-presets/` for presets. `rebuild.sh` prints what it derives, and the oracle runs that
script and compares every number against disk — so a stale count in an entry point turns the gate
red instead of surviving quietly.

Rot fixed 2026-09-21: `rebuild.sh` had stated **34 tools / 10 skills / 4 presets** since the merge
(the real state was 38 / 14 / 6) and pinned the process-local `dp-1` plugin id, which is dead after
any restart. Nothing checked it; now the oracle does.

Divergence fixed 2026-09-21: a compression pass on 2026-09-20 shortened **33 skills in the runtime
only** (−32%, ~49 KB) and git never saw it, because `collect.sh` covered `dynamic-skills/` but not
`skills/`. An `install.sh` run would have deleted all of it. Both trees are collected now and the
script reports runtime-only skills, which have one copy and no history.

The five skills that had no repo home were adopted the same day (`dspy-lab`, `fallback-chain`,
`model-dashboard`, `openresearch`, `webchain`), each with the frontmatter `skills/` requires. Their
code still lives only under `~/.dsh/` — see the table above.

## If you believe a protected file must change

Do not edit it. Change the generator (`merge-plugins.cjs`) or the flow (`collect.sh`), then re-run
the gate. For an id or a count, fix the source that derives it — never the pinned artifact.
