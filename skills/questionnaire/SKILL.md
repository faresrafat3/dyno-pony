---
name: questionnaire
description: Turn a decision you can't answer alone into a Markdown questionnaire for the one person who can (filled in async, or together over a meeting). Use when the user is blocked by a question that lives in someone else's head — a stakeholder, a domain expert, a vendor — and the recipient needs a structured form to answer. The recipient holds the knowledge; the questionnaire pulls it out.
whenToUse: "Grill the *send*, not the subject. Interview the user only about who it's going to and what they need back. Then write a Markdown questionnaire aimed at the gap between what the recipient knows and what the user needs. Order questions most-important-first (async means you may only get one pass). Save as to-questionnaire-<slug>.md in the current directory."
metadata:
  category: productivity
  scope: communication
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, to-questionnaire)
---
# Questionnaire
User can't answer alone → **questionnaire** for one person, async or meeting. **Grill the send, not the subject:** ask user only who + what-needed-back; questions target recipient-knows vs user-needs gap.
## Process
1. **Who?** One exchange: role, expertise, relationship (fixes tone + context load).
2. **What back?** One exchange: decisions/facts user can't resolve alone.
3. **Write it.** Gap-aimed questions per structure → `to-questionnaire-<slug>.md`, report path.
## Document structure
Discovery frame: user lacks context, recipient holds it. Most-important-first (async = one pass); `##` themes past a handful.
```markdown
# <Title>
**Purpose:** why + decision riding on it.
**From:** <user>, **To:** <recipient>, **Used for:** <where answers go>
## Context
One paragraph for an outsider. Enough to answer well, not a page.
## How to answer
Deadline + effort. Partials/"I don't know" welcome — flag uncertainty, don't skip.
## <Theme>
One idea per question, never compound, stub beneath, one-line _why this matters_ only where misreadable.
### What load is expected at launch?
_Why this matters: decides burst provisioning now vs later._
>
## Anything else?
Catch-all: anything unasked we should know?
```
## What comes back
Answers feed `grill-with-docs` or `to-spec`.
## Anti-patterns
Interview user on subject (that's `grill-me`) · compound Q/A · burying top question · skipping context.
