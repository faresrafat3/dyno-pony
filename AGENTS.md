# dyno-pony — the agent mode + skill arsenal for DSH

Fares-localized dynamic Cordis plugins, skills, and presets for the DeepSeek
Harness. Verified state: **1 merged plugin, 38 tools, 14 dynamic skills —
suite green.** Counts are derived from disk (`scripts/counts.cjs`) and
cross-checked by `tests/preflight.test.cjs` (+`rebuild.sh`); a stale number
turns the gate red. The oracle beats any prose line on disagreement.

## Contract

Global harness contract: `~/AGENTS.md` (permissions, single-source configs,
tools index). This file adds repo identity only — never contradicts it.

## Commands

```
npm test                # full suite (preflight included)
npm run test:preflight  # wiring gate
npm run test:count      # disk-vs-doc counts (test:count:update to refresh)
npm run merge           # merge plugin flow
npm run install         # install into the harness
./rebuild.sh            # rebuild after structural changes
```

## Map

- `packages/` · `dynamic-skills/` · `docs/` · `AGENT-ERGONOMICS.md` · `CHANGELOG.md`

## Rules

- suite green + counts fresh before claiming done; prose never overrules disk
- artifacts English; push everything (origin: faresrafat3/dyno-pony)
