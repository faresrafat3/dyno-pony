---
name: git-guardrails
description: Set up a PreToolUse hook that blocks dangerous git commands (push, reset --hard, clean, branch -D, etc.) before they execute in the bash tool. Use when the user wants to prevent destructive git operations, add git safety hooks, or says "block git push", "stop me from doing X", "safety net for git".
whenToUse: "A bash hook that runs before any bash call and rejects `git push` (all variants), `git reset --hard`, `git clean -f`/`-fd`, `git branch -D`, `git checkout .`, `git restore .`. The blocked command exits with code 2 and prints a clear BLOCKED message. Scope: project-local (`.claude/settings.json` or DSH equivalent) or global (`~/.claude/settings.json`)."
metadata:
  category: safety
  scope: hook
  author: dyno-pony/sprint-4
  upstream: derived from mattpocock/skills (MIT, git-guardrails-claude-code)
---

# Git Guardrails

**PreToolUse hook** blocking dangerous git pre-execution; agent sees BLOCKED + exit 2 (no authority).

## Blocked

`git push` (all incl. `--force`) · `git reset --hard` · `git clean -f`/`-fd` · `git branch -D` · `git checkout .`/`git restore .`.

## Setup

1. **Scope** — ask project vs all: `<repo>/.claude/settings.json` (or DSH equiv) vs `~/.claude/settings.json`. DSH `bash` takes a `PreToolUse` list — see docs for registration point.
2. **Script** — copy to `<repo>/.claude/hooks/block-dangerous-git.sh` or `~/.claude/hooks/…`; `chmod +x`. Reads `{"tool_input":{"command":"..."}}`, exits 2 + BLOCKED to stderr on hit.
3. **Register** — add to settings (project shown; global same, `~` path); merge into `hooks.PreToolUse`, never overwrite:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous-git.sh"
          }
        ]
      }
    ]
  }
}
```

4. **Customise (optional)** — ask additions/removals: `git stash drop` · `git tag -d <name>` · `git rebase` (sans strategy).
5. **Verify** — `echo '{"tool_input":{"command":"git push origin main"}}' | <script>` → exit 2 + BLOCKED; repeat per pattern.

## NOT this

Not backup (protections + reflogs are durable; hook catches agent destructives) · not guarantee (*command* string, not *effect* — hiding `git push` in alias/wrapper evades) · not allow-list (block-list only; swap script for positive check).

## Failure modes

**Path moved** (hooks dir relocated sans settings update) → guard silently dead; verify per install. **Settings overwritten** (sync/tool) → hook gone; check-in test in `pre-commit` if present. **Unlisted destructive** → snapshot not guarantee; review on new tool/workflow.
