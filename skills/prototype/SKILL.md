---
name: prototype
description: Build a throwaway prototype to answer a design question — a state model, business logic, or a UI. Use when the user wants to sanity-check whether a state model feels right, see what a UI should look like, or says "let me try this", "can you mock it up", "I want to feel the shape of it".
whenToUse: "Throwaway code that answers one question. The question decides the shape. (1) Logic / state model → single shareable HTML file with free-play buttons and tabbed guided walkthroughs. (2) UI look → several radically different variations on a single route, switchable via URL search param and a floating bottom bar. Throwaway from day one, no persistence by default, no polish beyond runnable, surface the state."
metadata:
  category: engineering
  scope: prototype
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, prototype)
---
# Prototype
Throwaway code answering one question. Question decides shape.
## Pick a branch
Use prompt, surrounding code, or ask:
- **Logic feel right?** → single HTML: free-play buttons + tabbed walkthroughs; drives hard-on-paper cases; non-dev drivable.
- **What look?** → several radically different variations, one route, URL param + floating bottom bar.
Ambiguous + user unreachable: match surrounding code (backend → logic; page → UI), state assumption up top.
## Rules (both)
1. **Throwaway, marked.** Next to module/page; prototype-named; obey routing, no new top-level structure.
2. **Trivial run.** UI: one task-runner command. Logic: double-click one HTML.
3. **No persistence.** In-memory; persistence is what's *checked*. DB questions → scratch DB/file "PROTOTYPE, wipe me".
4. **No polish.** No tests, minimal errors, no abstractions. Learn fast.
5. **Surface state.** After every action/switch, render full relevant state.
6. **Capture when done.** Decision → real code; prototype → throwaway branch + issue pointer; verdict in issue/commit. Main keeps decision only.
## NOT a prototype
Shippable spike (decision lands, code doesn't) · spec (prototype *is* spec) · stakeholder demo · permanent artifact.
