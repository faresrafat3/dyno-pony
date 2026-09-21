---
name: memo
description: >
  Agent Note discipline per DSH AGENTS.md. Six tools: memo_classify (tier:
  implemented / proposed / archived / rejected), memo_format (template),
  memo_link (link lint), memo_scope (supersession check), memo_archive
  (archive triplet), memo_review (prose review). Use when the user wants to
  author, classify, archive, or review an Agent Note.
whenToUse: "Use when the user wants to write a DSH-compliant Agent Note, classify an existing one, archive a triplet, or review a draft against the prose standard."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: off by default — toggle on
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [memo_classify, memo_format, memo_link, memo_scope, memo_archive, memo_review]
---

# memo — Agent Note authoring

Part of the dyno-pony merged bundle; six Agent-Note tools.

## Tools

| Tool | Returns |
|---|---|
| `memo_classify(kind, category?)` | Tier dir + lifecycle rules (`implemented`/`proposed`/`archived`/`rejected`) |
| `memo_format(kind?, title, date?)` | Template: `## Problem`/`Decision`/`Consequences`/`Required verification` |
| `memo_link(notePath, noteBody?)` | Relative-link + fragment-anchor lint |
| `memo_scope(draftTitle, draftKeywords?)` | Supersession greps + classification rubric |
| `memo_archive(noteBasename, category, reason?)` | Triplet archive (move, rewrite Status, freeze) |
| `memo_review(noteBody)` | One-pass dsh-prose-standard review |

## Tiers

**implemented** (active; rewrite stale in place) · **proposed** (pending) · **archived** (frozen; cross-link from superseder) · **rejected** (not taken).

## When to use

New note; tiering; ref lint (relative paths + kebab fragments); supersession; triplet archive; prose review. Never for non-DSH docs (`docs/` → `dsh-doc`) or non-note writing.

## Activating

Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Off by default; nothing to switch off (these format and lint text).

## Source of truth

`~/Projects/dyno-pony/packages/memo.js`
