---
name: debug-rls
description: Use when a Supabase query returns zero rows unexpectedly, when the user reports "no veo mis apuestas" or "no aparecen los partidos", or when troubleshooting authorization issues. Triggers on "RLS", "no devuelve filas", "permission denied", "no aparece nada".
---

# Debug de Row Level Security

Cuando una query no devuelve los datos esperados, en 8 de cada 10 casos es RLS. Aplica este flujo de diagnóstico.

## Síntomas típicos

- "Mi apuesta no aparece después de guardarla."
- "El ranking sale vacío."
- "Los partidos no se cargan en /matches."
- "Inserto pero después no veo el registro."
- Error: `new row violates row-level security policy`.
- Query devuelve `data: []` sin error.

## Flujo de diagnóstico

### 1. Identificar qué client se está usando

```bash
grep -rn "createServerSupabaseClient\|createBrowserClient\|createAdminSupabaseClient" <archivo>
```

- **anon client** (browser): respeta RLS, sin sesión activa. Si no hay user, solo ve datos públicos.
- **server client con sesión**: respeta RLS, ve datos del user autenticado.
- **admin client (service role)**: bypassa RLS, ve todo. Si se usa por error donde no debe, es un bug de seguridad. Si se usa correctamente, no es el culpable.

### 2. Verificar que la sesión exista

En Server Component:
```typescript
const supabase = createServerSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuario:', user?.id ?? 'NO HAY SESIÓN');
```

Si `user` es null, el problema es de auth, no de RLS.

### 3. Probar el query como service role para confirmar que los datos existen

```typescript
const admin = createAdminSupabaseClient();
const { data } = await admin.from('bets').select('*').eq('match_id', 'WC2026-M001');
console.log('Como admin:', data?.length, 'filas');
```

Si admin ve filas pero el usuario no: **es RLS**. Si admin tampoco las ve: **el dato no existe** (problema de insert/sync).

### 4. Revisar las policies relevantes

Para `bets`, las policies clave son:

| Policy | Cuándo aplica |
|---|---|
| `bets_select_own` | El user siempre ve las suyas (`user_id = auth.uid()`) |
| `bets_select_others_after_kickoff` | Ve las ajenas solo si `kickoff_time <= now()` |
| `bets_insert_own_before_kickoff` | Inserta solo si es propia y kickoff futuro |
| `bets_update_own_before_kickoff` | Actualiza solo si es propia y kickoff futuro |
| `bets_delete_own_before_kickoff` | Borra solo si es propia y kickoff futuro |

### 5. Casos comunes y sus fixes

**Caso A**: Usuario insertó una apuesta, luego no la ve.
- Verifica: ¿el `user_id` que se insertó es el mismo que `auth.uid()`?
- Bug típico: hardcodear `user_id` o tomarlo del cliente. Debe ser siempre `auth.uid()` o `user.id` del server.

**Caso B**: Apuesta no se inserta, error "new row violates RLS".
- Casi siempre: `kickoff_time` del match ya pasó.
- O: el `user_id` no coincide con `auth.uid()`.

**Caso C**: Quiero ver apuestas de toda la familia pero solo veo las mías.
- Esperado si el partido no ha empezado. Solo después del kickoff las apuestas ajenas son visibles.
- Si el kickoff ya pasó y aún no las ves, verifica que `kickoff_time` está bien guardado (en UTC) y que el server está comparando con `now()` UTC.

**Caso D**: `/matches` está vacío.
- ¿La tabla `matches` tiene filas? Confirma con admin client.
- Si está vacía, ejecuta `/seed-partidos`.
- Si tiene filas pero la página no muestra nada, revisa la policy: debe haber `for select using (auth.role() = 'authenticated')`.

**Caso E**: Admin no puede editar un match.
- Verifica el profile: `select is_admin from profiles where id = auth.uid()`.
- Si `is_admin` es false, márcalo true desde Supabase Studio.
- Verifica la policy: `for all using (exists(select 1 from profiles where id = auth.uid() and is_admin = true))`.

### 6. Trace SQL en Supabase

En Supabase Studio → SQL Editor:

```sql
-- Ver todas las policies de bets
select policyname, cmd, qual, with_check
from pg_policies
where tablename = 'bets';
```

```sql
-- Probar qué ve un usuario específico (en una transacción)
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub": "<UUID-DEL-USER>"}';
select count(*) from bets;
rollback;
```

## Antipatrón a evitar

❌ "La query no devuelve nada, déjame usar service role."

Eso es escalar privilegios para tapar un bug. El fix correcto es:
1. Identificar qué policy está bloqueando.
2. Ajustar la policy o el query, no el client.
3. Service role solo se usa cuando legítimamente necesitas saltar RLS (crons, admin auditado).

## Output esperado

Cuando completes el debug, reporta:
1. **Síntoma observado**
2. **Causa raíz** (qué policy/condición bloqueaba)
3. **Fix aplicado** (o sugerido si no requirió cambio de código)
4. **Test de regresión** que confirma que el fix funciona
