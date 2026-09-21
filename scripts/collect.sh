#!/usr/bin/env bash
# collect.sh — flow LIVE fixes made in the runtime back into this repo.
#
#   bash scripts/collect.sh          # dry run: show diffs only
#   bash scripts/collect.sh --apply  # copy changed skills into the repo
#
# The runtime (~/.dsh/skills) is a deployment target, not the source of truth.
# When a session fixes a skill live (as the 2026-09-18 session fixed the
# inverted schema contract), collect.sh is how that fix accretes in git
# instead of evaporating at the next update. Review the diff before --apply.
#
# Both trees are covered: dynamic-skills/ (plugin-backed) and skills/ (prose).
# It also prints every skill that lives ONLY in the runtime — those exist in
# exactly one place, with no git history and no backup, so install.sh would
# delete them for good. That blind spot cost a whole compression pass on
# 2026-09-20: 33 shortened skills sat in the runtime for a day before they were
# collected (2026-09-21).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DSH="${DSH_HOME:-$HOME/.dsh}"

changed=0
for tree in dynamic-skills skills; do
  [ -d "$ROOT/$tree" ] || continue
  for d in "$ROOT/$tree"/*/; do
    name="$(basename "$d")"
    live="$DSH/skills/$name/SKILL.md"
    repo="$ROOT/$tree/$name/SKILL.md"
    [ -f "$live" ] || { echo "~ $tree/$name: not installed in runtime, skipping"; continue; }
    if ! diff -q "$repo" "$live" >/dev/null 2>&1; then
      echo "DIFF $tree/$name:"
      diff "$repo" "$live" | head -10 || true
      changed=$((changed+1))
      if [ "${1:-}" = "--apply" ]; then
        cp "$live" "$repo"
        echo "  -> collected into repo"
      fi
    fi
  done
done

# Skills with no repo home: the dangerous case, because nothing here owns them.
for live in "$DSH"/skills/*/; do
  [ -d "$live" ] || continue
  name="$(basename "$live")"
  if [ -f "$ROOT/dynamic-skills/$name/SKILL.md" ] || [ -f "$ROOT/skills/$name/SKILL.md" ]; then
    continue
  fi
  echo "RUNTIME-ONLY $name: lives only in $DSH/skills — one copy, no git history, no backup"
done

echo
if [ "$changed" -eq 0 ]; then echo "runtime and repo agree — nothing to collect"
elif [ "${1:-}" = "--apply" ]; then echo "collected $changed skill(s) — commit them now"
else echo "$changed skill(s) differ. Re-run with --apply to collect."; fi
