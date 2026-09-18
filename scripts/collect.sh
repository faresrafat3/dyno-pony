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
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DSH="${DSH_HOME:-$HOME/.dsh}"

changed=0
for d in "$ROOT"/dynamic-skills/*/; do
  name="$(basename "$d")"
  live="$DSH/skills/$name/SKILL.md"
  repo="$ROOT/dynamic-skills/$name/SKILL.md"
  [ -f "$live" ] || { echo "~ $name: not installed in runtime, skipping"; continue; }
  if ! diff -q "$repo" "$live" >/dev/null 2>&1; then
    echo "DIFF $name:"
    diff "$repo" "$live" | head -10 || true
    changed=$((changed+1))
    if [ "${1:-}" = "--apply" ]; then
      cp "$live" "$repo"
      echo "  -> collected into repo"
    fi
  fi
done

echo
if [ "$changed" -eq 0 ]; then echo "runtime and repo agree — nothing to collect"; 
elif [ "${1:-}" = "--apply" ]; then echo "collected $changed skill(s) — commit them now";
else echo "$changed skill(s) differ. Re-run with --apply to collect."; fi
