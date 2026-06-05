#!/bin/bash
# Run this ONCE from the Replit CLI to connect your GitHub repo.
# CLI is available from the left sidebar menu → CLI

set -e

echo "🔗 Setting up GitHub remote for Etscript..."

git config user.name "forlan-hub"
git config user.email "forlan-hub@users.noreply.github.com"

# Remove old origin if it exists
git remote remove origin 2>/dev/null || true

# Add GitHub remote with token
git remote add origin "https://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@github.com/forlan-hub/Etscript.git"

# Set upstream branch
git branch -M main 2>/dev/null || true

echo "📦 Pushing all code to GitHub..."
git push -u origin main --force

echo ""
echo "✅ Done! Your code is now on GitHub:"
echo "   https://github.com/forlan-hub/Etscript"
echo ""
echo "To push future changes, run:"
echo "   bash scripts/src/auto-push.sh"
