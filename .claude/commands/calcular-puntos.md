---
description: Recalcula los puntos de todas las apuestas de un partido específico
argument-hint: <match_id>
---

Recalcula `points_earned` para todas las apuestas asociadas al partido `$ARGUMENTS`.

**Pasos:**

1. Lee el partido desde Supabase. Si no existe, error.
2. Si `home_score` o `away_score` son null, error: el partido no tiene resultado cargado.
3. Lee todas las apuestas asociadas al `match_id`.
4. Para cada apuesta, llama `calculatePoints()` desde `lib/scoring.ts` con:
   - `predHome`, `predAway` (de la apuesta)
   - `realHome`, `realAway` (del partido)
5. Actualiza `points_earned` de cada apuesta usando el cliente con `service role` (bypassa RLS).
6. Imprime un resumen:
   - Total de apuestas procesadas
   - Cuántas con 3 puntos (exactos)
   - Cuántas con 1 punto (resultado correcto)
   - Cuántas con 0 puntos
   - Lista de display_name + apuesta + puntos

**Reglas:**

- Idempotente: si ejecutas dos veces, el resultado es idéntico.
- No tocar `scored_at` (eso lo gestiona el cron de scoring).
- Si el partido tenía status diferente a `'finished'`, advierte pero no cambies el status (eso es trabajo del cron).
- Usa transacción si Supabase lo soporta para batch update.
