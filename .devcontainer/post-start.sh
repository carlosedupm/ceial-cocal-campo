#!/usr/bin/env bash
set -euo pipefail

# Se /ssh-agent não for socket válido, desabilitar agent quebrado (comum no WSL2)
if [ -n "${SSH_AUTH_SOCK:-}" ] && [ ! -S "${SSH_AUTH_SOCK}" ]; then
  unset SSH_AUTH_SOCK
  export SSH_AUTH_SOCK=
fi

# Smoke test opcional (não falha o container)
if ssh -o BatchMode=yes -o ConnectTimeout=5 -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "Git SSH: OK"
else
  echo "Git SSH: verifique chave/agent no host (ver README)"
fi
