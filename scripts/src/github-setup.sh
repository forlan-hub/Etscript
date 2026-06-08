#!/bin/bash
# Run this ONCE from the Replit CLI to verify your GitHub remote is connected.
# The token is read from the GITHUB_PERSONAL_ACCESS_TOKEN environment variable.

set -e

OWNER="forlan-hub"
REPO="Etscript"

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set."
  exit 1
fi

echo "Configuring GitHub remote for Etscript..."

git config user.name "forlan-hub"
git config user.email "forlan-hub@users.noreply.github.com"

git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/${OWNER}/${REPO}.git"
git branch -M main 2>/dev/null || true

echo "Pushing to GitHub..."
git push -u origin main --force

echo "Done! https://github.com/${OWNER}/${REPO}"
