# Changelog

All notable changes to the dyno-pony arsenal. English only (E8: Arabic is for chat,
English for the record).

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
