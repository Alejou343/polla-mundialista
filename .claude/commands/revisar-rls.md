---
description: Audita las políticas de Row Level Security contra las reglas definidas en CLAUDE.md
---

Audita las políticas de RLS de Supabase contra las reglas del proyecto.

**Pasos:**

1. Lee `supabase/migrations/0001_init.sql` y extrae todas las policies (busca `create policy`).
2. Lee la sección "Reglas de seguridad" y "Reglas de apuestas" de `CLAUDE.md`.
3. Para cada tabla (`profiles`, `matches`, `bets`), verifica:

   **profiles:**
   - [ ] RLS activado (`alter table ... enable row level security`)
   - [ ] SELECT permitido a cualquier autenticado
   - [ ] UPDATE solo del propio profile (`auth.uid() = id`)
   - [ ] No hay policy de INSERT pública (la creación va por signup server-side)
   - [ ] No hay policy de DELETE pública

   **matches:**
   - [ ] RLS activado
   - [ ] SELECT permitido a cualquier autenticado
   - [ ] INSERT/UPDATE/DELETE solo si `is_admin = true`

   **bets:**
   - [ ] RLS activado
   - [ ] SELECT propio siempre permitido
   - [ ] SELECT ajenas SOLO cuando `kickoff_time <= now()`
   - [ ] INSERT solo del propio user Y solo si `kickoff_time > now()`
   - [ ] UPDATE solo del propio user Y solo si `kickoff_time > now()`
   - [ ] DELETE solo del propio user Y solo si `kickoff_time > now()`

4. Para cada item, indica ✅ o ❌ y cita el SQL relevante.

5. **Pruebas activas con SQL**: si hay un cliente Supabase disponible, ejecuta queries de prueba simulando un usuario normal:
   ```sql
   -- Como usuario A, intentar leer apuestas de usuario B antes de kickoff
   set local role authenticated;
   set local "request.jwt.claims" = '{"sub": "<uuid-A>"}';
   select * from bets where user_id = '<uuid-B>';
   -- Esperado: 0 filas si el partido no ha empezado
   ```

6. Reporta hallazgos en formato:
   - ✅ N reglas verificadas
   - ❌ X discrepancias (con archivo, línea, y fix sugerido)

**Reglas:**

- No modificar SQL automáticamente, solo reportar.
- Si hay discrepancia, mostrar el `diff` esperado vs actual.
