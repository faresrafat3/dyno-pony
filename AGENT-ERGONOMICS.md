# Agent Ergonomics — designing dyno-pony for the agent driving it

Status: implemented principles + open design ledger. Written 2026-09-18 by the session that revived the arsenal after it died — fighting the system's own documentation to do it. Every principle is grounded in a measured failure: scar tissue, organized, not aspiration.

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

The pattern across all seven: **records were stale or false and nothing mechanical detected it.** The agent reads everything — every lie costs it tool calls out of its context budget.

## Principles (the tower, top-down)

### E1 — The entry point tells the truth, or it does not exist

One README is the tower: verified state → where everything lives → the ONE recovery path → the ONE verification command; everything else links from it. Unverifiable docs mark themselves `unverified`. (P3, P5)

### E2 — One oracle: green means "alive and true"

`node --test tests/preflight.test.cjs` asserts, against the REAL host guard: the bundle parses, defines exactly 38 tools, every schema passes, canonical skills exist, no skill pins a dead recovery recipe, README's named paths exist. Run before every ship/restart/doc-edit. Oracle red = docs lying — fix the red line, not the test. (P2, P3, P4, P5)

### E3 — The repo is the source of truth; the runtime is a deployment

Canonical lives here: `packages/` (source), `dynamic-skills/` (14 plugin skills), `docs/`, `tests/`; the runtime (`~/.dsh/skills`, `~/.dsh/dyno-pony/`) is produced by `scripts/install.sh`. Live fixes flow back into git via `scripts/collect.sh --apply`. Fixes accrete or evaporate — no third option. (P6)

### E4 — Recovery is three tool calls, printed verbatim

Restart → tools gone. Recovery: `cordis_define` (loader, ~700 bytes) → `cordis_run` → verify with `Tool listTools`. Loader reads the bundle from disk (candidates: `~/.dsh/dyno-pony/` deployed → `~/Projects/dyno-pony/` canonical → legacy harness checkout). The recipe lives in README §Recovery only — every skill points at it instead of restating it: exactly one thing to keep true. (P1, P7)

### E5 — Never pin a process-local identity in a durable document

Plugin/package/run IDs are minted per session; a doc saying `pluginId=pony-48` is a lie with a timestamp. Durable docs name *things on disk* (paths, tool names, counts); sessions discover their own IDs via `cordis_inspect_self`. (P1)

### E6 — Counters are derived, never hardcoded

Any "N tools" surface must derive N from what it actually registered; a hardcoded 37 next to a 38-holding registry teaches the agent to distrust all counts. (P4)

The sandbox `ctx` hands every host half a read-only registry façade — `ctx.tools.schemas()` (`guard.js`), reachable with no `inject` — so derivation is available where the number is printed. `ultimate` reads its count there at call time and intersects it with declared names (`schemas()` also lists host tools); the merged bundle header is stamped by `scripts/merge-plugins.cjs` from what that run merged. No registry → the surface says `declared`, never an unmeasured number in measured font; a printed count names registry-missing items — a half-registered bundle reads like one.

### E7 — Contract asymmetry gets documented as asymmetry

`parameters` and `output.schema` look symmetric and are not: the first takes a root `required` array (raw wrapper) or per-property `required: true` (direct DSL); the second takes per-property `required: true` and MANDATES explicit `additionalProperties`. Docs show both valid forms side by side with rejected shapes' exact error text; preflight keeps the asymmetry true in code. (P2)

### E9 — A check proves it ran, or it is not a check

"0 failures" must mean "compared N things and they matched", never "compared nothing". Every printed count needs a floor from an input *outside the check's own code* — else check and expectation shrink together (tautology). No derivable floor → measure by running; grepping output miscounts (one `grep -c "^  ok"` said 18 where the real count was 12 — other helpers print that prefix too).

Four checks failed that test on 2026-09-21 — each found by breaking the thing it guards; none looked wrong from its own output:

- `skills-sprint4.test.cjs`: "pass: 0/0, fail: 0" and exit 0 against an empty `skills/`.
- Whole prose tree deletable with the suite still 176 pass / 0 fail (README Prose list checked disk→README only, never README→disk).
- Deleting a test file dropped the run 176→165 silently; emptying one →161. A file with no tests is a file that passes.
- `presets.test.cjs` silently `return`ed on a missing directory — reports PASS.

All four now carry floors or integrity checks, each re-tested against the same mutation.

### E8 — Arabic for the human, English for the record

Chat with Fares is Arabic; durable artifacts (docs, code, commit bodies) are English. Mixing them inside one artifact halves each one's legibility. (repo-wide)

## The operating cycle this enables

```
VERIFY   node --test tests/preflight.test.cjs        # alive + true?  (~1s, no DSH needed for most)
DRIVE    work the task; the arsenal is mounted       # 38 tools, one loader
ACCRETE  scripts/collect.sh --apply && git commit    # live fixes land in git
SHIP     node --test && scripts/install.sh && push   # verified, deployed, versioned
```

Four verbs, each one command. An agent arriving cold reads only the README and can do all four.

## Open ledger (next accretions, in cost order)

1. ~~**E6 violation live:** `ultimate`'s `totalTools` build-time constant (37) vs registry (38).~~
   **Closed 2026-09-21.** Count now read from the live registry (`ctx.tools.schemas()`) at call time, intersected with the declared arsenal; `declared` printed when nothing to measure. `tests/preflight.test.cjs` pins the declared list to the bundle's `EXPECTED_TOOLS`; `tests/ultimate.test.cjs` contradicts its source — eight assertions fail against the restored hardcode; deployed bundle re-checked after install.
2. **Deployment-as-default:** a preset row (or profile bundle) mounting the loader at session start collapses E4 from three calls to zero. Blocked on Fares's composition decision (host-plane vs preset-plane — `editing-cordis-compositions`, "decide the plane first").
3. **Skill frontmatter linter:** parse each SKILL.md's `actions:` list, assert every named action exists in the bundle's tools — catches doc rot at the skills/source seam.
4. **Version single-source:** `package.json` is the only version literal; README/CHANGELOG cite it.
