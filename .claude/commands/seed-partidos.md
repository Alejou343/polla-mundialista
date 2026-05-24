---
description: Pobla la tabla matches con todos los partidos del Mundial 2026 desde openfootball
---

Sincroniza todos los partidos del Mundial 2026 desde la fuente openfootball.

**Pasos:**

1. Descarga el JSON desde:
   `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

2. Valida la estructura con Zod (ver `lib/openfootball.ts`). Si la estructura cambió, error con detalles.

3. Normaliza cada match al schema interno:
   - `id`: genera como `WC2026-M<number_padded_3>` (ej: `WC2026-M001`).
   - `stage`: mapea desde `round`:
     - Si contiene "Matchday" → `'group'`
     - "Round of 32" → `'r32'`
     - "Round of 16" → `'r16'`
     - "Quarter" → `'qf'`
     - "Semi" → `'sf'`
     - "Third" → `'third'`
     - "Final" → `'final'`
   - `group_name`: extraer de `group` (ej: "Group A" → "A"); null en knockout.
   - `home_team`, `away_team`: desde `team1`, `team2`.
   - `kickoff_time`: combinar `date` + `time` en UTC. El JSON viene con timezone offset; convertir a UTC estricto.
   - `venue`: desde `ground`.

4. **Upsert por `id`** en la tabla `matches`:
   - Si no existe: insertar.
   - Si existe: actualizar SOLO `home_team`, `away_team`, `kickoff_time`, `venue`. **No tocar** `home_score`, `away_score`, `status`, `scored_at`.

5. Usa el cliente con `service role key`.

6. Imprime resumen:
   - Total de partidos descargados
   - Insertados nuevos
   - Actualizados (con campos que cambiaron)
   - Errores de mapeo (si los hay)

**Reglas:**

- Idempotente: correr 2 veces da el mismo estado final.
- No tocar resultados ya guardados.
- Si el JSON tiene placeholders tipo "W1A" (ganador grupo A aún por definir), guárdalos tal cual; el frontend los renderiza como "Por definir".
- Si menos de 100 partidos llegan, error: el Mundial 2026 tiene 104.
- Si más de 104 partidos llegan, advertir pero no fallar (puede haber datos extra).
