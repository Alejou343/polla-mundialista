#!/usr/bin/env bash
# SessionStart hook — imprime el estado del proyecto cuando arranca una sesión de Claude Code.
# Output va a stdout, Claude lo lee como contexto inicial.

set -u

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

echo "🏆 Polla Mundial 2026 — Estado del proyecto"
echo "==========================================="

# 1. Verificar archivos críticos
echo ""
echo "📋 Archivos clave:"
for f in CLAUDE.md package.json .env.local supabase/migrations/0001_init.sql; do
  if [ -f "$f" ]; then
    echo "  ✓ $f"
  else
    echo "  ✗ $f (FALTA)"
  fi
done

# 2. Variables de entorno necesarias (solo verifica presencia, no valor)
echo ""
echo "🔐 Variables de entorno (.env.local):"
if [ -f ".env.local" ]; then
  for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY FAMILY_INVITE_CODE CRON_SECRET; do
    if grep -q "^$var=" .env.local 2>/dev/null; then
      echo "  ✓ $var"
    else
      echo "  ✗ $var (FALTA)"
    fi
  done
else
  echo "  ⚠️  .env.local no existe — copia de .env.local.example"
fi

# 3. Migraciones pendientes
echo ""
echo "🗄️  Migraciones SQL:"
if [ -d "supabase/migrations" ]; then
  count=$(find supabase/migrations -name "*.sql" -type f 2>/dev/null | wc -l)
  echo "  $count archivos de migración"
  ls -1 supabase/migrations/*.sql 2>/dev/null | tail -3 | sed 's|.*/||' | awk '{print "    - " $0}'
fi

# 4. Estado de tests (si hay setup)
echo ""
echo "🧪 Tests:"
if [ -d "tests" ]; then
  test_count=$(find tests -name "*.test.ts" -o -name "*.test.tsx" 2>/dev/null | wc -l)
  echo "  $test_count archivos de test"
else
  echo "  (sin carpeta tests/ aún)"
fi

# 5. Recordatorios contextuales
echo ""
echo "💡 Recordatorios:"
TODAY_EPOCH=$(date +%s)
KICKOFF_EPOCH=$(date -d "2026-06-11T16:00:00Z" +%s 2>/dev/null || echo 0)
if [ "$KICKOFF_EPOCH" -gt 0 ]; then
  DIFF_DAYS=$(( (KICKOFF_EPOCH - TODAY_EPOCH) / 86400 ))
  if [ "$DIFF_DAYS" -gt 0 ]; then
    echo "  ⏳ Faltan $DIFF_DAYS días para el partido inaugural (11 jun 2026)"
  elif [ "$DIFF_DAYS" -ge -39 ]; then
    echo "  ⚽ ¡Mundial en curso! Aprox día $(( -DIFF_DAYS + 1 )) de 39"
  else
    echo "  🏁 Mundial 2026 finalizado"
  fi
fi

echo ""
echo "📖 Comandos clave: /agregar-partido · /calcular-puntos · /revisar-rls · /crear-migracion · /seed-partidos · /deploy-preview"
echo "==========================================="
exit 0
