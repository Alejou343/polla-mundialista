---
name: nuevo-endpoint
description: Use when the user asks to create a new API route, Server Action, or backend endpoint. Triggers on phrases like "crea el endpoint", "API route", "Server Action para X". Sets up Zod validation, auth check, and error handling following project conventions.
---

# Crear un endpoint en Polla Mundial 2026

Cuando el usuario pida crear un endpoint, primero decide entre **Server Action** o **API Route**:

| Caso | Usar |
|---|---|
| Mutación llamada desde un formulario o botón | **Server Action** |
| Endpoint llamado por un cron job | **API Route** (`/api/cron/*`) |
| Endpoint llamado externamente o por terceros | **API Route** |
| Operación admin con header de auth manual | **API Route** |
| Mutación con revalidación de path | **Server Action** |

## Plantilla: Server Action

Ubicación: `app/(app)/<feature>/actions.ts`

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const inputSchema = z.object({
  matchId: z.string().min(1),
  predictedHome: z.number().int().min(0).max(20),
  predictedAway: z.number().int().min(0).max(20),
});

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function placeBet(input: unknown): Promise<Result<{ betId: string }>> {
  // 1. Validación de input
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Datos inválidos' };
  }

  // 2. Auth
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'No autenticado' };

  // 3. Validación de negocio (defensa en profundidad — RLS también valida)
  const { data: match } = await supabase
    .from('matches')
    .select('kickoff_time')
    .eq('id', parsed.data.matchId)
    .single();
  if (!match) return { ok: false, error: 'Partido no encontrado' };
  if (new Date(match.kickoff_time) <= new Date()) {
    return { ok: false, error: 'Apuestas cerradas para este partido' };
  }

  // 4. Mutación (RLS valida automáticamente)
  const { data, error } = await supabase
    .from('bets')
    .upsert({
      user_id: user.id,
      match_id: parsed.data.matchId,
      predicted_home_score: parsed.data.predictedHome,
      predicted_away_score: parsed.data.predictedAway,
    }, { onConflict: 'user_id,match_id' })
    .select('id')
    .single();

  if (error) return { ok: false, error: error.message };

  // 5. Revalidate
  revalidatePath('/matches');
  revalidatePath(`/matches/${parsed.data.matchId}`);

  return { ok: true, data: { betId: data.id } };
}
```

## Plantilla: API Route (cron o admin)

Ubicación: `app/api/<path>/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// Para crons: validación de secret
function isAuthorizedCron(req: Request): boolean {
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  try {
    // Lógica del cron…
    return NextResponse.json({ ok: true, processed: 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
```

## Plantilla: API Route admin

```typescript
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  return profile?.is_admin ? user : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Solo aquí usamos el admin client (service role)
  const supabase = createAdminSupabaseClient();
  // …
}
```

## Reglas inviolables

1. **Toda entrada se valida con Zod**. Sin excepciones.
2. **Errores tipados, no throw**. Devuelve `{ ok: false, error: '...' }` o `NextResponse.json({...}, { status })`.
3. **Service role solo donde justificado**: crons y rutas admin verificadas.
4. **`revalidatePath`** después de mutaciones que cambian datos visibles.
5. **No log de objetos completos** que puedan contener tokens.
6. **Mensajes de error en español**, claros para el usuario familiar.

## Después de crear

- Si es Server Action, asegúrate de que el componente que la llama es Client Component (`'use client'`).
- Si es API Route de cron, añade el path al `vercel.json` con su schedule.
- Si es admin, verifica que el frontend exige `is_admin=true` también (defensa en profundidad).
