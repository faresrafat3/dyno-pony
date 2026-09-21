---
name: diagnose
description: Disciplined diagnosis loop for hard bugs and performance regressions. Use when the user says "diagnose", "debug this", "what's wrong with", reports something broken / throwing / failing / slow / flaky / regressed, or hands you a stack trace with no obvious cause.
whenToUse: "Run a 6-phase diagnosis loop: (1) build a tight feedback loop, (2) reproduce and minimise, (3) hypothesise with 3-5 ranked candidates, (4) instrument, (5) fix + regression test, (6) cleanup. Each phase has a completion criterion; do not skip. The skill is designed to prevent the most common debugging failure: jumping to a hypothesis before you have a loop that goes red on this bug."
metadata:
  category: engineering
  scope: debugging
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, diagnosing-bugs)
---

# Diagnose

Discipline for hard bugs. Skip phases only with explicit justification.

## Redact first

Before showing commands/outputs/artifacts: **redact every secret** (`<REDACTED>`). Build loops against env vars. If redacted output insufficient, ask user.

## Phase 1: Build a feedback loop

**This is the skill.** Tight pass/fail signal going red on *this* bug finds the cause; staring without one never does.

### Construction options, roughly ordered

1. **Failing test** at seam reaching bug (unit/integration/e2e).
2. **Curl / HTTP script** vs running dev server.
3. **CLI invocation** w/ fixture, diff stdout vs known-good snapshot.
4. **Headless browser** (Playwright/Puppeteer) asserting DOM/console/network.
5. **Replay captured trace** (HAR, log, event log) through code path.
6. **Throwaway harness** — minimal subset exercising bug path.
7. **Property / fuzz loop** — 1000 random inputs, find failure mode.
8. **Bisection harness** — "boot at X, check, repeat" for `git bisect run`.
9. **Differential loop** — same input through old vs new, diff outputs.
10. **HITL bash script** — last resort if human must click.

### Tighten the loop

Treat as product. Once *a* loop exists: faster? (skip init, narrow scope.) Sharper? (assert exact symptom, not "didn't crash".) More deterministic? (pin time, seed RNG, isolate FS, freeze net.)

30s flaky loop ≈ none. 2s deterministic loop = superpower.

### Non-deterministic bugs

Goal: **higher reproduction rate**. Loop trigger 100×, parallelise, narrow timing. 50%-flake debuggable; 1% is not.

### When no loop is possible

Stop and say so. List attempts. Ask user for: (a) environment access, (b) redacted artifact (HAR/log/core/screen recording), (c) temp prod instrumentation. No hypothesizing without a loop.

### Completion criterion

Done when you name **one command** (script/test/curl) **already run ≥once** (show invocation + redacted output):

- [ ] **Red-capable**: drives bug path, asserts exact symptom.
- [ ] **Deterministic**: same verdict every run (or pinned high repro rate).
- [ ] **Fast**: seconds, not minutes.
- [ ] **Agent-runnable**: no human in loop.

Reading code to theorize before this command exists = the failure this skill prevents. **Stop.**

## Phase 2: Reproduce + minimise

Run loop. Watch it go red.

- [ ] Failure = **user's** symptom, not nearby one. Wrong bug = wrong fix.
- [ ] Reproducible (or high rate if nondeterministic).
- [ ] Exact symptom captured.

**Minimise:** cut inputs/callers/config/data/steps **one at a time**, re-run after each. Keep only load-bearing.
Done when removing any remainder turns loop green.

## Phase 3: Hypothesise

Generate **3–5 ranked hypotheses** before testing any. Each **falsifiable**: "If X, then changing Y removes bug / changing Z worsens it." No prediction = vibe: discard/sharpen.

**Show ranked list to user** before testing. Domain knowledge re-ranks instantly. Don't block; proceed w/ your ranking if AFK.

## Phase 4: Instrument

Each probe maps to one Phase-3 prediction. **One variable at a time.**

1. **Debugger / REPL** — one breakpoint beats ten logs.
2. **Targeted logs** at boundaries distinguishing hypotheses.
3. Never "log everything and grep".

**Tag debug logs** w/ unique prefix (`[DEBUG-a4f2]`); cleanup = one grep. Untagged survive; tagged die.

**Perf branch:** logs wrong for perf regressions. Baseline first (`performance.now()`, profiler, query plan), then bisect. Measure, then fix.

## Phase 5: Fix + regression test

Write regression test **before** fix, but only at a **correct seam** — one exercising the **real bug pattern** at call site. Too-shallow seam (single-caller when bug needs multiple) gives false confidence. **No correct seam = the finding**: architecture prevents lockdown. Flag it.

If seam exists: minimised repro → failing test → watch fail → fix → watch pass → re-run Phase-1 loop on original scenario.

## Phase 6: Cleanup

Before done:

- [ ] Original repro gone (re-ran Phase-1 loop).
- [ ] Regression test passes (or missing seam documented).
- [ ] `[DEBUG-...]` removed (grep prefix).
- [ ] Throwaways deleted / moved to marked debug location.
- [ ] Correct hypothesis in commit/PR message for next debugger.

## Points to architecture

"No good seam to lock down" → hand off to `improve-codebase-architecture` w/ gap as deepening opportunity.
