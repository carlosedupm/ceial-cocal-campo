#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/cocal-campo

echo "==> Validando documentação..."
npm run validate

echo "==> Instalando dependências frontend..."
if [ -d frontend/node_modules ] && [ ! -w frontend/node_modules ]; then
  echo "    Removendo frontend/node_modules (root)..."
  sudo rm -rf frontend/node_modules
fi
cd frontend && (test -f package-lock.json && npm ci || npm install)

echo "==> Baixando módulos Go..."
cd ../backend && go mod download

echo "==> Instalando Delve (debug Go opcional)..."
go install github.com/go-delve/delve/cmd/dlv@latest || true

echo ""
echo "Dev Container pronto. Inicie a aplicação:"
echo "  Run and Debug → 'Cocal Campo (API + PWA)' → F5"
echo ""
echo "URLs após o F5:"
echo "  PWA:  http://localhost:5173"
echo "  API:  http://localhost:8080/health"
echo ""
echo "Usuário de teste: colheita@cocal.dev / campo123"
