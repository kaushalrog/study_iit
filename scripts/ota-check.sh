#!/usr/bin/env bash
# Show what is published on each channel and the runtime version this working copy would build.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Runtime version of this working copy (must equal the installed app's runtime to receive an update):"; npm run -s ota:runtime
for c in production preview; do echo; echo "== channel: $c"; npx eas-cli channel:view "$c" --non-interactive || echo "(not available: log in with npx eas-cli login)"; done
