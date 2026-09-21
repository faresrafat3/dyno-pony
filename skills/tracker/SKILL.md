---
name: tracker
description: Local markdown issue/spec/ticket tracker rooted at `~/.dsh/tracker/`. Use when a DSH workflow needs an issue surface and no real tracker (GitHub, Linear, etc.) is configured, or when the user asks to "create an issue", "open a ticket", "write a spec", "add to tracker", or invokes /tracker.
whenToUse: "Create, read, or update issues, specs, or tickets in a portable, local markdown tracker. Default tracker for all DSH workflows that assume an issue surface (to-spec, to-tickets, triage, code-review, wayfinder). Use when no `tracker.remote` is set in ~/.dsh/tracker/config.yaml."
metadata:
  category: workflow
  scope: portable
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, setup-matt-pocock-skills)
---

# Tracker

**Portable local tracker** at `~/.dsh/tracker/`. Default issue surface for to-spec/to-tickets/triage/code-review/wayfinder when no real tracker (GitHub/GitLab/Linear) configured.

## Layout

```
~/.dsh/tracker/
  config.yaml             # kind: local | github | gitlab, labels, paths
  issues/<NN>-<slug>.md   # one per issue, numbered from 01
  specs/<NN>-<slug>.md    # one per spec
  tickets/<NN>-<slug>.md  # one per ticket
  labels.md               # canonical vocabulary (default: 5-state triage)
```

`<NN>` zero-padded (`01`, `02`, …) so `ls` orders them. Each file: YAML front-matter w/ canonical roles + body per artefact template (`templates/`).

## Default config

```yaml
# ~/.dsh/tracker/config.yaml
kind: local
paths:
  issues: ~/.dsh/tracker/issues
  specs: ~/.dsh/tracker/specs
  tickets: ~/.dsh/tracker/tickets
labels:
  # Two categories:
  bug: bug
  enhancement: enhancement
  # Five states:
  needs-triage: needs-triage
  needs-info: needs-info
  ready-for-agent: ready-for-agent
  ready-for-human: ready-for-human
  wontfix: wontfix
```

Labels = canonical triage vocabulary (free upstream cross-pollination). Override to map onto existing tracker vocab (e.g. `needs-triage: "bug:triage"`).

## Creating an issue

1. Next number: `ls ~/.dsh/tracker/issues | wc -l` → `printf '%02d' "$next"`.
2. Slug from title (`kebab-case`, ≤ 6 words).
3. Write `~/.dsh/tracker/issues/<NN>-<slug>.md`:

```markdown
---
kind: issue
state: needs-triage
category: bug | enhancement
created: 2026-09-05
---

# <title>

<body: what, who, why>

## Acceptance criteria

- [ ] criterion 1
- [ ] criterion 2
```

4. Re-count so next caller sees new max.

## Reading issues

- `ls ~/.dsh/tracker/issues` — all, numeric order.
- `ls ~/.dsh/tracker/issues | grep "01-"` — issue #1.
- `cat ~/.dsh/tracker/issues/01-*.md` — body.

## Moving through states

Edit `state:` front-matter. Five canonical states (default `labels` above) only; other values = misuse, trips checker.

## Specs and tickets

`specs/<NN>-<slug>.md` mirrors to-spec template (Problem, Solution, User Stories, Implementation/Testing Decisions, Out of Scope). `tickets/<NN>-<slug>.md` mirrors to-tickets (What to build, Blocked by, Acceptance criteria).

## Blocking edges (local only)

Local edges are **named text**, not native links. In ticket `Blocked by:`, list numbers + slugs: `01-foo, 02-bar` canonical — never bare ids.

## When to switch to real tracker

Local default for solo/single-machine/experimental. Switch to `github`/`gitlab` when:

- **Multiple humans** read/move issues.
- **External users** file requests.
- **Automation** (CI, releases) must observe states.
- **Cross-repo deps** need cross-repo links.

Other skills (triage, to-spec, to-tickets) read `config.yaml.kind`; `github` swaps file writes for `gh issue create`/`edit`.

## Portability and review

- `git init` inside `~/.dsh/tracker/` → whole tree reviewable Markdown via to-spec/to-tickets.
- No remote assumed: offline/airgapped/origin-less OK.
- `tracker-<date>.tar.gz` = one-file export reproducing issue state on fresh machine.
