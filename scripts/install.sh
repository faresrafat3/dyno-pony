#!/usr/bin/env bash
# install.sh — deploy dyno-pony from this repo (canonical) to the runtime.
#
#   bash scripts/install.sh
#
# Copies the merged bundle into ~/.dsh/dyno-pony/ and every skill — dynamic-skills/
# (plugin-backed) and skills/ (prose) — into ~/.dsh/skills/. Idempotent. Never
# touches the repo copy.
#
# Both trees: deploying only dynamic-skills/ left the prose skills hand-managed in
# the runtime, which is how 19 of them drifted a whole compression pass ahead of
# git (2026-09-20, collected 2026-09-21). collect.sh walks the same two trees.
#
# After installing, activate the arsenal in the DSH session with the loader
# recipe printed at the end (also in README §Recovery).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DSH="${DSH_HOME:-$HOME/.dsh}"

BUNDLE_SRC="$ROOT/packages/dyno-pony.js"
BUNDLE_DST="$DSH/dyno-pony/packages/dyno-pony.js"

[ -f "$BUNDLE_SRC" ] || { echo "FATAL: $BUNDLE_SRC missing — run scripts/merge-plugins.cjs first" >&2; exit 1; }

mkdir -p "$DSH/dyno-pony/packages" "$DSH/skills"
cp "$BUNDLE_SRC" "$BUNDLE_DST"

n=0
for tree in dynamic-skills skills; do
  [ -d "$ROOT/$tree" ] || continue
  for d in "$ROOT/$tree"/*/; do
    name="$(basename "$d")"
    rm -rf "$DSH/skills/$name"
    cp -r "$d" "$DSH/skills/$name"
    n=$((n+1))
  done
done

echo "installed: bundle -> $BUNDLE_DST"
echo "installed: $n skills -> $DSH/skills/"
echo
echo "Activate in the DSH session (3 tool calls):"
echo "  1. cordis_define kind=new idPrefix=dyno  with the loader host code from README §Recovery"
echo "  2. cordis_run pluginId=<returned> packageId=<returned> mode=run"
echo "  3. verify: cordis_inspect_query Tool listTools -> 38 dyno-pony tools"
