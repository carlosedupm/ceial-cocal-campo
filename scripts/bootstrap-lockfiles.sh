#!/usr/bin/env bash
# Gera go.sum e package-lock.json dentro dos containers (sem Go/Node no host).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> go mod tidy (container api)..."
docker compose run --rm --no-deps api go mod tidy

echo "==> npm install (container frontend)..."
docker compose run --rm --no-deps frontend npm install

echo "==> Lockfiles atualizados."
