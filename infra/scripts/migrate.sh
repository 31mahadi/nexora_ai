#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$(cd "$SCRIPT_DIR/../migrations" && pwd)"
DATABASE_URL="${DATABASE_URL:-postgres://nexora:nexora_dev@localhost:5432/nexora}"

echo "Running migrations from $MIGRATIONS_DIR"
for f in "$MIGRATIONS_DIR"/*.sql; do
  if [ -f "$f" ]; then
    echo "Applying $(basename "$f")..."
    psql "$DATABASE_URL" -f "$f" || true
  fi
done
echo "Migrations complete."
