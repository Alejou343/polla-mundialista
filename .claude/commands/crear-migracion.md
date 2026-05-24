---
description: Crea un nuevo archivo de migración SQL con timestamp y convenciones del proyecto
argument-hint: <nombre_descriptivo>
---

Crea un nuevo archivo de migración SQL en `supabase/migrations/` con el nombre `$ARGUMENTS`.

**Pasos:**

1. Genera el nombre del archivo con timestamp UTC:
   `supabase/migrations/<YYYYMMDDHHMMSS>_<nombre_normalizado>.sql`
   - `nombre_normalizado` = $ARGUMENTS en snake_case, solo a-z 0-9 _
   - Ej: `agregar columna foo bar` → `20260524180000_agregar_columna_foo_bar.sql`

2. Crea el archivo con esta plantilla:

```sql
-- Migración: <nombre legible>
-- Fecha: <YYYY-MM-DD>
-- Razón: <pendiente — el usuario debe completar>

begin;

-- TODO: tus statements aquí
-- Ejemplos:
--   alter table matches add column foo text;
--   create index ... ;
--   create or replace function ...;

commit;
```

3. **Importante**: NUNCA modifiques `0001_init.sql`. Ese archivo es inmutable. Toda modificación va en una migración nueva.

4. **Convenciones de SQL del proyecto**:
   - Usa `lower_snake_case` para nombres de tablas y columnas.
   - Todo timestamp es `timestamptz` y se guarda en UTC.
   - Cada tabla nueva debe activar RLS: `alter table <name> enable row level security;`
   - Indica si la migración requiere downtime o no.
   - Si modificas RLS, sugiere correr `/revisar-rls` después.

5. Después de crear el archivo:
   - Abre el archivo en editor.
   - Recuerda al usuario completar el campo "Razón".
   - Recuerda correr `pnpm db:migrate` cuando esté listo.

**Reglas:**

- Si el nombre está vacío o solo tiene caracteres especiales, pide al usuario que dé un nombre válido.
- Si ya existe una migración con timestamp similar (mismo segundo), espera 1 segundo y reintenta.
