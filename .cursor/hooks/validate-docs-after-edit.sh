#!/usr/bin/env bash
# Roda validação de docs após edição em paths críticos.
set -euo pipefail

input=$(cat)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

file_path=""
if command -v node >/dev/null 2>&1; then
  file_path=$(node -e "
    try {
      const d = JSON.parse(process.argv[1]);
      const p = d.file_path || d.path || d.filePath || '';
      process.stdout.write(String(p));
    } catch { process.exit(0); }
  " "$input" 2>/dev/null || true)
fi

if [[ -z "$file_path" ]]; then
  echo '{}'
  exit 0
fi

if [[ "$file_path" =~ (docs/business|docs/briefings|memory-bank|docs/ops|\.cursor/rules) ]]; then
  (cd "$ROOT" && npm run validate) >&2 || true
fi

echo '{}'
exit 0
