#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"
API_URL="${VITE_API_PROXY_TARGET:-http://localhost:8080}"

bash "$ROOT/scripts/ensure-frontend-deps.sh"

echo "==> Aguardando API em ${API_URL}/health ..."
for _ in $(seq 1 60); do
  if curl -sf "${API_URL}/health" >/dev/null 2>&1; then
    echo "==> API disponível."
    break
  fi
  sleep 1
done

if ! curl -sf "${API_URL}/health" >/dev/null 2>&1; then
  echo "AVISO: API ainda indisponível — o Vite sobe mesmo assim; recarregue quando a API estiver no ar."
fi

export VITE_API_PROXY_TARGET="$API_URL"
cd "$FRONTEND"
exec ./node_modules/.bin/vite
