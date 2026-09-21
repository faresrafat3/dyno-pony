---
name: caveman
description: >
  Terse prose mode (وضع الكلام المختصر). Governs HOW the model TALKS, not WHAT it builds. Pair
  with pony for terse-prose + lazy-mindset, or use standalone. Use when the user says "caveman",
  "terse", "short", "concise", "stop the fluff", "no preamble", or complains about verbose,
  padded, polite filler responses. Off with "stop caveman" or "normal mode".
whenToUse: "Use when the user wants short replies, drop filler, or to remove preamble / sign-offs / politeness padding."
metadata:
  pluginId: process-local — part of the dyno-pony bundle (e.g. dyno-5)
  packageId: process-local (minted fresh each session)
  preset: caveman-mode
  cordisDefine: "kind=new idPrefix=dyno → load packages/dyno-pony.js from disk"
  actions: [terse, prose, mode, reset]
---
# Caveman — Terse prose
Part of the dyno-pony merged bundle. One tool: `caveman`.
## What this skill does
Tired-senior-dev voice: short sentences, no filler/emoji/sign-offs, no "happy to"/"let me".
## Tools and actions
| Action | Effect |
|---|---|
| `caveman(action="terse", n=3)` | Max N-word replies. Default 3. |
| `caveman(action="prose")` | Drop filler/throat-clearing/sign-offs. **Default.** |
| `caveman(action="mode", level="prose")` | Same as `prose()`. |
| `caveman(action="mode", level="terse")` | 3 words max. |
| `caveman(action="mode", level="one")` | One-word replies. |
| `caveman(action="reset")` | Normal prose. |
## When to use
"caveman"/"terse"/"short"/"concise"/"stop the fluff"/"no preamble"; filler complaints; wants fragments.
## When NOT to use
Full explanations; coding tasks (prose, not code).
## Activating
Comes with the merged bundle — `rebuild.sh` mounts it, no per-skill `cordis_run`. Presets: `caveman-mode`+`simple`.
## Deactivating
`caveman(action=reset)`; whole arsenal: `cordis_stop pluginId=<the bundle's id>`.
## Source of truth
`~/Projects/dyno-pony/packages/caveman.js`
## Upstream
github.com/JuliusBrussee/caveman (MIT) + AR description, composite tool, call-count note.
