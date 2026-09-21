# dyno-pony — the agent mode + skill arsenal for DSH

Fares-localized dynamic Cordis plugins, skills, presets for DeepSeek Harness. **Verified state: 1 merged plugin, 38 tools, 14 dynamic skills — suite green.** Counts derived from disk (`scripts/counts.cjs`), cross-checked by `tests/preflight.test.cjs` (+`rebuild.sh`): stale number turns gate red. Oracle beats this line on disagreement.

**Agent entry:** [AGENT-ERGONOMICS.md](AGENT-ERGONOMICS.md) — operating manual: principles, measured failure costs, four-verb cycle.

## The four-verb cycle

| Verb | Command | Meaning |
|---|---|---|
| **VERIFY** | `node --test tests/*.test.cjs` | bundle mounts, 38 tools, schemas pass the real host guard, docs agree with disk |
| **DRIVE** | mount the loader (§Recovery) | arsenal live in the session |
| **ACCRETE** | `bash scripts/collect.sh --apply` | flow live skill fixes back into git |
| **SHIP** | `bash scripts/install.sh` + commit + push | deploy runtime copies, version, publish |

## Layout — one home, one truth

```
packages/dyno-pony.js   merged bundle: 38 tools, one apply(), one disposer  ← the source of truth
packages/*.js           the 14 originals, kept for diffing + the merge script
dynamic-skills/         canonical copies of the 14 plugin skills (runtime gets copies)
skills/                 prose skills that need no plugin
tests/                  mount/conformance tests + preflight.test.cjs (the oracle)
docs/                   ARCHITECTURE.md · ANALYSIS.md
scripts/                merge-plugins.cjs · counts.cjs · install.sh · collect.sh
```

6 valid compositions (`baseline`, `simple`, `pony-mode`, `caveman-mode`, `sentinel-mode`, `ultimate-mode`) live in `~/.agent-presets/` (runtime, not repo), checked by `tests/presets.test.cjs`. `install.sh` never writes them: preset-mounting is a composition decision (`editing-cordis-compositions`, "decide the plane first") — explicit + reversible.

Repo = canonical; runtime (`~/.dsh/skills/`, `~/.dsh/dyno-pony/`) = `scripts/install.sh` deployment. Never edit runtime without `collect.sh`-ing back.

## Recovery — after any DSH restart

Plugin is process-local: restart removes all 38 tools; restore = three calls.

Bundle lookup (oracle asserts ≥1 exists): `~/.dsh/dyno-pony/packages/dyno-pony.js` (deployed by install.sh) → `~/Projects/dyno-pony/packages/dyno-pony.js` (canonical) → `~/Projects/deepseek-harness/.agents/skills/dyno-pony/packages/dyno-pony.js` (legacy).

**1. Define the loader** (`cordis_define`, `kind=new`, `idPrefix=dyno`, host code below — ~700 bytes, reads the bundle from disk at apply time, tries deployed copy first):

```js
const CANDIDATES = [
  (process.env.DSH_HOME || (process.env.HOME || '') + '/.dsh') + '/dyno-pony/packages/dyno-pony.js',
  (process.env.HOME || '') + '/Projects/dyno-pony/packages/dyno-pony.js',
  (process.env.HOME || '') + '/Projects/deepseek-harness/.agents/skills/dyno-pony/packages/dyno-pony.js',
]

return {
  inject: ['fs'],
  async apply(ctx) {
    let body = null
    let lastErr = null
    for (const p of CANDIDATES) {
      try {
        const target = await ctx.fs.resolve(p)
        body = await ctx.fs.readText(target)
        break
      } catch (e) { lastErr = e }
    }
    if (body === null) {
      throw new Error('dyno-pony bundle not found in any candidate path; last: ' + (lastErr && lastErr.message))
    }
    const inner = new Function('harness', 'ctx', body)(harness, ctx)
    if (!inner || typeof inner.apply !== 'function') {
      throw new Error('dyno-pony.js did not return a plugin with apply(); rebuild with scripts/merge-plugins.cjs')
    }
    inner.apply(ctx)
  },
}
```

**2. `cordis_run pluginId=<returned> packageId=<returned> mode=run`.** `tool "X" is already registered` = stale holder: `cordis_inspect_self` → `cordis_stop pluginId=<holder>` → rerun.

**3. Verify** — `cordis_inspect_query` provider `Tool`/`listTools` must list all 38 tools. Green run alone ≠ evidence.

> Sandbox (verified 2026-09-18): `Function`/`eval` yes, `process` no; `inject: ['fs']` = `ctx.fs.resolve`+`readText`, absolute paths only.

## Rebuilding the bundle

After editing any `packages/*.js` original:

```
node scripts/merge-plugins.cjs        # rebuild packages/dyno-pony.js
node --test tests/*.test.cjs          # oracle must stay green
bash scripts/install.sh               # redeploy to the runtime
```

## Schema contract (the asymmetry that burned 3 defines)

`parameters` and `output.schema` are **mirror images, not twins**:

| | form that works | rejected shape |
|---|---|---|
| `parameters` (direct DSL) | bare property map, per-property `required: true` | root `required` array |
| `parameters` (raw wrapper) | `type:'object'` + `properties` + root `required: ['name']` | per-property `required: true` → `belongs to the containing raw object schema` |
| `output.schema` | per-property `required: true` + **explicit** `additionalProperties: false` | root `required` array → `not supported by the value schema DSL` |

Both asserted executable in `tests/preflight.test.cjs`. Full detail + error text: `dynamic-skills/ponytail/SKILL.md` §Schema contract.

## Skills

**Dynamic (14, in `dynamic-skills/`, each backed by bundle tools):** ponytail · caveman · orch · dsh-author · memo · plugin-test · codex · memory · workflow · trace · sphinx · drift · second-order · ultimate

**Prose (in `skills/`, no dyno-pony bundle tools):** codebase-arch · code-review · diagnose · domain · dspy-lab · fallback-chain · git-guardrails · grill · handoff · implement · implement-spec · model-dashboard · openresearch · prototype · questionnaire · research · to-spec · to-tickets · tracker · triage · ts-deep-modules · wayfinder · webchain · writing-agents

Five (`fallback-chain`, `webchain`, `model-dashboard`, `dspy-lab`, `openresearch`) document runtime surfaces coded outside this repo (`~/.dsh/plugins/`, `~/.dsh/dspy-lab/`, external CLI). Repo owns their skills, not source (`PROTECTED.md`).

## Provenance

| Upstream | License | Local additions |
|---|---|---|
| `DietrichGebert/ponytail` | MIT | AR description, single composite tool, soft call-count note |
| `JuliusBrussee/caveman` | MIT | Fares-localized fork |

Everything else is original. [CHANGELOG.md](CHANGELOG.md): version history + honest break/fix record.
