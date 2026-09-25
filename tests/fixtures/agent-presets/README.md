# tests/fixtures/agent-presets — a copy, so it can rot

**What this is:** a committed mirror of the six agent presets, so `presets.test.cjs`
can verify preset *shape* on a machine that has no `~/.agent-presets/` — a fresh
clone, or CI. Before this existed the suite was machine-dependent: 9 of 186 tests
failed under an empty `HOME`, so no CI could run it at all.

**What this is NOT:** a source of truth. The canonical presets live in
`~/.agent-presets/` (`PROTECTED.md`): mounting a preset is a composition decision,
and `install.sh` deliberately refuses to write them. This directory is a
**verification input**.

**Which copy gets validated** (`tests/presets.test.cjs`, in priority order):

| Condition | Validated | Drift check |
|---|---|---|
| `DSH_AGENT_PRESETS` set | that directory | skipped (explicit override) |
| live `~/.agent-presets/` exists | the **live** presets | **runs**: mirror must match byte-for-byte |
| neither | this mirror | skipped, and reported as skipped |

Because the middle row is the owner's machine, a stale mirror cannot pass there —
that is the whole point of the drift test. On CI the mirror is the only copy, so
the mirror becomes the reference for shape conformance.

**If you change a preset:** change it in `~/.agent-presets/`, then re-copy it here.
The drift test names any file that has fallen behind, and the fix is always to
re-copy, never to loosen the assertion.

`scripts/counts.cjs` derives the presets headline count from the same
`DSH_AGENT_PRESETS`/`~/.agent-presets` source and reports `0` when you pass
`DSH_AGENT_PRESETS` at a directory that has none — so the derived count and this
mirror stay consistent by construction.
