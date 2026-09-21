# Changelog

All notable changes to the dyno-pony arsenal. English only (E8: Arabic is for chat,
English for the record).

## [Unreleased] — 2026-09-21

### Fixed
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
