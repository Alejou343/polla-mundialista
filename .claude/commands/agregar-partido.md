---
description: Inserta un partido nuevo o de prueba en la tabla matches
argument-hint: <home_team> <away_team> <kickoff_iso>
---

Inserta un partido en la tabla `matches` de Supabase con los siguientes datos: $ARGUMENTS.

**Pasos:**

1. Parsea los argumentos. Esperan tres valores separados por espacio:
   - `home_team`: nombre del equipo local
   - `away_team`: nombre del equipo visitante
   - `kickoff_iso`: fecha y hora del kickoff en formato ISO 8601 con timezone UTC (ej: `2026-06-15T18:00:00Z`)

2. Genera un `id` único en formato `WC2026-MTEST-<timestamp>` para que no colisione con partidos reales.

3. Usa el cliente de Supabase con `service role key` (importa desde `lib/supabase/admin.ts`).

4. Inserta con estos defaults:
   - `stage`: `'group'`
   - `match_number`: 999
   - `status`: `'scheduled'`
   - `home_score`: null
   - `away_score`: null

5. Muestra el SQL ejecutado y el resultado.

**Reglas:**

- Si falta algún argumento, explica el formato esperado y no ejecutes nada.
- Si el `kickoff_iso` es pasado, advierte al usuario que las apuestas estarán bloqueadas de inmediato.
- Nunca uses este comando para insertar partidos reales del Mundial — para eso usa `/seed-partidos`.
