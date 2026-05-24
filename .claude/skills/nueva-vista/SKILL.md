---
name: nueva-vista
description: Use when the user asks to create a new page, route, or view in the Next.js App Router. Triggers on phrases like "crea la página", "nueva vista", "página de X", "ruta para X". Sets up the file structure with proper auth, layout, loading and error states following the project conventions.
---

# Crear una vista nueva en Polla Mundial 2026

Cuando el usuario pida crear una página nueva, sigue este patrón EXACTO.

## Decisión inicial

1. ¿La ruta requiere autenticación? Si sí, va dentro de `app/(app)/`. Si no, va en `app/(auth)/` o en la raíz.
2. ¿Es una página simple o tiene dynamic segment? Decide entre `page.tsx` o `[id]/page.tsx`.
3. ¿Necesita interactividad? Decide si será Server Component (default) o requiere componentes `'use client'` anidados.

## Archivos a crear (siempre)

Para una ruta `/x`:

```
app/(app)/x/
├── page.tsx              # Server Component (default)
├── loading.tsx           # Skeleton mientras carga datos
└── error.tsx             # Boundary de error (Client Component)
```

Si es dynamic:

```
app/(app)/x/[id]/
├── page.tsx
├── loading.tsx
└── error.tsx
```

## Plantilla de `page.tsx` (Server Component con auth)

```tsx
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch datos del dominio aquí (matches, bets, ranking…)
  // Usar el supabase cliente del server; RLS aplica automáticamente.

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="font-headline text-3xl text-carbon">Título</h1>
      {/* contenido */}
    </main>
  );
}
```

## Plantilla de `loading.tsx`

```tsx
export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-ivory/60" />
        ))}
      </div>
    </main>
  );
}
```

## Plantilla de `error.tsx`

```tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6 text-center">
      <p className="text-error">Algo salió mal: {error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
```

## Reglas

- **Container mobile-first**: `mx-auto max-w-screen-sm px-4 py-6`. En desktop sigue luciendo bien centrado y angosto.
- **Headings con `font-headline`** (Bebas Neue/Anton). Texto en `font-sans` (Inter).
- **Colores con clases custom de Tailwind**: `text-carbon`, `bg-primary`, `text-error`, `bg-ivory`. NO `text-gray-900`, NO `bg-emerald-700`.
- **Auth check siempre primero** en Server Components que requieren sesión.
- **Mensajes de UI en español**.

## Después de crear

1. Confirmar que `next dev` muestra la ruta sin errores.
2. Agregar link en el nav (si aplica) — habitualmente en `app/(app)/layout.tsx`.
3. Si la página consume datos nuevos, considera si necesita revalidation: `export const revalidate = 60` para refresh cada 60s.

## Cuándo NO usar esta skill

- Cuando se trata de modificar una página existente. Para eso, edita directamente.
- Cuando se pide un componente reutilizable. Esos van en `components/`, no en `app/`.
