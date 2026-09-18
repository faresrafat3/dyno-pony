---
name: memo
description: >
  Agent Note writing discipline per DSH AGENTS.md. Six tools: memo_classify (pick the right tier:
  implemented / proposed / archived / rejected), memo_format (note file template), memo_link
  (lint relative-Markdown cross-references and fragment anchors), memo_scope (supersession check
  against the active tree), memo_archive (archive triplet: .md + .zh.md + .i18n.yaml),
  memo_review (one-pass prose-standard review). Use when the user wants to author, classify,
  archive, or review an Agent Note.
whenToUse: "Use when the user wants to write a DSH-compliant Agent Note, classify an existing one, archive a triplet, or review a draft against the prose standard."
metadata:
  pluginId: memo-5 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-11
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [memo_classify, memo_format, memo_link, memo_scope, memo_archive, memo_review]
---

# memo — Agent Note authoring

A Dynamic Cordis plugin (pluginId `memo-5`, packageId `pkg-11`). Six tools, all model-facing.

## What this skill does

Specialized workflow for writing DSH-compliant Agent Notes (per `Projects/deepseek-harness/.agents/notes/AGENTS.md`). Handles classification, formatting, link linting, supersession checks, archival, and prose-standard review.

## Tools and actions

| Tool | What it does |
|---|---|
| `memo_classify(kind, category?)` | Returns the directory + lifecycle rules for the chosen tier (`implemented` / `proposed` / `archived` / `rejected`). |
| `memo_format(kind?, title, date?)` | Returns the file template (English source) with `## Problem` / `## Decision` / `## Consequences` / `## Required verification`. |
| `memo_link(notePath, noteBody?)` | Lints internal relative-Markdown links + fragment anchors. |
| `memo_scope(draftTitle, draftKeywords?)` | Returns the supersession-check greps and the classification rubric. |
| `memo_archive(noteBasename, category, reason?)` | Returns the archive procedure (move triplet, rewrite Status header, freeze). |
| `memo_review(noteBody)` | One-pass review against dsh-prose-standard (slop patterns, sections, identifiers, links). |

## The 4 tiers

- **implemented** — Active decision record. Rewrite stale facts in place.
- **proposed** — Pending decision. Lighter weight.
- **archived** — Frozen. Never edit. Cross-link from superseding note.
- **rejected** — Decision considered and not taken.

## When to use

- Writing a new Agent Note.
- Classifying an existing note into a tier.
- Linting cross-references (relative paths + kebab-case fragments).
- Checking supersession against the active tree.
- Archiving a triplet (.md + .zh.md + .i18n.yaml).
- Reviewing a draft against the prose standard.

## When NOT to use

- For non-DSH documentation (markdown docs in `docs/` use `dsh-doc` instead).
- For non-note writing (memo is for Agent Notes specifically).

## Activating

**Not in any default preset.** Toggle on when needed:
```
cordis_run pluginId=memo-5 packageId=pkg-11 mode=run
```

## Deactivating

`cordis_stop pluginId=memo-5`. Consider stopping after you're done authoring — this is a specialized tool.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/memo.js`
