# Instrucción para construir la Polla Familiar Mundial 2026 (v2)

> Pega este texto al asistente (Claude Code recomendado) **después** de haber descomprimido `.claude/` y `CLAUDE.md` en la raíz del proyecto vacío. Acompáñalo con `PRD_polla_mundial_2026.md` como contexto adicional.

---

Construye una aplicación web llamada **"Polla Mundial 2026"** para que mi familia (~30 personas) prediga los marcadores de los 104 partidos del Mundial de Fútbol 2026 (Canadá, México y USA, del 11 de junio al 19 de julio de 2026). Quiero algo simple, mobile-first, gratuito de hostear y fácil de mantener.

## Contexto del proyecto

**Antes de empezar**, lee estos archivos que ya están en el repo:
1. `CLAUDE.md` — la "constitución" del proyecto con todas las convenciones, reglas de negocio, paleta, antipatrones, glosario.
2. `.claude/README.md` — la guía de los slash commands, agentes y skills disponibles.
3. `PRD_polla_mundial_2026.md` (si está disponible) — el PRD técnico con schema SQL completo.

**Todas las reglas de negocio, paleta de colores, convenciones de código, y reglas de seguridad están en `CLAUDE.md`. No las reinventes. Si algo se contradice entre estos archivos y este prompt, gana `CLAUDE.md`.**

## Stack obligatorio (resumido — ver CLAUDE.md para el detalle)

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth)
- Vercel (hosting + Cron)
- Datos: `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`

## Estructura de archivos esperada

Sigue exactamente esta estructura (también descrita en `CLAUDE.md`, sección 3):

```
app/
  (auth)/login/page.tsx
  (auth)/signup/page.tsx
  (app)/matches/page.tsx
  (app)/matches/[id]/page.tsx
  (app)/ranking/page.tsx
  (app)/admin/page.tsx
  (app)/perfil/page.tsx
  api/bets/route.ts
  api/bets/[matchId]/route.ts
  api/cron/sync-matches/route.ts
  api/cron/score-matches/route.ts
  api/admin/match/[id]/route.ts
  layout.tsx
  globals.css
components/
lib/
  supabase/client.ts        # Cliente para 'use client'
  supabase/server.ts        # Cliente para Server Components
  supabase/admin.ts         # Cliente service role — SOLO server
  scoring.ts                # Algoritmo de puntos (puro, con tests)
  openfootball.ts           # Parser del JSON externo (con Zod)
  types.ts
supabase/
  migrations/0001_init.sql  # Migración inicial — INMUTABLE
tests/
  scoring.test.ts
public/
vercel.json
.env.local.example
package.json
README.md
tsconfig.json
tailwind.config.ts
postcss.config.js
vitest.config.ts
```

Los archivos `lib/supabase/{client,server,admin}.ts` y `lib/scoring.ts` son referenciados por las skills y agentes del `.claude/`, así que esos nombres son obligatorios.

## Dependencias requeridas

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "zod": "^3"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10",
    "prettier": "^3",
    "vitest": "^1",
    "@vitejs/plugin-react": "^4",
    "eslint": "^8",
    "eslint-config-next": "^14"
  }
}
```

`prettier` y `vitest` son requeridos por los hooks de `.claude/hooks/`. No los omitas.

## Scripts de package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write .",
    "seed": "tsx scripts/seed.ts"
  }
}
```

## Cómo trabajar — aprovecha el `.claude/`

Este proyecto tiene slash commands y agentes preconfigurados. Úsalos en tu flujo:

- Cuando construyas el **schema de la DB**, invoca implícitamente al agente `backend-supabase` siguiendo el patrón del PRD.
- Cuando construyas **vistas**, sigue la skill `nueva-vista`.
- Cuando construyas **endpoints**, sigue la skill `nuevo-endpoint`.
- Cuando escribas el **scoring**, sigue la skill `prueba-puntuacion` para tests.
- Cuando termines de implementar el scoring, **corre `pnpm test`** y asegúrate de que pasa.
- Cuando termines de implementar el schema, **revisa contra el comando `/revisar-rls`** (puedes leer `.claude/commands/revisar-rls.md` para saber qué chequear).
- Cuando estés listo para deploy, usa la checklist de `/deploy-preview` (lee `.claude/commands/deploy-preview.md`).

## Orden de implementación recomendado

Construye en este orden para que cada paso valide el anterior:

1. **Setup inicial**: `package.json`, `tsconfig.json`, `tailwind.config.ts` (con la paleta de `CLAUDE.md`), `postcss.config.js`, `vitest.config.ts`, `.env.local.example`, `.gitignore`.
2. **Tipos y schema**: `lib/types.ts` con las interfaces de `Match`, `Bet`, `Profile`, `LeaderboardEntry`.
3. **Migración SQL**: `supabase/migrations/0001_init.sql` con TODO el schema, RLS, vista — copiar literalmente del PRD.
4. **Algoritmo de scoring**: `lib/scoring.ts` + `tests/scoring.test.ts`. Corre `pnpm test`; debe pasar antes de seguir.
5. **Parser openfootball**: `lib/openfootball.ts` con Zod schema y función `parseFixtures()`.
6. **Clientes de Supabase**: `lib/supabase/client.ts`, `server.ts`, `admin.ts`.
7. **Layout y globales**: `app/layout.tsx`, `app/globals.css`, fuentes de Google (Bebas Neue + Inter via `next/font`).
8. **Auth**: `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx` con Server Actions.
9. **Matches**: lista en `/matches`, detalle en `/matches/[id]` con form de apuesta.
10. **Ranking**: `/ranking`.
11. **Admin**: `/admin` (solo accesible si `is_admin=true`).
12. **Perfil**: `/perfil` (cambiar nombre, cambiar contraseña).
13. **API routes**: `/api/bets/*`, `/api/cron/*`, `/api/admin/*`.
14. **vercel.json** con los crons.
15. **README.md** con setup, deploy y troubleshooting.

## Reglas críticas (también en CLAUDE.md, pero las repito por importancia)

- **Service role key SOLO en server**. Si algún componente con `'use client'` importa `lib/supabase/admin.ts`, es un bug grave. El hook `post-edit-quality.sh` te alertará si lo haces, pero no esperes al hook — evítalo desde el diseño.
- **Validación de kickoff en DOS lugares**: RLS (en `0001_init.sql`) y Server Action (en `app/(app)/matches/[id]/actions.ts`). Defensa en profundidad.
- **Fechas en UTC** en DB, formateadas con `Intl.DateTimeFormat` en el cliente.
- **Migración inicial inmutable**: una vez creada, todo cambio es una migración nueva con timestamp.
- **UI 100% en español**, sin mezclar idiomas.

## Entregables esperados

Al final del trabajo, debes tener:

1. Repositorio completo con la estructura de arriba.
2. `pnpm dev` corre sin errores.
3. `pnpm test` pasa al menos los 10 casos del algoritmo de scoring.
4. `pnpm typecheck` y `pnpm lint` pasan sin errores.
5. `pnpm build` genera un build de producción válido.
6. `README.md` con: setup local, deploy en Vercel, cómo crear el admin, cómo generar el código familiar.
7. Si descubres una decisión de producto no cubierta, **pregunta antes de inventar**.

Empieza confirmándome que leíste `CLAUDE.md` y `.claude/README.md`, y dame una breve lista de los primeros 3 archivos que vas a crear.
