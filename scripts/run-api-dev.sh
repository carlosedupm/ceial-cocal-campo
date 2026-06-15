#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"

export DATABASE_URL="${DATABASE_URL:-postgres://cocal:cocal@postgres:5432/cocal_campo?sslmode=disable}"
export JWT_SECRET="${JWT_SECRET:-dev-secret-change-in-prod}"
export PORT="${PORT:-8080}"
export CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:5173}"

cd "$BACKEND"
exec go run ./cmd/api
