---
name: caveman
description: >
  Terse prose mode (وضع الكلام المختصر). Governs HOW the model TALKS, not WHAT it builds. Pair
  with pony for terse-prose + lazy-mindset, or use standalone. Use when the user says "caveman",
  "terse", "short", "concise", "stop the fluff", "no preamble", or complains about verbose,
  padded, polite filler responses. Off with "stop caveman" or "normal mode".
whenToUse: "Use when the user wants short replies, drop filler, or to remove preamble / sign-offs / politeness padding."
metadata:
  pluginId: cavm-2 (DEAD after restart — bundle is loaded under a fresh dyno-* id)
  packageId: pkg-6
  preset: caveman-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [terse, prose, mode, reset]
---

# Caveman — Terse prose

A Dynamic Cordis plugin (pluginId `cavm-2`, packageId `pkg-6`). One tool: `caveman`.

## What this skill does

Governs **HOW the model talks**. Speaks like a tired senior dev: short sentences, no filler, no emoji,
no "I would be happy to", no "let me", no sign-offs. Drops throat-clearing.

## Tools and actions

| Action | Effect |
|---|---|
| `caveman(action="terse", n=3)` | Max N-word replies. Default 3. |
| `caveman(action="prose")` | Terse prose mode: drop filler, drop throat-clearing, drop sign-offs. **Default.** |
| `caveman(action="mode", level="prose")` | Same as `prose()`. |
| `caveman(action="mode", level="terse")` | Terse mode (3 words max). |
| `caveman(action="mode", level="one")` | One-word replies. |
| `caveman(action="reset")` | Revert to normal prose. |

## When to use

- User says "caveman" / "terse" / "short" / "concise" / "stop the fluff" / "no preamble".
- User complains about verbose, padded, polite filler.
- User wants fragments over paragraphs.

## When NOT to use

- When the user wants a full explanation, not a short reply.
- For coding tasks (governs prose, not code).

## Activating

Part of the `caveman-mode` and `simple` presets.

```
cordis_run pluginId=cavm-2 packageId=pkg-6 mode=run
```

## Deactivating

`cordis_stop pluginId=cavm-2`.

## Source of truth

`Projects/deepseek-harness/.agents/skills/dyno-pony/packages/caveman.js`

## Upstream

github.com/JuliusBrussee/caveman (MIT). Local additions: AR description, single composite tool, soft call-count note.
