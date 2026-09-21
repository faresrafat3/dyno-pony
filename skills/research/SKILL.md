---
name: research
description: Delegate reading legwork to a background agent that investigates a question against primary sources and captures findings as a cited Markdown file. Use when the user wants a topic researched, docs or API facts gathered, or says "research this", "look up", "what does X say", "find the docs for", or hands over a question that's too long to read in-line.
whenToUse: "Background DSH subagent reads against primary sources (official docs, source, specs, first-party APIs), cites every claim, writes one Markdown file; current session keeps working."
metadata:
  category: engineering
  scope: research
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, research)
---
# Research
Reading legwork → **background agent**; session keeps working. Subagent investigates, cites, writes one Markdown file.
## The brief (4 sections)
1. **Question.** One paragraph: what next session needs. 2. **Scope.** In/out: versions, platforms, range. 3. **Deliverable.** Path: `~/.dsh/research/<YYYY-MM-DD>-<slug>.md`, user-named repo path, or repo's research-notes convention. 4. **Sources.** What counts as primary (default: docs, source, specs, first-party APIs).
## Subagent's job
Primary sources only (owning source, not write-ups); cite every factual line inline `[label](url)`/footnotes, no "obvious" exemptions; one file at deliverable path.
## Reach for it
Reading > few hundred lines; long read derails mid-flow work; reusable answer; verifiable citations wanted.
## Not for it
1-2 quick `grep`/`web_search` lookups; one-line fact; session shorter than subagent lifetime.
## While it reads
Don't wait: independent work continues, dependent work parks until report lands.
## Anti-patterns
Search-summary cites · brief-rephrase as answer · workspace-default save · uncited "obvious" claims.
## Next session
Feeds `grill-with-docs` (design), `to-spec` (buildable spec), `domain-modeling` (`CONTEXT.md` terms).
