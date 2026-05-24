#!/usr/bin/env bash
# Stop hook — corre al final del turno de Claude.
# Imprime un resumen de cambios sin afectar la respuesta.
# Exit 0 = OK (no fuerza continuación).

set -u

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

# Solo correr si es repo git
if [ ! -d ".git" ]; then
  exit 0
fi

# Cambios sin commitear
CHANGES=$(git status --short 2>/dev/null)

if [ -z "$CHANGES" ]; then
  exit 0
fi

# Contar archivos modificados
COUNT=$(echo "$CHANGES" | wc -l | tr -d ' ')

# Solo imprime si hay 1+ cambios — minimiza ruido
echo ""
echo "📝 Cambios sin commitear ($COUNT archivos):" >&2
echo "$CHANGES" | head -10 >&2

# Advertencias específicas
if echo "$CHANGES" | grep -q "supabase/migrations/"; then
  echo "" >&2
  echo "🗄️  Tocaste migraciones SQL. Recuerda correr 'pnpm db:migrate' antes de probar." >&2
fi

if echo "$CHANGES" | grep -qE "lib/scoring\.ts"; then
  echo "" >&2
  echo "🎯 Modificaste el algoritmo de puntuación. Asegúrate de que 'pnpm test' pase." >&2
fi

if echo "$CHANGES" | grep -qE "\.env"; then
  echo "" >&2
  echo "🔐 Tocaste un archivo .env. Verifica que no commitearás secretos al repo." >&2
fi

exit 0
