#!/usr/bin/env bash
# PostToolUse Edit/Write/MultiEdit hook — corre prettier sobre el archivo modificado
# y reporta errores de typecheck/lint si los hay.
# Exit 0 siempre (no bloquea); usa stderr para feedback.

set -u

INPUT="$(cat)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

if command -v jq >/dev/null 2>&1; then
  FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
else
  FILE=$(echo "$INPUT" | grep -oE '"(file_path|path)":"[^"]*"' | head -1 | sed -E 's/"(file_path|path)":"//;s/"$//')
fi

if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  exit 0
fi

# Solo procesa archivos de código del proyecto
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md|*.css)
    : # continúa
    ;;
  *)
    exit 0
    ;;
esac

# Formato con prettier (silencioso, no bloquea)
if [ -f "package.json" ] && command -v npx >/dev/null 2>&1; then
  npx --no-install prettier --write "$FILE" >/dev/null 2>&1 || true
fi

# Typecheck rápido si es .ts/.tsx (solo report, no bloquea)
case "$FILE" in
  *.ts|*.tsx)
    if [ -f "tsconfig.json" ] && command -v npx >/dev/null 2>&1; then
      TC_OUTPUT=$(npx --no-install tsc --noEmit --pretty false 2>&1 | grep "$FILE" | head -5)
      if [ -n "$TC_OUTPUT" ]; then
        echo "⚠️ TypeScript errors en $FILE:" >&2
        echo "$TC_OUTPUT" >&2
      fi
    fi
    ;;
esac

# Verificación específica: si tocó algo en app/ o components/, asegurar que no se importó admin client en cliente
case "$FILE" in
  *.tsx)
    if grep -q "'use client'" "$FILE" && grep -qE "from ['\"].*supabase/admin['\"]" "$FILE"; then
      echo "❌ ALERTA DE SEGURIDAD en $FILE: archivo con 'use client' está importando supabase/admin (service role). ESTO ES UN BUG GRAVE." >&2
    fi
    ;;
esac

exit 0
