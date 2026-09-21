---
name: openresearch
description: >-
  Drive an OpenResearch (`orx`) research workspace from DSH — projects,
  git-native experiment tree, runs on local/remote compute, evidence, reports,
  figures and LaTeX papers. Use when the user wants research not code —
  paper reproduction, experiments/ablations, hyperparameter sweeps, literature
  review, preprint draft — or when `orx` is mentioned, or a `.openresearch/`
  directory or orx project is in play.
whenToUse: "Treat the session as a researcher, not a coder: edit code in the node worktree, drive `orx` for the experiment tree / runs / compute / evidence, and land artifacts as reports, figures and LaTeX rather than app code."
metadata:
  category: research
  scope: research
  upstream: alphaXiv/OpenResearch (MIT)
---

# OpenResearch from DSH

Local-first research workspace. CLI `orx` owns projects, experiment branches, runs, evidence in local git repo + DB. `orx up` serves dashboard `http://127.0.0.1:4791`.

**You are the research agent.** OpenResearch normally drives Claude Code/Codex/OpenCode/Cursor; here DSH plays that role: edit code in node worktree, call `orx` for tree/runs/compute.

## CLI ships its own manual — read it there, not from memory

`orx` embeds full module set, serves current text for your binary. **Never work from stale docs:**

```sh
orx skill                      # overview + module index
orx skill orx-experiment-tree  # one module
orx skill orx-compute/ssh      # one lazily-loaded resource
```

Load matching module **before** acting:

| Situation | Module |
|---|---|
| Tree, auto-research loop, post-run next step | `orx-experiment-tree` |
| Start project, add node, baseline/parent/run command | `orx-create` |
| Launch/monitor run, compute choice, OOM/stall/timeout | `orx-compute` |
| Read/edit/diff node code with git | `orx-git` |
| Stdout metrics, judging evidence | `orx-evidence` |
| Literature, papers, authors, prior art | `orx-lit-review` |
| Any plot/chart/figure | `orx-figures` |
| Paper/preprint as LaTeX | `orx-paper` |
| Durable reports/artifacts | `orx-reports` |
| Delegate to helper session | `orx-agent-delegation` |
| Reusable skills/LaTeX templates | `orx-customize` |
| Persistent standalone machines | `orx-instances` |

## Cardinal rules

Four silent-result-killers, not style. Full reasoning: `orx skill orx-experiment-tree`.

1. **Never edit a node once a run answered it.** Node freezes at first answering run — root incl. — permanently; disappointing result still counts. Before then: *provisional*. New idea → branch **child**, edit child.
2. **Run command + environment = one fixed contract.** Child inherits parent command verbatim. Never vary start commands per node or behaviour via env/env-prefix (`LR=3e-4 python ...`). Set once: `orx project edit <projectId> --run-command '<cmd>'`. Only **committed code/config** on node branch may differ.
3. **Vary code, not knobs-in-command.** Hyperparams in code/config files, one child per variant — same command over different code, comparable summaries.
4. **Grow downward, not sideways.** Small fan *within* a round, then **descend onto winner**. Root w/ long child row, no grandchildren = failure mode.

## Orientation, in order

```sh
orx projects                     # project ids
orx project view <projectId>     # tree; experiment ids here
orx skill orx-experiment-tree    # model + loop, before touching anything
orx runs <projectId>             # run ids, newest first
orx logs <runId>                 # evidence for one run
```

Ids scoped: project cmds take **project id**, experiment cmds **experiment id**, run cmds **run id**. Not interchangeable — take each from above command.

## Never mutate a frozen node

Tracked-code edit or `git commit` on answered-node branch destroys result→source mapping. Confirm provisional node before any write.

## Working with the user

Dashboard = product surface; **point user at it** (`http://127.0.0.1:4791`), don't narrate tree in chat:

```sh
orx up            # dashboard; --no-browser headless
```

Runs are long: launch detached, keep working; report run id + how to read evidence, don't block on training.
