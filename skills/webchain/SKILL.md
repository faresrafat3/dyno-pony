---
name: webchain
description: Web-search fallback chain mirroring the LLM fallback-chain pattern. One composite provider "web-chain" walks ~/.dsh/web-search-chain.yaml top to bottom; missing keys skip silently, quota/auth failures cool down, first live entry serves. Use when you need web search failover without DeepSeek API.
whenToUse: "Route web search through the fallback chain: webchain_status for live entries and cooldowns, webchain_edit for validated set/add/remove/move/tunables, and ~/.dsh/web-search-chain.yaml as the order. Keys resolve per request; a missing key skips silently."
metadata:
  category: runtime
  scope: web-search
  plugin: dsh-web-fallback (source in ~/.dsh/plugins/, not this repo)
---

# webchain

One web-search route: provider `web-chain` (the `web` row of every profile). Each search walks the chain until one entry returns results; missing keys skip silently; pre-result failures fall through; quota/auth failures earn long cooldown.

Permanent bundle `dsh-web-fallback` at `~/.dsh/plugins/dsh-web-fallback/` (`package.json` + `dsh.bundle.patch` + `- insert:` row + ESM `index.js`), installed into `headless`/`web`/`inferx`. Loads every boot — verified both profiles mount 7 entries.

## Control surfaces (next search, no restart)

| Surface | Effect |
|---|---|
| `~/.dsh/web-search-chain.yaml` | THE chain: order, entries, tunables. Full-line + trailing ` #` comments OK; else loud fail with line number |
| `webchain_status` | `status`: entries with key/no-key/cooldown + stats. `reset`: clear cooldowns |
| `webchain_edit` | `set/add/remove/move/tunables` validated writes (action + payload). Regenerates with standard header — custom comments lost |
| profile `cordis.patch.yml` `web` row | Pins `searchProvider: web-chain` (fetch stays `http`). Default `deepseek-official` dead by rule — no DeepSeek-API search |

## File format (strict subset)

- Scalars: `cooldownMinutes`, `quotaCooldownMinutes`, `errorStreakThreshold`, `requestsPerKeyPerDay` (non-negative).
- `entries:` list; each: `type:` (`exa`|`tinyfish`|`tavily`) + `keyEnv:` (credentials ref). No DeepSeek-backed entries by design.

## Behavior

- Failover only BEFORE results. Zero-source answer = completed attempt (fall through, no error count).
- Missing key = silent skip (spare slots await Fares' keys).
- Quota-like (402/429/"quota"/"credit"/"balance"/"insufficient"/"rate limit"/"free limit"/"daily") → `quotaCooldownMinutes` (360); auth (401/403/"invalid key"/"unauthorized"/"forbidden") → long cooldown too; other → `cooldownMinutes` (10) after `errorStreakThreshold` streak.
- Unknown `type` rejected at edit; skipped at request (mount warns).

## Entry types (wire-validated)

- **exa**: `POST api.exa.ai/search`, Bearer key, `query`+`type:auto`+highlights → `results[].highlights[0]` as snippet.
- **tinyfish**: `GET api.search.tinyfish.ai?query=...&limit=...`, `X-API-Key`. **Free at any balance incl. $0** (docs.tinyfish.ai). `results[]` → seam shape.
- **tavily**: `POST api.tavily.com/search`, Bearer key, `query`+`include_answer:false` → `results[].content` as snippet.

## Keys

Per-request, no cache: `ctx.get('credentials').resolve(keyEnv)` else `process.env[keyEnv]`. Blank = skipped. Refs: EXA_API_KEY, TINYFISH_API_KEY, TAVILY_API_KEY…

## Goal workflow

Default chain everywhere; one continuable background subagent inherits the route; `webchain_status` anytime; `webchain_edit add` activates a new key instantly.

## Authoring (same as fallback-chain)

`- insert:` for NEW plugins (bare `id:`/`name:` MODIFIES) · `dsh plugin add <abs-path>` auto-joins bundles · dynamic params all `required: true`, optionals inside one object.
