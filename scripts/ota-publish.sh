#!/usr/bin/env bash
# Publish a JavaScript/TypeScript update over the air. Usage: scripts/ota-publish.sh production|preview ["message"]
# Needs a one-time EAS setup (docs/UPDATES.md): `npx eas-cli login` and `npx eas-cli init`.
set -euo pipefail
cd "$(dirname "$0")/.."
CHANNEL="${1:?channel: production or preview}"; MSG="${2:-$(git log -1 --pretty=%s)}"
case "$CHANNEL" in production|preview) ;; *) echo "channel must be production or preview"; exit 2;; esac
if ! grep -q '"projectId"' app.json 2>/dev/null && [ -z "${EXPO_PUBLIC_EAS_PROJECT_ID:-}" ]; then
  echo "No EAS project id. Run: npx eas-cli init   (see docs/UPDATES.md, 'One-time setup')"; exit 2
fi
echo "1/4 Typecheck and tests"; npm run test:all
echo "2/4 This update will only reach builds with this runtime version:"; npm run -s ota:runtime
echo "    If that differs from the runtime of the app on the phone, the phone will NOT receive it (and needs a new APK)."
echo "3/4 Publishing to channel '$CHANNEL'"; npx eas-cli update --platform android --channel "$CHANNEL" --environment "$CHANNEL" --message "$MSG" --non-interactive
echo "4/4 Done. The phone downloads it the next time ORBIT opens and uses it on the launch after that (or Settings > Software updates > Restart to apply)."
