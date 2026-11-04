#!/usr/bin/env bash
# Build an APK. Only needed when native code or native dependencies change, or for the first OTA-enabled install.
# Usage: scripts/build-apk.sh [production|preview]   (production is the default)
set -euo pipefail
cd "$(dirname "$0")/.."
PROFILE="${1:-production}"
RUNTIME="$(npx expo-updates runtimeversion:resolve --platform android | python3 -c 'import json,sys; print(json.load(sys.stdin)["runtimeVersion"])')"
LAST="$(cat release-apk/RUNTIME.txt 2>/dev/null || true)"
if [ "$RUNTIME" = "$LAST" ]; then
  echo "The native runtime has not changed since the last released APK ($RUNTIME)."
  echo "An over-the-air update is enough: npm run ota:publish. Set FORCE=1 to build anyway."
  [ "${FORCE:-}" = "1" ] || exit 0
fi
[ -n "${EXPO_PUBLIC_EAS_PROJECT_ID:-}" ] || grep -q '"projectId"' app.json || { echo "No EAS project id: updates would be switched off in this build. Run npx eas-cli init first."; exit 2; }
npm run test:all
npx expo prebuild --platform android --no-install
( cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a )
mkdir -p release-apk
EMBEDDED="$(unzip -p android/app/build/outputs/apk/release/app-release.apk assets/fingerprint)"
if [ "$EMBEDDED" != "$RUNTIME" ]; then
  echo "STOP: the APK embeds runtime $EMBEDDED but 'eas update' would publish for $RUNTIME, so updates would not reach it."
  echo "Fix: make sure .fingerprintignore exists, then rerun with: (cd android && ./gradlew :app:createReleaseUpdatesResources --rerun) and build again."; exit 3
fi
cp android/app/build/outputs/apk/release/app-release.apk "release-apk/ORBIT-$PROFILE-arm64.apk"
echo "$RUNTIME" > release-apk/RUNTIME.txt
( cd release-apk && shasum -a 256 "ORBIT-$PROFILE-arm64.apk" > SHA256.txt && cat SHA256.txt )
echo "Runtime $RUNTIME. Install this APK once; later JS changes go out with: npm run ota:publish"
