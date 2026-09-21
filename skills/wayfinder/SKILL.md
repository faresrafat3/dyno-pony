---
name: wayfinder
description: Plan a huge chunk of work (more than one agent session can hold) as a shared map of decision tickets on the issue tracker, and resolve them one at a time until the way to the destination is clear. Use when the user has a foggy, multi-session effort — a greenfield project, a huge feature build, a migration — and the way from here to the destination isn't visible yet.
whenToUse: "Chart a **shared map** of **decision tickets** (resolved by decision, not build slices) on the tracker; work one at a time. Way clear → hand off (don't build): `to-spec` collapses linked decisions to a buildable plan, then `to-tickets` + `implement`."
metadata:
  category: engineering
  scope: planning
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, wayfinder)
---

# Wayfinder

A loose idea too big for one session, wrapped in fog: the way to the **destination** isn't visible yet. Wayfinding finds that way — it charts a **shared map** on the issue tracker, then works its **decision tickets** (questions resolved by a decision, not build slices) one at a time until the route is clear.

Name the destination first — it shapes every ticket: a spec to hand off, a decision to lock, or a change like a migration. The map is domain-agnostic. Tracker configured by the `tracker` skill (local markdown default at `~/.dsh/tracker/`).

## Plan, don't do

Default is **planning**: each ticket resolves a decision; the map is done when nothing is left to decide before someone builds it. The pull to do the work signals the map's edge — time to hand off. An effort can override this in **Notes** to carry execution into the map; absent that, produce decisions, not deliverables.

## Refer by name

Every map and ticket is an issue with a **name** (its title). In human-readable text refer by name, never bare id (`#42`). Id/URL ride *inside* the name link, never stand in for it.

## The map

One issue labelled `wayfinder:map` — the canonical artifact. Tickets are its child issues. The map is an **index**, not a store: one line per decision + link to its ticket; a decision lives in exactly one place (its ticket), the map only gists + links.

Local tracker: map at `~/.dsh/tracker/issues/01-wayfinder-<slug>.md` (`kind: wayfinder-map`, `state: needs-triage`); tickets as `<NN>-<slug>.md` (`kind: wayfinder-ticket`, `parent: 01`).

### Map body

```markdown
---
kind: wayfinder-map
state: needs-triage
created: 2026-09-05
---

# <Map title>

## Destination
<what the end looks like: spec, decision, or change. 1–2 lines; every session orients here first.>

## Notes
<domain; skills each session should consult; standing preferences>

## Decisions so far
- [<closed ticket>](issues/<NN>-<slug>.md): <one-line gist>

## Not yet specified
<fog: suspected questions, too coarse to ticket yet>

## Out of scope
<work ruled beyond the destination; closed, never graduates>
```

### Tickets

Each ticket is a **child issue** sized to one ~150k-token session:

```markdown
---
kind: wayfinder-ticket
parent: 01
type: research | prototype | grilling | task
state: needs-triage
created: 2026-09-05
---

# <Ticket title>
**Blocked by:** numbers/titles of gating tickets, or "None".
## Question
<the decision or investigation this ticket resolves>
```

**Claim first:** assign the ticket to yourself before any work (`assignee: <user>`). Open + unassigned = unclaimed; concurrent sessions skip claimed tickets.

**Blocking** uses the tracker's native dependency (renders the frontier visually). Fall back to a body convention only if the tracker lacks it. **Unblocked** = every blocker closed; the **frontier** = open + unblocked + unclaimed children. The answer is a resolution comment, not body text; link assets, don't paste them.

## Ticket types

Every ticket is **HITL** (worked with a human; resolves only through live exchange — never answer your own grilling) or **AFK** (agent alone):

- **Research** (AFK) — docs/APIs/local resources to surface a decision-blocking fact. Use `research`.
- **Prototype** (HITL) — cheap rough artifact to react to. Use `prototype`.
- **Grilling** (HITL) — conversation, the default. Use `grill` (grill-with-docs) + `domain`.
- **Task** (HITL/AFK) — manual work gating a decision. Agent alone where possible, else a precise human checklist. Resolves when done; the answer records facts later tickets need.

## Fog of war

The map is deliberately incomplete: beyond live tickets lies **fog** — dim future decisions hanging on open questions. Resolving a ticket graduates specifiable fog into fresh tickets, one at a time.

**Fog or ticket?** Test is whether the question is statable now, not answerable now: sharp question → **ticket** (even if blocked); unsharp → **Not yet specified** (one patch may graduate into several tickets or none). Excludes decided, live tickets, and out-of-scope.

**Out of scope** = beyond the destination (scope, not sharpness). Never graduates; returns only if the destination is redrawn, as a fresh effort.

## Invocation

Never resolve more than one ticket per session (research excepted).

### Chart the map (loose idea → map)

1. **Name the destination** — `grill` (grill-with-docs) + `domain`.
2. **Map the frontier breadth-first** — fan out, surface open decisions + first takeable steps. No fog surfaced (way already clear, fits one session) → no map needed.
3. **Create the map** (`wayfinder:map`): Destination + Notes filled, Decisions empty, fog in Not yet specified.
4. **Create specifiable tickets** as children, then wire blocking edges in a **second pass** (sorts frontier vs blocked). Unspecifiable stays fog.
5. **Fire research subagents** (`research` skill) — one per research ticket, in parallel.
6. Stop: charting is one session; it resolves nothing.

### Work the map (map [+ ticket] → decisions)

1. Load the **map** (low-res, not every ticket body).
2. Choose ticket (named one, else first frontier in order). **Claim it** first.
3. Resolve it — zoom into related/closed tickets on demand; call skills from Notes.
4. Record: resolution comment + **close** + append pointer to Decisions-so-far.
5. Add newly-surfaced tickets (create-then-wire); graduate newly-specifiable fog, clearing each patch from Not yet specified. Expect concurrent tracker edits.
