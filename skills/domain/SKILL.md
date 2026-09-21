---
name: domain
description: Build and sharpen a project's domain model. Use when discussing codebase terminology, writing or editing a CONTEXT.md, recording an ADR, designing a module's interface, choosing where a seam goes, or making code more testable. Also reaches for the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) when designing or restructuring.
whenToUse: "Two related disciplines, one skill. (1) Domain modeling: actively challenge fuzzy terms, sharpen with scenarios, update CONTEXT.md and ADRs inline. (2) Codebase design: shared vocabulary for deep modules — a small interface, a lot of behaviour, behind a clean seam, testable through that interface."
metadata:
  category: engineering
  scope: design
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, domain-modeling + codebase-design)
---

# Domain + Codebase Design

Two disciplines, one skill. **Domain modeling** sharpens project *language* (words + relations). **Codebase design** shapes *modules* — lots of behaviour behind small interface, at clean seam, testable through it.

Most projects: single `CONTEXT.md` glossary; larger: `CONTEXT-MAP.md` → per-context files. ADRs hold load-bearing decisions.

## Part 1: Domain modeling

Reach for it when: term conflicts w/ `CONTEXT.md`; fuzzy/overloaded word ("account" × 3 jobs); relationship needs edge-case stress-test; term resolved — capture now, don't batch.

### File structure

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
```

`CONTEXT-MAP.md` at root = multiple contexts; follow map to right file. Create lazily — `CONTEXT.md` at first resolved term, `docs/adr/` at first ADR.

### During a session

1. **Challenge vs glossary:** "Glossary says X=Y, you mean Z. Which?"
2. **Sharpen fuzz:** "'account': Customer or User?"
3. **Concrete scenarios:** edge case forcing boundary decision.
4. **Cross-reference code:** user says how it works → check; surface disagreement.
5. **Update CONTEXT.md inline.** Now, not later.
6. **ADRs sparingly** — only when all three hold: **hard to reverse** (mind-change costs) · **surprising w/o context** (future "why?") · **real trade-off** (genuine alternatives).

## Part 2: Codebase design vocabulary

Use exactly. Never "component/service/API/boundary."

| Term | Meaning |
|---|---|
| **Module** | Interface + implementation. Scale-agnostic: fn, class, package, tier. |
| **Interface** | All caller must know: types, invariants, ordering, errors, perf. |
| **Implementation** | Inside the module. |
| **Depth** | Leverage at interface: behaviour per unit caller learns. |
| **Seam** | Where behaviour alters w/o editing in place (Feathers) = interface location. |
| **Adapter** | Concrete satisfier of interface at seam. |
| **Leverage** | Callers' gain from depth: capability per interface unit. |
| **Locality** | Maintainers' gain: change/bugs/knowledge/verification in one place. |

### Deep vs shallow

- **Deep** = small interface + lots inside (good).
- **Shallow** = large interface + little inside (avoid).

Design question: fewer methods? simpler params? more hidden inside?

### Principles

- **Depth lives in interface**, not implementation.
- **Deletion test:** delete module mentally. Complexity vanishes = pass-through. Reappears across N callers = earning keep.
- **Interface = test surface.** Callers + tests cross same seam.
- **One adapter = hypothetical seam. Two = real.** No seam until something varies across it.

### Testability

1. **Accept deps, don't create.** Inject gateway.
2. **Return results, don't side-effect.** Compute, don't mutate.
3. **Small surface.** Fewer methods = fewer tests; fewer params = simpler setup.

### Relationships

Module has one Interface. Depth measured vs Interface. Seam = Interface location. Adapter sits at Seam, satisfies Interface. Depth → Leverage (callers) + Locality (maintainers).

## Rejected framings (never use)

- **Depth as LoC-ratio** (Ousterhout): rewards padding. Ours = depth-as-leverage.
- **"Interface" = TS `interface` keyword**: too narrow.
- **"Boundary"**: DDD-overloaded. Say **seam**/**interface**.

## Combining both parts

Domain language (CONTEXT.md) *names* good seams; design vocabulary *shapes* modules. `tdd` tests at pre-agreed seams; `improve-codebase-architecture` finds deepening ops; `grill-with-docs` calls this inline to sync both.
