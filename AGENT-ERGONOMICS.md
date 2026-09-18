# Agent Ergonomics — designing dyno-pony for the agent driving it

Status: implemented principles + open design ledger. Written 2026-09-18, the session that
revived the arsenal after it died, and had to fight the system's own documentation to do it.
Every principle below is grounded in a failure that actually happened, with the cost measured.
Nothing here is aspiration; it is scar tissue, organized.

## The one-sentence thesis

**An agent drives a system well when the system tells the agent the truth faster than the
agent can discover it.** Ergonomics here is not aesthetics — it is the ratio of
`(verified understanding gained)` to `(tool calls + tokens spent)`.

## What it cost to drive this system, measured

| # | Failure | Cost that session | Root cause |
|---|---|---|---|
| P1 | 38 tools vanish on every DSH restart; recovery recipe prescribed dead `kind=existing` IDs | 13 skills unrecoverable by their own docs | IDs are process-local but docs pinned them |
| P2 | `harness.defineTool` schema contract documented INVERTED | 3 failed `cordis_run` + 4 defines | `parameters` and `output.schema` are mirror images; docs conflated them |
| P3 | Entry tower (README) claimed "10 plugins, 42 tools, presets simple/pony-mode" — none real | ~8 discovery calls to learn reality was 38 tools, 1 merged plugin, no such presets | README written pre-merge, never reconciled |
| P4 | `ultimate` status reports 37; registry holds 38 | live disagreement between two system surfaces | hardcoded counter, never derived from registry |
| P5 | Skill docs claimed the bundle source "is not present locally" — it was, 139 KB, on disk | nearly triggered a full hand-rewrite of 38 tools | a stale negative claim nobody ever re-verified |
| P6 | Plugin skills' canonical home was the runtime dir (`~/.dsh/skills`) — unversioned | every live fix was one update away from vanishing | repo/deployment relationship never made explicit |
| P7 | Loader used one absolute path into a foreign repo | breaks on repo move, fresh clone, or update | no path candidates, no deploy step |

The pattern across all seven: **the system's records were stale or false, and nothing
mechanical detected it.** The agent is the only part of this system that reads everything —
so every lie costs tool calls the agent pays out of its context budget.

## Principles (the tower, top-down)

### E1 — The entry point tells the truth, or it does not exist

One README is the tower: verified current state → where everything lives → the ONE recovery
path → the ONE verification command. Everything else links from it. A doc that cannot be
verified mechanically must mark itself `unverified`. (P3, P5)

### E2 — One oracle: green means "alive and true"

`node --test tests/preflight.test.cjs` asserts, against the REAL host guard: the bundle
parses, defines exactly 38 tools, every schema passes, the canonical skills exist, no skill
pins a dead recovery recipe, and the README's named paths exist on disk. Run it before
every ship, after every restart, after every doc edit. If the oracle is red, the docs are
lying — fix the red line, not the test. (P2, P3, P4, P5)

### E3 — The repo is the source of truth; the runtime is a deployment

Canonical lives in this repo: `packages/` (source), `dynamic-skills/` (the 14 plugin skills),
`docs/`, `tests/`. The runtime (`~/.dsh/skills`, `~/.dsh/dyno-pony/`) is produced by
`scripts/install.sh`. When a live session fixes a skill, `scripts/collect.sh --apply` flows
the fix back into git. Fixes accrete or they evaporate — there is no third option. (P6)

### E4 — Recovery is three tool calls, printed verbatim

Restart → tools gone. Recovery is: `cordis_define` (loader, ~700 bytes) → `cordis_run` →
verify with `Tool listTools`. The loader reads the bundle from disk (path candidates:
`~/.dsh/dyno-pony/` deployed copy → `~/Projects/dyno-pony/` canonical → legacy harness
checkout). The recipe lives in README §Recovery and in no other form — every skill points
at it rather than restating it, so there is exactly one thing to keep true. (P1, P7)

### E5 — Never pin a process-local identity in a durable document

Plugin/package/run IDs are minted per session. Any doc that says `pluginId=pony-48` is
writing a lie with a timestamp. Durable docs name *things on disk* (paths, tool names,
counts) and let the session discover its own IDs via `cordis_inspect_self`. (P1)

### E6 — Counters are derived, never hardcoded

Any surface that reports "N tools" must derive N from what it actually registered. A
hardcoded 37 next to a registry holding 38 is a small lie that teaches the agent to distrust
all counts. (P4 — open: `ultimate`'s arsenal counter still hardcodes; see ledger)

### E7 — Contract asymmetry gets documented as asymmetry

`parameters` and `output.schema` look symmetric and are not: the first takes a root
`required` array (raw wrapper) or per-property `required: true` (direct DSL); the second
takes per-property `required: true` and MANDATES explicit `additionalProperties`. Documents
must show both valid forms side by side with the exact error text of the rejected shapes,
and the preflight test must keep the asymmetry true in code. (P2)

### E8 — Arabic for the human, English for the record

Chat with Fares is Arabic; durable artifacts (docs, code, commit bodies) are English. Both
are legitimate; mixing them inside one artifact halves the legibility of each. (repo-wide)

## The operating cycle this enables

```
VERIFY   node --test tests/preflight.test.cjs        # alive + true?  (~1s, no DSH needed for most)
DRIVE    work the task; the arsenal is mounted       # 38 tools, one loader
ACCRETE  scripts/collect.sh --apply && git commit    # live fixes land in git
SHIP     node --test && scripts/install.sh && push   # verified, deployed, versioned
```

Four verbs, each one command. An agent arriving cold reads only the README and can do all four.

## Open ledger (next accretions, in cost order)

1. **E6 violation live:** `ultimate`'s `totalTools` is a build-time constant (37) that
   disagrees with the registry (38). Derive it from the captured tool list at mount time.
2. **Deployment-as-default:** an agent preset row (or profile bundle) that mounts the loader
   at session start would collapse E4 from three calls to zero. Blocked on a composition
   decision Fares owns (host-plane vs preset-plane — see `editing-cordis-compositions` skill,
   "decide the plane first").
3. **Skill frontmatter linter:** a test that parses each SKILL.md's `actions:` list and
   asserts every named action exists in the bundle's tool. Catches doc rot at the seam
   between skills and source.
4. **Version single-source:** `package.json` version should be the only version literal;
   README/CHANGELOG cite it rather than restating it.
