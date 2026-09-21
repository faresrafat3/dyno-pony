---
name: ultimate
description: >
  Ultimate mode (وضع ultimate — كل حاجه شغالة). One tool: `ultimate` with
  three actions — `on` (arm pony + caveman + sentinels + every dyno-pony tool,
  smart routing), `off` (baseline), `status` (arsenal introspection).
  Triggered by "ultimate mode" / "go all out" / "full arsenal" / "كل حاجة".
  Off with "stop ultimate" / "exit ultimate" / "normal mode". Mounts nothing
  (bundle already loaded); sets a session flag + silent persona overlay.
whenToUse: "Use when Fares says 'ultimate mode', 'go all out', 'full arsenal', 'كل حاجة', '/ultimate', or starts a session he has marked as important and wants every tool available without micro-managing which one to call."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: ultimate-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [on, off, status]
---

# Ultimate — "go all out" overlay

Part of the dyno-pony merged bundle (`rebuild.sh` mounts it). One tool: `ultimate`. Trigger ("ultimate mode"/"go all out"/"full arsenal"/"كل حاجة"/`/ultimate`) → sets private `s.ultimate.armed=true`, returns silently-read **persona overlay**; NO `cordis_run`/`stop`/`define` — dyno-pony bundle already loaded, every tool registered (ponytail, caveman, orch, dsh-author, memo, plugin-test, codex, memory, workflow, trace, sphinx, drift, second_order, this one).

## Overlay (read silently)

Lazy `ponytail(mode=ultra)` (YAGNI/reuse/stdlib) · terse `caveman(action=terse)` · `orch_route` per task, no micro-managing · self-checks `sphinx` (budget)/`drift` (fossils)/`second_order` (hard-to-undo), never narrated · `memo_classify`+`memo_format` keepers, `mem_promote` when reusable · new repos: `cdx_map`/`symbols`/`owner` first · genuine fan-out only: `wf_compose`→`wf_run`→`wf_collect`, else just do it · end: `trace.trc_mode_flow`.

## Actions / off

`on` (arm+read) · `off` (baseline) · `status` (armed? tool count?). Off: `stop ultimate`/`exit ultimate`/`normal mode`/`ultimate(action="off")` — no narration, visible only via status. Tools stay registered; only overlay flips.

## Fit

**Use:** long important session (Fares triggers); smart tool-choice; sentinels wanted. **Skip:** 2-turn Q&A (overhead); single-tool want (call directly); terse+lazy sans sentinels (`pony-mode`/`caveman-mode`).
Subsets co-exist, narrowest wins: `pony-mode` (pony+orch) · `caveman-mode` (caveman+orch) · `sentinel-mode` (sphinx+drift+second_order) · `ultimate-mode` (superset: all + dsh-author, memo, plugin-test, codex, memory, workflow, trace).
