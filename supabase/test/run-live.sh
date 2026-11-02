#!/usr/bin/env bash
# Runs the live Postgres tests (schema, RLS, two-device sync) against a throwaway local Postgres.
# Needs Postgres server binaries on PATH (e.g. `brew install postgresql@17`). Touches nothing outside a temp dir.
set -euo pipefail
cd "$(dirname "$0")/../.."
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
PORT="${ORBIT_LIVE_PG_PORT:-54329}"
TMP="$(mktemp -d /tmp/orbit-pg.XXXXXX)"; SOCK="$(mktemp -d /tmp/orbit-sock.XXXXXX)"
cleanup() { pg_ctl -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$TMP" "$SOCK"; }
trap cleanup EXIT
initdb -D "$TMP/data" -U postgres --auth=trust -E UTF8 >/dev/null
pg_ctl -D "$TMP/data" -o "-p $PORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=$SOCK" -l "$TMP/pg.log" -w start >/dev/null
PGPORT="$PORT" supabase/test/apply.sh orbit_live >/dev/null
ORBIT_LIVE_PG_PORT="$PORT" npx jest tests/live --runInBand "$@"   # serial: both files share one database
