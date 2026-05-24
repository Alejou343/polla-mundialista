---
description: Checklist completo antes de hacer deploy a Vercel
---

Ejecuta el checklist pre-deploy. **No hace deploy automáticamente**, solo verifica.

**Pasos:**

1. **Build limpio**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```
   Cualquier error rojo bloquea el deploy.

2. **Variables de entorno**: verifica que el `.env.local.example` tenga TODAS las variables que el código usa. Busca `process.env.` en el código y compara.

3. **Verificación de secretos en código**:
   ```bash
   grep -r "SUPABASE_SERVICE_ROLE_KEY" app/ components/ --include="*.tsx" --include="*.ts" \
     | grep -v "process.env" \
     | grep -v "// ok:"
   ```
   Si hay match, ALERTA ROJA. Service role no debe estar hardcodeada.

4. **Verificación de uso de service role en cliente**:
   ```bash
   grep -rn "from.*supabase/admin" app/ components/ --include="*.tsx"
   ```
   Los componentes con `'use client'` nunca deben importar `lib/supabase/admin.ts`.

5. **RLS check**: ejecuta `/revisar-rls` y reporta el resultado.

6. **Migraciones pendientes**: lista archivos en `supabase/migrations/` y compara con el estado registrado (si hay tracker local).

7. **`vercel.json` válido**: confirma que los crons están configurados:
   - `/api/cron/sync-matches` con schedule diario
   - `/api/cron/score-matches` con schedule cada 2 horas

8. **Verifica que el JSON de openfootball siga accesible**:
   ```bash
   curl -sI https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json | head -1
   ```
   Debe devolver `200 OK`.

9. **Tests de scoring**: confirma que `tests/scoring.test.ts` pasa con al menos estos casos:
   - 2-1 vs 2-1 → 3 puntos
   - 2-1 vs 3-2 → 1 punto (mismo ganador, marcador distinto)
   - 1-1 vs 2-2 → 1 punto (empate)
   - 2-1 vs 1-2 → 0 puntos (ganador opuesto)
   - 0-0 vs 1-1 → 1 punto (empate)

10. Imprime el resumen en formato:
    ```
    ✅ Listo para deploy
    ó
    ❌ Bloqueadores:
       - [bloqueador 1]
       - [bloqueador 2]
    ⚠️ Advertencias (no bloquean):
       - [advertencia 1]
    ```

**Reglas:**

- Si hay algún ❌, NO sugerir hacer deploy.
- Sugerir comandos exactos para arreglar cada bloqueador.
