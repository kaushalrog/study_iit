#!/usr/bin/env bash
# Usage: PGPORT=54329 ./apply.sh <dbname>   (drops and recreates the database, then applies bootstrap + migrations + seed)
set -euo pipefail
DB="${1:?db name}"; HERE="$(cd "$(dirname "$0")/.." && pwd)"
P=(psql -h "${PGHOST:-127.0.0.1}" -p "${PGPORT:-54329}" -U postgres -v ON_ERROR_STOP=1 -q)
"${P[@]}" -d postgres -c "drop database if exists $DB with (force)" -c "create database $DB"
"${P[@]}" -d "$DB" -f "$HERE/test/bootstrap.sql"
for f in "$HERE"/migrations/*.sql; do echo "== $(basename "$f")"; "${P[@]}" -d "$DB" -f "$f"; done
echo "== seed.sql"; "${P[@]}" -d "$DB" -f "$HERE/seed/seed.sql"
