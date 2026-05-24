---
name: seed-partidos
description: Use when the user asks to populate the matches table, seed initial data, or sync fixtures from openfootball. Triggers on "seed", "poblar partidos", "cargar fixtures", "sincronizar partidos por primera vez".
---

# Seed de partidos desde openfootball

Cuando se necesite poblar `matches` con todos los partidos del Mundial 2026, usa este flujo.

## Fuente

`https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

## Mapeo del JSON al schema interno

| Campo en JSON | Campo en DB | Notas |
|---|---|---|
| `round` (texto) | `stage` (enum) | "Matchday N" → `'group'`; "Round of 32" → `'r32'`; "Round of 16" → `'r16'`; "Quarter-finals" → `'qf'`; "Semi-finals" → `'sf'`; "Third place" → `'third'`; "Final" → `'final'` |
| `group` (ej "Group A") | `group_name` (ej "A") | null en knockouts |
| `team1`, `team2` | `home_team`, `away_team` | Pueden venir como placeholder `"W1A"` antes del sorteo de knockouts |
| `date` + `time` | `kickoff_time` | Convertir a UTC estricto. Ej: `"2026-06-11"` + `"13:00 UTC-6"` → `"2026-06-11T19:00:00Z"` |
| `ground` | `venue` | |
| `score.ft` | `home_score`, `away_score` | Solo si terminó. En seed inicial es null. |

## Generación del `id`

Numeración secuencial estable: `WC2026-M001`, `WC2026-M002`, etc. Usa el orden de aparición en el JSON.

Pseudo-código:

```typescript
const matches = data.matches.map((m, idx) => ({
  id: `WC2026-M${String(idx + 1).padStart(3, '0')}`,
  stage: mapStage(m.round),
  group_name: extractGroupLetter(m.group),
  match_number: idx + 1,
  home_team: m.team1,
  away_team: m.team2,
  home_team_code: null,
  away_team_code: null,
  venue: m.ground,
  kickoff_time: parseKickoff(m.date, m.time),
  status: 'scheduled',
}));
```

## Función `parseKickoff`

```typescript
function parseKickoff(date: string, time: string): string {
  // time viene como "13:00 UTC-6" o "20:00 UTC-4"
  const match = time.match(/^(\d{2}):(\d{2})\s+UTC([+-]\d+)$/);
  if (!match) throw new Error(`Formato de hora inesperado: ${time}`);
  const [, hh, mm, offset] = match;
  const offsetHours = parseInt(offset, 10);
  // Calcular hora UTC
  const local = new Date(`${date}T${hh}:${mm}:00Z`);
  // Si el offset es UTC-6, la hora local es 6 horas menor que UTC.
  // Para obtener UTC desde la hora local, SUMAMOS el opposite del offset.
  // Ej: 13:00 UTC-6 → UTC es 13:00 - (-6) = 19:00 UTC.
  local.setUTCHours(local.getUTCHours() - offsetHours);
  return local.toISOString();
}
```

⚠️ **Verificar con un caso conocido**:
- "2026-06-11" + "13:00 UTC-6" debe resultar en `"2026-06-11T19:00:00.000Z"`.

## Upsert

```typescript
const { error } = await admin
  .from('matches')
  .upsert(matches, {
    onConflict: 'id',
    // OJO: en upsert, Supabase actualiza TODAS las columnas pasadas.
    // Para preservar scores, NO incluir home_score/away_score/status en el payload
    // si el partido ya existe con resultado. Usa un upsert manual:
  });
```

**Implementación correcta del upsert preservando resultados**:

```typescript
// 1. Lee existentes
const ids = matches.map(m => m.id);
const { data: existing } = await admin
  .from('matches')
  .select('id, home_score, status')
  .in('id', ids);
const existingMap = new Map(existing?.map(e => [e.id, e]) ?? []);

// 2. Para cada match, decide si insertar o actualizar parcialmente
for (const m of matches) {
  const prev = existingMap.get(m.id);
  if (prev?.home_score != null) {
    // Ya tiene resultado, solo actualizar metadata (kickoff, venue, teams)
    await admin.from('matches').update({
      home_team: m.home_team,
      away_team: m.away_team,
      kickoff_time: m.kickoff_time,
      venue: m.venue,
    }).eq('id', m.id);
  } else {
    // Insertar o reemplazar completo (sin tocar score que es null igual)
    await admin.from('matches').upsert(m, { onConflict: 'id' });
  }
}
```

## Validación con Zod

```typescript
const openFootballSchema = z.object({
  name: z.string(),
  matches: z.array(z.object({
    round: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string(),
    team1: z.string(),
    team2: z.string(),
    group: z.string().optional(),
    ground: z.string().optional(),
    score: z.object({
      ft: z.tuple([z.number(), z.number()]).optional(),
      ht: z.tuple([z.number(), z.number()]).optional(),
    }).optional(),
  })),
});
```

## Reglas

1. **Idempotente**. Si corres seed 2 veces, mismo estado.
2. **Nunca sobreescribir resultados ya cargados**.
3. **Mínimo 104 partidos esperados**. Si llegan menos, abortar con error claro.
4. **Validar Zod antes de tocar DB**. Si la estructura cambió, error sin escribir nada.
5. **Logs útiles**: cuántos inserts, cuántos updates, cuántos skipped.
