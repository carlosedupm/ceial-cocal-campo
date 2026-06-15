#!/usr/bin/env bash
# Garante dependências do frontend antes do F5 (launch.json).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"

if [ -x "$FRONTEND/node_modules/.bin/vite" ]; then
  exit 0
fi

if [ -d "$FRONTEND/node_modules" ] && [ ! -w "$FRONTEND/node_modules" ]; then
  echo "==> frontend/node_modules pertence a root (geralmente após npm run dev com profile stack)."
  if command -v sudo >/dev/null 2>&1; then
    echo "    Removendo com sudo..."
    sudo rm -rf "$FRONTEND/node_modules"
  else
    echo ""
    echo "ERRO: sem permissão para escrever em frontend/node_modules."
    echo ""
    echo "Corrija uma vez (no host ou após Rebuild do Dev Container):"
    echo "  sudo rm -rf frontend/node_modules"
    echo ""
    echo "Depois pressione F5 novamente."
    exit 1
  fi
fi

echo "==> Instalando dependências do frontend..."
cd "$FRONTEND"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

if [ ! -x "$FRONTEND/node_modules/.bin/vite" ]; then
  echo "ERRO: vite não encontrado após npm ci."
  exit 1
fi
