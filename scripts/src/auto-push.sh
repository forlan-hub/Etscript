#!/bin/bash
# auto-push.sh — Commit and push any pending changes to GitHub.
# Usage: bash scripts/src/auto-push.sh
# Or run continuously: watch -n 300 bash scripts/src/auto-push.sh

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")

git add -A

if git diff --cached --quiet; then
  echo "[$TIMESTAMP] Nothing to commit."
  exit 0
fi

CHANGED=$(git diff --cached --name-only | head -5 | tr '\n' ', ' | sed 's/,$//')
COUNT=$(git diff --cached --name-only | wc -l | tr -d ' ')

if [ "$COUNT" -gt 5 ]; then
  MSG="chore: auto-save $COUNT files [$TIMESTAMP]"
else
  MSG="chore: update $CHANGED [$TIMESTAMP]"
fi

git commit -m "$MSG"
git push origin "$BRANCH"

echo "[$TIMESTAMP] Pushed to $BRANCH: $MSG"
