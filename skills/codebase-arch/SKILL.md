---
name: codebase-arch
description: Scan a codebase for deepening opportunities — refactors that turn shallow modules into deep ones — present them as a visual HTML report, then grill through whichever one you pick. Use when the user wants to improve a codebase's architecture, find deepening opportunities, or says "this code is hard to change", "the modules are too shallow", "let's improve the architecture".
whenToUse: "(1) Scope from recent commits + domain glossary. (2) Sub-agent explores: shallow modules, hidden concepts, cross-seam coupling, untested parts. (3) Self-contained HTML report to OS temp (Tailwind + Mermaid CDN; one card/candidate, before/after diagram). (4) Open report, grill the chosen candidate."
metadata:
  category: engineering
  scope: architecture
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, improve-codebase-architecture)
---

# Codebase Architecture

Surface friction as **deepening opportunities** — refactors turning shallow modules deep (testability + AI-navigability). Use `domain` vocabulary exactly (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**); never "component/service/API/boundary."

## Process

### 1. Scope (YAGNI)

Deepening pays where change happens. **Scope before scanning.** User named a direction → take it, skip inference. Else `git log --oneline` hot spots first; scattered → widen. Read `CONTEXT.md` (+`CONTEXT-MAP.md`) and area ADRs first.

### 2. Explore (sub-agent)

Spawn a sub-agent; explore organically for: concepts scattered over many small modules · **shallow** modules (interface ≈ implementation) · testability-only pure functions with bugs in callers (no **locality**) · seam leaks / tight coupling · untested or hard-to-test interfaces. **Deletion test:** deleting the module concentrates complexity (not just moves it)? "Concentrates" = signal.

### 3. Present candidates as an HTML report

Self-contained HTML in OS temp dir (`$TMPDIR`→`/tmp`, `%TEMP%` Windows): `<tmpdir>/architecture-review-<timestamp>.html`, fresh per run, **never** in repo. Tailwind + Mermaid via CDN (Mermaid graphs, CSS/SVG editorial visuals); one card per candidate with **before/after visualisation**. Card: **Files** · **Problem** (friction) · **Solution** (plain-English change) · **Benefits** (locality + leverage + tests) · **Before/After** side-by-side · **Strength** badge (`Strong`/`Worth exploring`/`Speculative`). Then **Top recommendation** (which first, why) in CONTEXT.md + `domain` terms ("Order intake module"). **ADR conflicts:** only when friction warrants reopening; mark ("contradicts ADR-0007, worth reopening because…"). No interfaces yet. Open (`xdg-open`/`open`/`start`); ask "Which of these would you like to explore?"

### 4. Grilling loop

Pick → `grill` skill (grill-with-docs): constraints, dependencies, deepened shape, behind-seam, surviving tests. Side effects inline via `domain`: new concept → add to CONTEXT.md; sharpened fuzzy term → update it; load-bearing rejection → offer ADR ("record so future reviews don't re-suggest it?"; skip ephemeral); alternative interfaces → `domain` `codebase-design` design-it-twice pattern.
