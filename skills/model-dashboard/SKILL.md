---
name: model-dashboard
description: The engine's model control center — one live Settings surface over every LLM and web-search route. Live table of all providers/models with breaker stats, one-shot probes measuring speed AND correctness, sweep of everything at once, availability history, opportunity ranking (fastest-alive / fixable / capped / paid-dead), chain pinning, default-model switching, and key coverage. Use when the user says dashboard / لوحة النماذج / انهي النماذج عايشة / جرّب مفتاح أو موديل, or asks which model is alive, fastest, or free right now.
whenToUse: "Read the live route table, run a ⚡ probe (correctness before speed) or full sweep, rank opportunities, pin a route, or switch session default. Never background-probe — one probe = one real call."
metadata:
  category: runtime
  scope: model-ops
  plugin: dsh-model-dashboard (source in ~/.dsh/plugins/, not this repo)
---

# model-dashboard

Plugin `dsh-model-dashboard` (`~/.dsh/plugins/dsh-model-dashboard/`) — Settings "Model Dashboard" (order 33). Live unless marked; panel is the surface, tools the model-side window into same data.

## Picture

- **Routes**: every `provider|model` — live `llm.listProviders()`/`listModels()` (260+), "came and went" from chain-state (35 as of 2026-09-11), web chain's 9 `type|keyEnv`. Badges ready/cooldown/untested/not-registered + breaker stats (calls, errors, last success).
- **⚡ Probe** (`modelDashboard/probe provider model`): one tiny call ("Reply with the single word: pong") → TTFT, total, length, **correctness** (had "pong"?). Alive-but-wrong is real: aihubmix 0.17s wrong; kiraai7 2.2s correct. Correctness > speed.
- **⚡ Sweep**: all registered routes (concurrency 4, skips ok-in-15min). E.g. 141/268 alive in 103s, failures bucketed.
- **📜 History** (`~/.dsh/dashboard-history.json`): append-only probe log (`t,p,m,ok,cor,ttft,total,err`; 20k cap, debounced). Summaries (ok count, drops ↓/recovers ↑, last ttft) + drop clock derive from it.
- **⭐ Opportunities** (`ranked`): 🚀 fastest-alive (correct-first, then TTFT) · 🔑 fixable (401) · ⏳ capped (429) · 💀 paid-dead (402) · ❓ never-probed. **⏰ Drop clock** (failures by hour): sweep different hours to learn WHEN free capacity dies. Rows carry **📌 pin to chain** (main, chain2-6).
- **🎛 Control**: session-default model (read + switch any chain route via `agentDefaultModel`, comments preserved) + **🔑 key coverage** (`provider→apiKeyEnv` presence, 50/50; VALUES never read).
- **🌐 Web chain**: 9 routes + stats + ⚡ Probe search (one real end-to-end query, ~1.7s via EXA).

## Mechanism

Panel→Host = Typert Remote `modelDashboard` (`read,probe,history,sweep,ranked,addRoute,controlStatus,setDefault,probeWeb`) via `modelDashboardPanel`; LOCAL typert contribution (`ctx.typert.register`, src-json codecs) like the three chain panels — no build pipeline. Reads: catalog from `llm`; breakers from `fallback-chain-state.json` + `fallback-chain2..6-state.json` (group keys → provider|model); web rows via `webchainPanel`. Writes NEVER touch yamls: `addRoute`→`fallbackChainPanel`/`fleetChainPanel`; `setDefault`→`agentDefaultModel`; `probeWeb`→`web` seam; only owned file = history json. One probe = one real call (268-route sweep = real quota); manual by design, never background burn.

## Surfaces

Settings → Model Dashboard (visual) · `modelDashboard/*` methods (any client plugin) · `~/.dsh/dashboard-history.json` (JSON array record).

## Verification (after touching plugin)

Spare `dsh web --port 3199 --no-open` (never kill live GUI) → manifest carries plugin + route counts → POST `read` (rows+webRows non-empty) → POST `probe` healthy (`ok:true`, `correct`) → POST `ranked` (buckets+`dropHours`) + `controlStatus` (default+50 keyRefs) → kill spare (3080 untouched; user restarts `dsh web` themselves).

## Limits (2026-09-11)

Periodic-drop detection needs multi-day/hour history (drop clock = seed; sweep varied times); quota-reset windows (first success post-429) unbuilt until history spans resets. Quality = binary pong-check (math/code probes future). No auto-refresh; ↻ + ⚡ Sweep manual.
