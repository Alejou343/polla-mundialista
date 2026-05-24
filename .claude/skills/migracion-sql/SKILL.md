---
name: migracion-sql
description: Use when the user asks to modify the database schema, add a column, create a new table, add an index, change RLS policies, or any DDL change. Triggers on phrases like "agregar columna", "nueva tabla", "modificar el schema", "migration", "alter table".
---

# Crear una migración SQL en Polla Mundial 2026

Cuando el usuario pida un cambio en la DB, NUNCA modifiques `supabase/migrations/0001_init.sql`. Crea siempre un archivo nuevo.

## Pasos

1. **Genera timestamp UTC** con segundos: `YYYYMMDDHHMMSS`.
2. **Normaliza el nombre**: snake_case, solo `[a-z0-9_]`.
3. **Crea el archivo**: `supabase/migrations/<timestamp>_<nombre>.sql`

## Plantilla

```sql
-- Migración: <descripción corta y clara>
-- Fecha: <YYYY-MM-DD>
-- Razón: <por qué se necesita este cambio>
-- Downtime requerido: <sí/no>

begin;

-- ===== STATEMENTS =====

-- TODO: tus cambios aquí

-- ===== /STATEMENTS =====

commit;
```

## Patrones comunes

### Agregar una columna no-null con default

```sql
alter table matches
  add column tournament_name text not null default 'World Cup 2026';
```

### Agregar columna nullable

```sql
alter table bets
  add column note text;
```

### Crear índice

```sql
create index concurrently bets_match_user_idx on bets(match_id, user_id);
```

Nota: `concurrently` no se puede ejecutar dentro de transacción. Si lo usas, quita `begin`/`commit` o ponlo en un archivo aparte.

### Nueva tabla con RLS

```sql
create table comentarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id text not null references matches(id) on delete cascade,
  texto text not null check (length(texto) <= 280),
  created_at timestamptz default now() not null
);

alter table comentarios enable row level security;

create policy "comentarios_select_all" on comentarios
  for select using (auth.role() = 'authenticated');

create policy "comentarios_insert_own" on comentarios
  for insert with check (user_id = auth.uid());

create policy "comentarios_delete_own" on comentarios
  for delete using (user_id = auth.uid());
```

### Cambiar policy existente

Las policies se editan con `drop policy` + `create policy`:

```sql
drop policy if exists "bets_select_others_after_kickoff" on bets;

create policy "bets_select_others_after_kickoff" on bets for select using (
  exists(
    select 1 from matches m
    where m.id = bets.match_id and m.kickoff_time <= now()
  )
);
```

### Recalcular vista

Si modificas el schema y la vista `leaderboard` depende, redefínela:

```sql
drop view if exists leaderboard;

create view leaderboard as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(b.points_earned), 0) as total_points,
  count(b.id) filter (where b.points_earned = 3) as exact_scores,
  count(b.id) filter (where b.points_earned = 1) as correct_results,
  count(b.id) as total_bets
from profiles p
left join bets b on b.user_id = p.id
group by p.id, p.display_name
order by total_points desc, p.display_name asc;
```

## Reglas inviolables

1. **Toda migración va dentro de `begin; ... commit;`** (excepto índices concurrentes).
2. **Tabla nueva = RLS activada**. Sin excepciones.
3. **Migración inmutable una vez aplicada en producción**. Si necesitas revertir, escribe una migración nueva que deshaga.
4. **Documenta la razón** en el comentario superior.
5. **Si tocas policies de `bets`**, sugiere correr `/revisar-rls` después.
6. **Nombres en snake_case**, en español o inglés consistentes con la tabla.

## Cuándo NO usar esta skill

- Para insertar datos (eso es seed, no migración).
- Para cambios temporales de prueba en local (usa SQL directo en Supabase Studio).
