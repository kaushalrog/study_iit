#!/usr/bin/env bash
# Runs tests/cloud against the Supabase project in .env, signing in as the throwaway user in .env.cloud-test.
set -euo pipefail
cd "$(dirname "$0")/../.."
[ -f .env ] || { echo "Missing .env (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY)"; exit 2; }
[ -f .env.cloud-test ] || { echo "Missing .env.cloud-test. Copy .env.cloud-test.example and fill it in."; exit 2; }
set -a; . ./.env; . ./.env.cloud-test; set +a
export ORBIT_CLOUD_URL="$EXPO_PUBLIC_SUPABASE_URL" ORBIT_CLOUD_KEY="$EXPO_PUBLIC_SUPABASE_ANON_KEY"
[ -n "${ORBIT_CLOUD_PASSWORD:-}" ] || { echo "ORBIT_CLOUD_PASSWORD is empty in .env.cloud-test"; exit 2; }
npx jest tests/cloud --runInBand "$@"
