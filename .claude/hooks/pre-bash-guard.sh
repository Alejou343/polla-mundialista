#!/usr/bin/env bash
# PreToolUse Bash hook — bloquea comandos peligrosos.
# Recibe el JSON del tool call por stdin.
# Exit 2 = bloquea ejecución, mensaje en stderr llega a Claude.

set -u

INPUT="$(cat)"

# Extraer el comando (usa jq si está disponible, si no grep básico)
if command -v jq >/dev/null 2>&1; then
  CMD=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
else
  CMD=$(echo "$INPUT" | grep -o '"command":"[^"]*"' | head -1 | sed 's/"command":"//;s/"$//')
fi

# Lista de patrones peligrosos
BLOCK_PATTERNS=(
  'rm -rf /'
  'rm -rf ~'
  'rm -rf \*'
  ':(){:|:&};:'           # fork bomb
  'mkfs\.'
  'dd if=/dev/zero of='
  'DROP TABLE'
  'DROP DATABASE'
  'TRUNCATE TABLE'
  'DELETE FROM .* WHERE 1=1'
  'DELETE FROM .*;'        # delete sin where (cuidado: solo si termina con ;)
  'sudo '
  'chmod -R 777'
  '> .env'                 # sobrescribir env
  '> .env.local'
)

for pattern in "${BLOCK_PATTERNS[@]}"; do
  if echo "$CMD" | grep -qiE "$pattern"; then
    echo "🚫 Comando bloqueado por hook: coincide con patrón peligroso '$pattern'" >&2
    echo "Si realmente necesitas correr esto, pídele al usuario que lo ejecute manualmente." >&2
    exit 2
  fi
done

# Bloqueos contextuales: nunca hacer git push --force sin confirmar
if echo "$CMD" | grep -qE 'git push.*(--force|-f\b)'; then
  echo "🚫 'git push --force' bloqueado por hook. Pide confirmación explícita al usuario antes de force-push." >&2
  exit 2
fi

# Bloquear operaciones destructivas en supabase/migrations/0001_init.sql
if echo "$CMD" | grep -qE '(rm|mv|>) .*supabase/migrations/0001_init\.sql'; then
  echo "🚫 El archivo 0001_init.sql es inmutable. Crea una migración nueva en su lugar." >&2
  exit 2
fi

exit 0
