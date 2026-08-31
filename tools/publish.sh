#!/usr/bin/env bash
# Publish the site to GitHub Pages under your own account.
#
# Run this once you have logged in:
#
#     gh auth login          # pick GitHub.com, HTTPS, log in with a browser
#     ./tools/publish.sh
#
# After the first run, publishing an update is just:
#
#     ./tools/publish.sh
#
# It commits whatever has changed and pushes. GitHub rebuilds the site in
# about a minute.

set -euo pipefail

REPO_NAME="${REPO_NAME:-sammer-studios}"
BRANCH="main"

cd "$(dirname "$0")/.."

if ! command -v gh >/dev/null 2>&1; then
  echo "The GitHub CLI is not installed. Install it with:  brew install gh" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "You are not logged in to GitHub yet. Run this first:" >&2
  echo "" >&2
  echo "    gh auth login" >&2
  echo "" >&2
  echo "Choose GitHub.com, then HTTPS, then log in with a web browser." >&2
  exit 1
fi

USER=$(gh api user --jq .login)
echo "Logged in as $USER"

if [ ! -d .git ]; then
  git init -q -b "$BRANCH"
fi

git add -A
if git diff --cached --quiet; then
  echo "Nothing has changed since the last publish."
else
  git commit -q -m "Update site"
  echo "Committed the changes."
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  if gh repo view "$USER/$REPO_NAME" >/dev/null 2>&1; then
    echo "Repository $USER/$REPO_NAME already exists, connecting to it."
    git remote add origin "https://github.com/$USER/$REPO_NAME.git"
  else
    echo "Creating the repository ..."
    gh repo create "$REPO_NAME" --public \
      --description "Photography by Sammer Marzouk" --source=. --remote=origin
  fi
fi

echo "Pushing (this takes a minute the first time, the photographs are large) ..."
git push -u origin "$BRANCH" --force

echo "Turning on GitHub Pages ..."
gh api -X POST "repos/$USER/$REPO_NAME/pages" \
  -f "source[branch]=$BRANCH" -f "source[path]=/" >/dev/null 2>&1 \
  || gh api -X PUT "repos/$USER/$REPO_NAME/pages" \
       -f "source[branch]=$BRANCH" -f "source[path]=/" >/dev/null 2>&1 \
  || echo "  (Pages may already be on. Check the repository settings.)"

echo ""
echo "Done. In a minute or two your site will be live at:"
echo ""
echo "    https://$USER.github.io/$REPO_NAME/"
echo ""
echo "To use your own domain later, buy one, add it under"
echo "Settings > Pages > Custom domain, and update the canonical and"
echo "og:url tags in the five HTML files."
