---
name: fallback-chain
description: Ordered free-provider fallback chain for big goals. One route "chain"/"big-goal" walks ~/.dsh/fallback-chain.yaml top to bottom; dead or quota-exhausted entries cool down and the next one serves. Use when running long /goal sessions on free tokens, or when the user says fallback chain / سلسلة الـ fallback.
whenToUse: "Keep long sessions on free tokens alive: new sessions already default to chain/big-goal, so set nothing; read state and reorder through chain_status or the Settings → Fallback Chain panel; follow the live-tuning playbook (evidence first, atomic writes) before touching the yaml."
metadata:
  category: runtime
  scope: llm-routing
  plugin: dsh-fallback-chain (source in ~/.dsh/plugins/, not this repo)
---

# fallback-chain

One route: provider `chain`, model `big-goal`. Each request walks chain in order until one answers; pre-first-content failures fall through, quota-style failures earn long cooldown.

Deployed TWO ways (2026-09-08; panel 2026-09-09, bundle v2.0.0):

1. **Persistent bundle** `dsh-fallback-chain` v2.0.0 at `~/.dsh/plugins/dsh-fallback-chain/` (`package.json` w/ `dsh.bundle.patch` + `dsh.client` + `cordis.patch.yml` `- insert:` row + `index.js` ESM + `client.js`). Installed via `dsh plugin --profile <headless|web> add <path>`. Loads every boot — verified (`dsh --profile headless` replied CHAIN-PANEL-OK; `fallback-chain-state.json` holds per-entry stats).
   **v2.0 Settings panel**: `client.js` registers "Fallback Chain" in web Settings (slot `settings.section`, order 30): group selector (big-goal/parallel-a/parallel-b), route pickers, reorder/remove, tunables, cooldown reset. Panel→Host via Typert Remote namespace `fallbackChain` (`read`/`applyReset`/`edit`/`catalog`) served by `fallbackChainPanel` in `index.js`. Gateway discovers endpoints through LOCAL typert contribution in apply() (`ctx.typert.register`, src-json codecs — bundles have no Typert pipeline; 2026-09-10 fix: old `defineProperty('remote-methods')` marker was never read, so panel calls always failed). Boot graph carries entry w/ `inject: [api-remotes, ui-renderer]`; bundle serves 200 at `/plugins/dsh-fallback-chain/client.js?rev=...`.
   **v1.1+ (2026-09-11) two more sections**: "Fallback Chains 2-6" (order 31, from dsh-chain-fleet — rename/reorder/add/tunables/reset) and "Web Search Chain" (order 32, from dsh-web-fallback). Fleet chains carry display `name:` line, panel-editable.
2. **Dynamic plugin route** — pre-bundle sessions only. Do NOT redefine it: the bundle mounts the same route + panel, and a second registration conflicts. Superseded by v2.0.0.

## Control surfaces (apply next request, no restart)

| Surface | Effect |
|---|---|
| `~/.dsh/fallback-chain.yaml` | THE chain: order, entries, tunables. Full-line + trailing ` #` comments OK; else loud fail w/ line number. |
| `chain_status` | `status`: ordered entries w/ live/cooldown + stats. `reset`: clear cooldowns. |
| `chain_edit` | `set`/`add`/`remove`/`move`/`tunables` w/ validated writes (action + payload). Regenerates file w/ standard header — custom comments lost. |
| **Settings → Fallback Chain panel** | Same controls visually: reorder/remove/add from live pickers, tunables, reset. Persistent since v2.0.0. |
| `/model` composer | Per-session switch; also writes `agent-default-model`. |
| `agent-default-model` | Now `chain/big-goal` (2026-09-08): every NEW session walks chain by default. |

## Chain file format (strict subset)

- Top scalars: `cooldownMinutes`, `quotaCooldownMinutes`, `errorStreakThreshold` (positive numbers).
- One `entries:` list; each: `provider:` (route key from `llm-pi-ai.providers` in settings.yaml) + `model:` (+ optional `contextWindow:`, `reasoningEffort:`).

## Behavior rules

- Failover only BEFORE first chunk. Mid-stream failure after content started forwards as-is (no dup output).
- `aborted` never fails over, never blamed.
- Quota-like failures (402, 429, "quota", "credit", "balance", "insufficient", "rate limit") cool entry for `quotaCooldownMinutes` (default 360); other failures cool after `errorStreakThreshold` consecutive errors for `cooldownMinutes` (default 10).
- Unregistered-provider entries skipped at request time (warned at mount).

## Goal workflow (/goal on free tokens)

- Set nothing: new sessions default to chain. Launch goal, leave it.
- Keep ONE continuable background subagent as traveling companion (background + follow-ups), not one-shots; inherits parent `chain/big-goal` route. Explicit child overrides must be in `subagent-model-selection.allowedModels` (chain/big-goal added 2026-09-08; open sessions keep captured policy).
- `chain_status` anytime; `reset` after daily quota reset.

## Bundle authoring pitfalls (already hit)

- Patch row w/ only `id:`/`name:` MODIFIES existing entry (`patch: entry ... not found`); NEW plugins need `- insert:` + list.
- `dsh plugin add <abs-path>` links package + joins `dsh.profile.bundles` when manifest declares `dsh.bundle.patch`.
- Dynamic tool params all `required: true`; optional payloads inside one object param. `harness` is dynamic builtin, never injectable.
- Persistent CLIENT half needs: `dsh.client: {platform:'web', inject:[...]}` in package.json + `exports["./client"]` → raw factory calling `window.__ModuleLoader__.load({id:<package-name>, factory})` — factory may `require()` ONLY seed words (react, react/jsx-runtime, react-dom, react-dom/client, @deepseek-ai/cordis, dsh-client-store, dsh-client-ui-slots, dsh-client-ui-primitives, dsh-client-ui-dockkit). Graph row id = package NAME; `inject` rows applied before this row.
- Browser calls WITHOUT typert artifacts: stamp Host service w/ SRC marker `@deepseek-ai/dsh-typert-protocol/remote-methods` on prototype (methods on prototype; bind `{service:original, serviceKey, namespace}` on original; `ctx.provide(serviceKey,obj)`), then `$mount` matching inline descriptor from client w/ strict `{parse:v=>v}` codecs. Param NAMES must match Host signature (SRC reads via Function.prototype.toString).
- **"Settings section invisible" — silent client-half** (2026-09-09). Two causes, in order:
  1. Process booted BEFORE client files landed (mtime: `ps -eo pid,lstart,cmd | grep 'dsh web'` vs `ls -la` bundle). Boot scan reads package.json at start only — no restart, no row, no panel, no error. Restart profile.
  2. Row served but client apply failed silently. DevTools console mount log (`[fallback-chain] client: ...`) says if namespace mounted / section registered. Render errors caught by bundle error boundary (inline red, never blank Settings).
  Rule for ANY future client half: wrap slot sections in error boundary, loud `console.info` on register, treat "invisible + zero errors" as "process predates files" first.

## Live-tuning playbook (no restart, 2026-09-09)

Chain file re-reads EVERY request → order edits instant. State file = evidence (calls/errors/lastSuccess/lastError).

- **Evidence first**: parse `fallback-chain-state.json` — sort by lastSuccessAt; flag calls>0 + lastSuccess>8h + errorRate>25% (chronic), cooling, currently serving.
- **Order = priority**: serving first, then zero-call fresh-quota, then today-exhausted (429 daily cap), chronic tail. Demote, don't delete.
- **Lint vs registry before trusting order**: registry = `settings.yaml → llm-pi-ai.providers → <name>.models[].id`. Fleet edits BOTH live, re-check pre-write: every `provider:` must exist, every `model:` in that provider's list, else wasted attempt ("no configured model"). Keep `contextWindow:` when reordering.
- **Atomic writes only**: temp file + `os.replace`. Never `echo >` live file (torn read kills request).
- **Verify live**: strict re-parse (tunables ×3, `entries:`, `- provider:`/`model:`/`contextWindow:`), then watch state file for NEW successes on promoted entries within minutes.
- **Concurrent-edit hazard**: parallel sessions edit chain + settings live; two writers clobber. Snapshot md5 before, re-read pre-write, keep writes surgical.

## Fleet chains (chain2..chain6) — 2026-09-09 evening

Five parallel sessions on one pool get server rate-limited. FLEET = five chains, OWN key pools:

- Bundle `~/.dsh/plugins/dsh-chain-fleet/` registers `chain2`..`chain6` (model `big-goal`), each walking OWN `~/.dsh/fallback-chainN.yaml` + `-state.json`.
- Each chainN.yaml seeded EMPTY (header + tunables + commented example). Empty chain registers + selectable in /model but answers `chainN: chain is empty` until filled w/ keys SEPARATE from every other chain.
- Control: `fleet_status` (chain=2..6|all; status|reset), `fleet_edit` (chain + set/add/remove/move/tunables) — same grammar as chain_*.
- Wired into `web` + `headless`; settings allowedModels incl. chain2..chain6/big-goal.
- `chain/parallel-a|b` groups (fallback-chain-groups.yaml) slice ONE pool (quota across accounts); fleet = separate pools (keys). Complementary — groups inside a chain, fleets across chains.
- Never reference chain/fleet routes inside chainN.yaml (recursion guard).
- NOTE 2026-09-11: `agent-default-model` = `chain/big-goal` — restored after drift to token-harborN/deepseek-v4.1-flash:free (single direct account; new/resumed sessions bypassed chain — 80 direct calls, zero chain traffic). Manual /model stays per-session gesture; DEFAULT stays on chain so one dead account never kills new sessions.

## Parallel groups (parallel-a / parallel-b) — positional hazard (2026-09-09)

- `fallback-chain-groups.yaml` defines disjoint sub-chains by 1-based INCLUSIVE index ranges over base chain; `chain/big-goal` = all. Sessions pin a parallel route to burn disjoint pool (settings allows all three).
- **REORDER BASE WITH CARE**: groups are positional. Reorder silently changes group contents. After ANY reorder, recompute ranges (healthy/fresh first, chronic tail excluded from parallel groups, big-goal-only overflow for untried capacity). Ranges edit live — no restart.
- Layout (2026-09-11, 16 entries cline1-11 + kira5 + kiraai6-9): parallel-a 1-8 (cline1-8), parallel-b 9-16 (cline9-11 + kira5 + kiraai6-9). Recomputed after shrink from 43+ — old 1-16/17-32 left parallel-b dead (empty range). Plugin CLAMPS range ends to length so shrinks self-heal; still recompute after manual reorder.
