#!/usr/bin/env bash
# PreToolUse Edit/Write/MultiEdit hook — protege archivos que no deben editarse.
# Exit 2 = bloquea.

set -u

INPUT="$(cat)"

if command -v jq >/dev/null 2>&1; then
  PATH_TARGET=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
else
  PATH_TARGET=$(echo "$INPUT" | grep -oE '"(file_path|path)":"[^"]*"' | head -1 | sed -E 's/"(file_path|path)":"//;s/"$//')
fi

if [ -z "$PATH_TARGET" ]; then
  exit 0
fi

# Lista de patrones de archivos protegidos
PROTECTED_PATTERNS=(
  '\.env$'
  '\.env\.local$'
  '\.env\.production$'
  'supabase/migrations/0001_init\.sql$'
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$PATH_TARGET" | grep -qE "$pattern"; then
    echo "🚫 Edición bloqueada: '$PATH_TARGET' es un archivo protegido." >&2
    case "$PATH_TARGET" in
      *.env*)
        echo "Las variables de entorno se editan manualmente. Pide al usuario que las cambie." >&2
        ;;
      *0001_init.sql)
        echo "La migración inicial es inmutable. Usa la skill 'migracion-sql' o el comando /crear-migracion para crear una migración nueva." >&2
        ;;
    esac
    exit 2
  fi
done

exit 0
