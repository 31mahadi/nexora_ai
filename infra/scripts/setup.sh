#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$ROOT_DIR"

echo "Installing dependencies..."
bun install

echo "Starting Docker services..."
cd "$ROOT_DIR/infra/docker"
docker compose up -d

echo "Waiting for PostgreSQL..."
sleep 5

echo "Running migrations..."
cd "$ROOT_DIR"
export DATABASE_URL="postgres://nexora:nexora_dev@localhost:5432/nexora"
"$SCRIPT_DIR/migrate.sh"

echo "Setup complete. Run 'bun run dev' to start development."
