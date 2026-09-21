---
name: writing-agents
description: >-
  Reference for writing any document an agent consumes — a skill, an
  AGENTS.md/CLAUDE.md, a doc reached by a pointer. Also: conduct a retrospective
  on a coding session to propose improvements to the agent's environment
  (navigation, checks, standards, AGENTS.md, tool economy). Use when the user
  wants to write or edit a skill, modify an AGENTS.md, or run a session retro.
whenToUse: "Two related skills. (1) writing-for-agents: context pointer discipline, information hierarchy, completion criteria, leading words, pruning. (2) retro: read a session's primary sources, find candidates for improvement in 6 categories, present in severity order."
metadata:
  category: meta
  scope: authoring
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, writing-for-agents + retro)
---

# Writing-for-Agents + Retro

Two skills, one entry. Both improve the **environment** the next agent works in.

## 1. Writing-for-Agents

For any agent-consumed doc: skill, `AGENTS.md`/`CLAUDE.md`, pointer-reached doc. Packaging differs; writing doesn't.

### Context pointers

A **context pointer** names out-of-context material + encodes reach condition. Skill description is one; an `AGENTS.md` line naming a doc is the same. Two jobs: say what material is, list **branches** triggering it. Every always-loaded word costs each turn:

- **Front-load leading word**: pointer does triggering work there.
- **One trigger per branch.** Synonyms renaming one branch = one branch ×2.
- **Cut identity body already carries.**

### The two loads

- **Context load** — always-loaded material (AGENTS.md line, skill description). Costs tokens + attention whether or not it fires.
- **Cognitive load** — human's: which docs exist, when to reach. Price of agency; spend where judgment matters.

Pointer-reached material escapes context load for pointer's own line; unpointed material rides cognitive load alone.

### Information hierarchy

Docs = **steps** (ordered actions) + **reference** (consulted on demand). Placement:

1. **In-file step** — primary: what agent does, in order.
2. **In-file reference** — on demand.
3. **Disclosed reference** — separate file via pointer, loaded only on fire.

**Progressive disclosure** = moving down. **Co-location** = definition+rules+caveats under one heading. **Sprawl** = too long for attention.

### Steps and completion criteria

Every step ends on a **completion criterion** (done-condition). Two levers:

- **Clarity** — agent can tell done/not-done? Sharpen bound first.
- **Demand** — how much required. "Every rule applied" forces thoroughness.

### When to split

Only when cut earns it:

- **By sequence** — post-completion steps tempt rushing the one before; split them off.
- **By invocation** — skill-specific; see skill mechanics.

### Leading words

A **leading word** is a pretraining concept the agent thinks with while running the doc. Repeated token accumulates distributed definition, anchors behaviour cheaply. Coined words recruit no priors: prefer existing.

- "fast, deterministic, low-overhead" → _tight_ (a _tight_ loop).
- "a loop you believe in" → _red_ (loop goes _red_ on bug, or not).

**Negation fails**: "don't think of an elephant" summons it. Prompt the **positive** state.

### Pruning

- **Single source of truth** — one authoritative place per meaning.
- **Environment is truth too** (`package.json` scripts, config, `--help`). Restating doc = **cache**.
- **Relevance** — each line bears on what doc does?
- **No-ops** — model obeys by default. Delete.

## 2. Retro (session retrospective)

User wants retro. Suggest **environment** improvements for future runs.

### Steps

1. Read primary sources for specified session (logs, transcripts); default = current.
2. Hunt candidates in six categories (_Use when_ = signal):
   - **Navigation** — hard-to-find files, hidden deps, missing pointer? Long search time.
   - **Automated checks** — lint/type/test/FS check that'd catch agent mistake? Agent erred catchably.
   - **Coding standards** — new rule reviewer should enforce, old to clarify? Reviewer missed.
   - **Global AGENTS.md** — move to standards/checks? AGENTS.md large.
   - **Tool economy** — expensive/streamlinable calls? Agent spent heavily.
   - **No-ops** — steering lines not modifying behaviour? Steering files large.
   - **Information access** — more access (dev-log tee, readonly third-party)? Crucial piece missing.
3. Present in severity order.

### Reference

**Implementation vs Review.** Implementation agent = max context pressure (explore+write+debug). Review agent = min (receives diff, no explore). Impose standards on reviewer, not implementer.

**Files:**

- `CLAUDE.md`/`AGENTS.md` — every-turn context. Sparingly: navigation pointers only.
- `CODING_STANDARDS.md` — read at review. >1000 lines → navigation pointers.
- Docs — reference files via pointers. Find existing before writing new.
- Skills — docs (description = context) or user-invoked commands.
