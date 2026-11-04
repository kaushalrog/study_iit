#!/usr/bin/env bash
# Validate academic content before it is published to Supabase: rebuild the JSON from its sources (answer keys are
# recomputed there), run the independent audit, then run the app's own importer over every file.
set -euo pipefail
cd "$(dirname "$0")/.."
for f in content/src/*.py; do case "$f" in *lib.py) ;; *) python3 "$f" ;; esac; done
python3 content/audit/audit.py
npx jest tests/integration/content-pack.test.ts tests/integration/contentSync.test.ts tests/unit/sha256.test.ts
echo "Content is valid. Publish with: npm run content:publish"
