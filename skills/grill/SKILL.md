---
name: grill
description: Relentless interview of the user on a plan, decision, or design until every branch of the design tree is resolved. Use when the user wants to stress-test their thinking, sharpen a plan, or says "grill me", "interview me", "I want to think this through", "challenge this design", or hands over a feature spec and wants it checked.
whenToUse: "Stress-test a plan, design, or feature spec. The skill drives a design-tree interview: a round of questions on the current frontier, recommended answers, wait for the user's answers, then the next round. Use /grill-me for stateless, /grill-with-docs for stateful (in a working directory with CONTEXT.md and ADRs), /grilling for the raw primitive."
metadata:
  category: productivity
  scope: conversational
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, grilling + grill-me + grill-with-docs)
---

# Grill

Frontier discipline: interview until every design-tree branch resolves — whole frontier per round, wait, recompute, repeat.

## Three variants

- **grill-me** (stateless, no working dir): no CONTEXT.md, no follow-ups.
- **grill-with-docs** (stateful, working dir): + `domain-modeling` — CONTEXT.md updates, inline ADRs.
- **grilling** (primitive): raw loop, no wrapper.

## The loop (all variants)

1. **Map the tree** — decisions off the goal, branches off those.
2. **Find the frontier** — prerequisite-settled decisions; ask the **whole** frontier in one round.
3. **Format a round** — numbered, each with `➡️` recommended answer, one-line-answerable:
   ```
   ❓ Q1 — <title>: <body>
   ➡️ <recommended answer>
   ---
   ❓ Q2 — <title>: <body>
   ➡️ <recommended answer>
   ```
4. **Wait** — no next round until current answered; dependents of open questions wait.
5. **Recompute** — settled decisions unblock dependents; continue.
6. **Stop when empty** — state completion, **wait for explicit confirmation**; never act on assumed consensus.

## Finding facts (your job, never the user's)

Env fact needed (file, doc, API)? Dispatch a subagent — never ask the user for what you can look up. Don't block: ask the rest of the frontier now. **Decisions** are the user's; **facts** are yours.

## Anti-patterns

Lookup-answerable questions; one-at-a-time drips (round, not drip); acting pre-confirmation; no recommended answer (user needs an anchor).

## With docs (grill-with-docs)

Also run `domain-modeling` **in parallel**: new concept → add to CONTEXT.md; sharpened term → update it; hard-to-reverse → offer ADR. Glossary in CONTEXT.md, load-bearing in ADRs.

## Termination

Done = frontier empty + confirmed understanding + one-liner ("Done: design is X, Y, Z. Confirm before I act."). Next: `to-spec` or `to-tickets`.
