#!/usr/bin/env bash
# Build the web version of ORBIT and publish it to GitHub Pages from a separate public repository (the source repository can stay private).
# Usage: scripts/deploy-web.sh [owner/repo]     default: kaushalrog/orbit-web  ->  https://kaushalrog.github.io/orbit-web/
# Needs: gh logged in (gh auth status) and git able to push to that repository.
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="${1:-kaushalrog/orbit-web}"; NAME="${REPO#*/}"; OWNER="${REPO%/*}"
export ORBIT_WEB_BASE="/$NAME"
echo "1/4 Build (base path $ORBIT_WEB_BASE)"
rm -rf dist-web; npx expo export --platform web --output-dir dist-web
cp dist-web/index.html dist-web/404.html        # Pages serves 404.html for unknown paths, so deep links and refreshes still open the app
touch dist-web/.nojekyll                        # without this Pages hides the _expo folder
echo "2/4 Make sure the repository exists"
gh repo view "$REPO" >/dev/null 2>&1 || gh repo create "$REPO" --public --description "ORBIT web build (static site)"
echo "3/4 Publish"
TMP="$(mktemp -d)"; cp -R dist-web/. "$TMP"; cp -f README-web.md "$TMP/README.md" 2>/dev/null || true
( cd "$TMP" && git init -q -b main && git add -A && git -c user.name="ORBIT deploy" -c user.email="deploy@users.noreply.github.com" commit -qm "Deploy ORBIT web build $(date -u +%Y-%m-%dT%H:%MZ)" && git remote add origin "https://github.com/$REPO.git" && git push -q --force origin main )
rm -rf "$TMP"
echo "4/4 Turn on Pages (main branch, root)"
gh api -X POST "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || gh api -X PUT "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 || true
echo "Published. It can take a minute to go live: https://$OWNER.github.io/$NAME/"
