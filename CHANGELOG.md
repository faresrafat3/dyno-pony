# Changelog

All notable changes to the dyno-pony arsenal. English only (E8: Arabic is for chat,
English for the record).

## [Unreleased] — 2026-09-21

### Changed
- **The documentation surface condensed** — README, AGENT-ERGONOMICS (145→91 lines) and 16 skill
  docs tightened with no semantic change (filler only; every fact, path, count and command kept).
  The workspace context-audit's declared document now sits inside its ceiling, and the runtime was
  redeployed from this repo (`bash scripts/install.sh`) — `collect.sh` reports "runtime and repo
  agree". Method + acceptance evidence: `~/local/context/2026-09-21-receipt-round4.md`.

### Added
- **CI, so the gate runs somewhere other than the author's machine** (`.github/workflows/verify.yml`,
  Node 22 + 26, push/PR). Two repo properties had to be fixed first, and both were real defects:
  (1) the suite was machine-dependent — 9 of 186 tests failed under an empty `HOME`, so no CI could
  ever run it; (2) the oracle requires the README's recovery recipe to name a bundle path that
  exists, and a runner checks out somewhere else. Fixes: `tests/fixtures/agent-presets/` is a
  committed **mirror** of `~/.agent-presets/` (still the canonical home — mounting a preset is a
  composition decision and `install.sh` refuses to write them), so `tests/presets.test.cjs` now
  validates the live presets when they exist, the mirror when they do not, and proves the two
  byte-identical on the owner's machine; the workflow symlinks its checkout onto
  `~/Projects/dyno-pony` so the recipe's canonical path resolves. The live-vs-mirror drift check
  skips *with its reason* where there is no live dir — reported, never a silent pass.
- **A check for the skills-to-source seam** (ledger item 3). Every dynamic `SKILL.md` declares
  its `actions:` and nothing verified them, so a renamed or dropped action would rot the doc
  silently while the model kept calling something that is not there. Where the skill's name IS a
  tool (caveman, drift, ponytail, second_order, sphinx, ultimate) the check demands exact
  agreement with that tool's action enum in **both** directions — a doc that forgets an action
  is as much rot as one that invents it. The group skills (codex to cdx_*, memo to memo_*, …)
  bind through a mapping that lives in prose, so there the check is that each named action
  exists somewhere in the bundle. A second test holds every `N tools` claim in a skill doc to
  the mounted count. It found no drift: all 14 skills resolve and both numeric claims were true,
  so the value is the detector — and each branch was proved by mutating what it guards.

### Fixed
- **`wf_compose` now emits safe JavaScript string literals for user-controlled values.** Newlines,
  quotes, and backslashes in task text, modes, labels, or workflow names could break the generated
  workflow or inject code. The source now uses `JSON.stringify`, and the merged bundle has a
  regression test that executes a hostile-shaped plan.
- **The merge script could print a tool count the bundle did not honour.** `allNames` counts the
  `name:` literals the sources *declare*, which is not what registers — a gated or skipped
  registration leaves its literal behind. A bundle with one tool unregistered still reported
  "total tools: 38", and because the generated header is stamped from that same number, the
  header would have stated it too. The merger now mounts what it just wrote (via `counts.cjs`,
  the one derivation home) and exits 1 when the two disagree. The oracle already caught this
  downstream; the build now fails at the source instead of printing a number it cannot back.
- **Four checks that passed without proving anything.** Each was found by breaking the thing it
  guards, and none of them looked wrong from its own output. `skills-sprint4.test.cjs` verified
  nothing and exited 0 against an empty `skills/` (floor: 24). The README's prose-skill list was
  checked disk→README only, so deleting all 24 prose skills left the whole suite at 176 pass /
  0 fail — the reverse direction is now asserted. The suite could not notice its own shrinkage:
  deleting a test file silently ran 165 tests instead of 176, and emptying one ran 161, because a
  file with no tests is a file that passes (now a test-file floor plus "every file declares tests
  or can fail"). `presets.test.cjs` `return`ed silently when its directory was missing, reporting
  PASS. The rule is recorded as **E9** in `AGENT-ERGONOMICS.md`.
- **`ultimate` reported a hardcoded tool count.** It said 37 while the registry held 38 — two
  surfaces of the same system disagreeing, which is P4 in `AGENT-ERGONOMICS.md` and the reason
  **E6** exists. The count is now read from the sandbox's read-only registry façade
  (`ctx.tools.schemas()`) at call time and intersected with the declared arsenal, so it follows
  what actually registered: hand it a registry holding three tools and it says three. Where no
  registry is reachable it says `declared` rather than printing an unmeasured number in the same
  font as a measured one, and anything the registry is missing is named rather than silently
  subtracted. The merged header's own `37 + 1 = 38` is now stamped by `scripts/merge-plugins.cjs`
  from what that run merged. `tests/preflight.test.cjs` pins the declared list to the bundle's
  `EXPECTED_TOOLS` and checks the header against the mounted count, so a drifted arsenal or a
  stale header fails the oracle; `tests/ultimate.test.cjs` hands the tool registries that
  contradict its source.

## [1.1.0] — 2026-09-18

The revival release. The arsenal died on a DSH restart and its own documentation fought
the recovery for ~20 tool calls. This release makes recovery cheap, makes the docs
machine-checkable, and makes live fixes accrete in git.

### Fixed
- **Inverted schema contract** in `dynamic-skills/ponytail/SKILL.md`: the documented
  `harness.defineTool` shapes were exactly the rejected ones. Both valid forms are now
  documented with literal error text, and kept true by executable assertions in
  `tests/preflight.test.cjs` (cost when wrong: 3 failed `cordis_run` + 4 defines).
- **Dead recovery recipes in 13 skills**: every dynamic skill prescribed
  `cordis_define kind=existing pluginId=<pinned>` — IDs that no longer exist after any
  restart (`no dynamic plugin ... in this process`). All 13 now point at the single
  loader recipe (README §Recovery).
- **False provenance claim**: ponytail's skill said the bundle source "is not present
  locally"; it was, at 139 KB / 2730 lines. Corrected; the path is now asserted by the
  preflight oracle so it cannot silently rot again.
- **Stale entry tower**: README claimed "10 plugins, 42 tools, presets simple/pony-mode/
  caveman-mode/baseline" — none verifiable. Replaced with the verified state (1 merged
  plugin, 38 tools, 14 dynamic skills) that the oracle checks.

### Added
- `tests/preflight.test.cjs` — the oracle: bundle mounts, exactly 38 tools, every schema
  passes the real `sandboxDefineTool` host guard, DSL-form regression assertions, canonical
  skills intact, no dead `kind=existing` recipes, README paths exist.
- `scripts/install.sh` — deploy bundle + skills from this repo to the runtime
  (`~/.dsh/dyno-pony/`, `~/.dsh/skills/`).
- `scripts/collect.sh` — flow live runtime skill fixes back into the repo (the accretion
  path; dry-run by default).
- `dynamic-skills/` — canonical, versioned copies of the 14 plugin skills. Previously the
  plugin skills' source of truth was the unversioned runtime dir, so every live fix was one
  DSH update away from vanishing.
- `AGENT-ERGONOMICS.md` — principles E1–E8 with the measured cost of each failure that
  produced them, plus the open design ledger.
- Path-resilient loader recipe (deployed copy → this repo → legacy harness checkout).

### Changed
- `package.json` → 1.1.0; npm scripts for test/merge/install/collect.

### Known open items
- `ultimate`'s arsenal counter hardcodes 37 while the registry holds 38 (E6 violation;
  first item in the ledger in AGENT-ERGONOMICS.md).

## [1.0.0] — 2026-09-04

Initial merged arsenal: 10 historical plugins (pony, caveman, orch, dsh-author, memo,
plugin-test, codex, memory, workflow, trace) combined into one `packages/dyno-pony.js` by
`scripts/merge-plugins.cjs`; sentinel plugins (sphinx, drift, second_order) and ultimate
folded in; 164 mount/conformance tests.
