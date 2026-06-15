#!/usr/bin/env bash
# Bloqueia git commit --no-verify (hooks de commit devem rodar).
set -euo pipefail

input=$(cat)
command=""

if command -v node >/dev/null 2>&1; then
  command=$(node -e "
    try {
      const d = JSON.parse(process.argv[1]);
      process.stdout.write(String(d.command || ''));
    } catch { process.exit(0); }
  " "$input" 2>/dev/null || true)
fi

if [[ "$command" =~ --no-verify|--no-gpg-sign ]]; then
  cat <<'EOF'
{
  "permission": "deny",
  "user_message": "git commit com --no-verify ou --no-gpg-sign não é permitido neste projeto.",
  "agent_message": "Hook bloqueou bypass de hooks de commit. Corrija os problemas reportados pelos hooks."
}
EOF
  exit 0
fi

echo '{"permission": "allow"}'
exit 0
