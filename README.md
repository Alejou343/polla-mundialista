# Polla Familiar Mundial 2026 ⚽🏆

Aplicación web mobile-first para que la familia (~30 personas) prediga los marcadores de los 104 partidos del Mundial 2026 (USA / México / Canadá, 11 jun – 19 jul 2026) y compita en un ranking.

Diseñada para ser **gratuita** de hostear y **simple** de mantener: Next.js 14 + Supabase + Vercel.

---

## Reglas de juego

- **Marcador exacto** → 3 puntos
- **Resultado correcto** (ganador / empate, marcador distinto) → 1 punto
- **Resultado incorrecto** → 0 puntos
- Solo cuenta el resultado **al minuto 90**. Prórroga y penales no afectan.
- Apuestas editables hasta el `kickoff_time`. Después se bloquean.
- Las apuestas ajenas solo se ven **después** del pitazo inicial.
- En empate de puntos, no hay orden definido — cualquiera puede aparecer primero.

---

## Stack

| Capa      | Tecnología                                                                  |
| --------- | --------------------------------------------------------------------------- |
| Frontend  | Next.js 14 (App Router) + TypeScript + Tailwind CSS                         |
| Auth + DB | Supabase (Postgres + Auth) con RLS estricto                                 |
| Hosting   | Vercel (free tier)                                                          |
| Cron      | Vercel Cron (2 jobs diarios)                                                |
| Datos     | [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) |
| Tests     | Vitest (scoring puro)                                                       |

---

## Setup local

### 1. Requisitos

- Node.js ≥ 20
- npm (no pnpm — ver `CLAUDE.md` §6)
- Una cuenta de Supabase (free tier alcanza)

### 2. Clonar e instalar

```bash
git clone <repo>
cd polla-mundialista
npm install
```

### 3. Crear proyecto en Supabase

1. Entra a https://supabase.com y crea un nuevo proyecto.
2. En **SQL editor**, pega y ejecuta el contenido de `supabase/migrations/0001_init.sql`. Crea tablas, índices, RLS y la vista `leaderboard`.
3. En **Project settings → API**, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` _(nunca exponer al cliente)_

### 4. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # solo server
FAMILY_INVITE_CODE=FAMILIA2026             # cambiar
CRON_SECRET=                               # token largo y aleatorio
```

Genera un `CRON_SECRET` con:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

### 5. Poblar los partidos

```bash
npm run seed
```

Descarga los 104 partidos desde openfootball y los inserta en tu DB.

### 6. Arrancar

```bash
npm run dev
```

Abre http://localhost:3000.

---

## Crear el usuario admin

1. Regístrate normalmente con el código familiar desde `/signup`.
2. En el **Supabase dashboard → Table editor → profiles**, busca tu fila y marca `is_admin = true`.
3. Cierra sesión y vuelve a entrar — aparecerá el badge **Admin** en el nav y podrás acceder a `/admin`.

Resetear contraseña de un familiar (no hay flujo automático):

1. Supabase dashboard → **Authentication → Users** → busca el email sintético `nombredelusuario@familiauribe.com` → **Send password recovery** _no funciona porque no hay email real_. En su lugar, usa **Reset password** desde el menú de tres puntos y comparte la nueva por WhatsApp.

---

## Deploy en Vercel

1. Push del repo a GitHub.
2. Importa el repo en https://vercel.com → New Project.
3. En **Environment Variables**, mete las 5 vars de `.env.local`.
4. Deploy.
5. Verifica que `vercel.json` registró los 2 crons en **Settings → Cron Jobs**.

### Disparar los crons manualmente

Útil tras el deploy inicial o si la sync falla. Reemplaza `<CRON_SECRET>`:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://tu-app.vercel.app/api/cron/sync-matches
curl -H "Authorization: Bearer <CRON_SECRET>" https://tu-app.vercel.app/api/cron/score-matches
```

---

## Comandos del proyecto

```bash
npm run dev          # Dev server
npm run build        # Build de producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # Vitest (corre tests del scoring)
npm run seed         # Pobla matches desde openfootball
npm run format       # Prettier sobre todos los archivos
```

---

## Operación durante el Mundial

### Cron diario de scoring (1×/día)

`vercel.json` ejecuta `/api/cron/score-matches` cada día a las 04:00 UTC. Para cada partido con `kickoff_time` ya pasado +2h:

1. Refetch del JSON de openfootball.
2. Si el match aparece como `finished` con score, escribe `home_score`, `away_score`, `status='finished'`, `scored_at=now()`.
3. Recalcula `points_earned` para todas las apuestas asociadas.

→ El ranking se actualiza con un **lag máximo de ~24h**. Aceptable para uso familiar.

### Cron diario de sync (1×/día)

`/api/cron/sync-matches` corre a las 06:00 UTC. Refetch del JSON y upsert. **Preserva** scores de partidos ya marcados como `finished` (no los pisa).

### Si una fuente falla o se atrasa

1. Ve a `/admin`.
2. Encuentra el partido en la lista.
3. Edita el marcador y guarda — recalcula los puntos automáticamente.

> ⚠️ No hay scraping de FIFA. El único fallback ante fallo de openfootball es el panel admin manual.

---

## Estructura del repo

```
app/
  (auth)/login,signup/        → Server Actions de auth
  (app)/matches/              → Lista + detalle de partidos
  (app)/ranking/              → Vista leaderboard
  (app)/admin/                → Editar resultados a mano
  (app)/perfil/               → Cambiar nombre/contraseña
  api/cron/sync-matches/      → Refresca fixtures
  api/cron/score-matches/     → Cierra resultados + recalcula puntos
  api/admin/match/[id]/       → PATCH manual (solo admin)
components/                   → MatchCard, RankingTable, BetsList, etc
lib/
  supabase/{client,server,admin}.ts
  scoring.ts                  → Algoritmo de puntos (CON TESTS)
  openfootball.ts             → Parser Zod del JSON externo
  auth.ts                     → emailFromDisplayName
  types.ts
supabase/migrations/0001_init.sql → schema + RLS + view (INMUTABLE)
tests/scoring.test.ts         → 22 casos del scorer
scripts/seed.ts               → Pobla matches en bulk
vercel.json                   → Configuración de los crons
.claude/                      → Configuración de Claude Code (commiteable)
```

---

## Troubleshooting

| Síntoma                                        | Probable causa                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| "No veo mis apuestas"                          | RLS — confirma que el usuario está autenticado y `user_id = auth.uid()`                      |
| "Otra persona ve mi apuesta antes del kickoff" | Bug grave: revisar policy `bets_select_others_after_kickoff`                                 |
| Cron devuelve 401                              | Falta header `Authorization: Bearer <CRON_SECRET>`                                           |
| Build falla con "service-role en cliente"      | Algún componente `'use client'` importa `lib/supabase/admin.ts` — quitar                     |
| Tiempos de partidos desfasados                 | openfootball no siempre incluye TZ. El parser asume UTC; edita el match a mano si es crítico |

---

## Decisiones de diseño documentadas

- **Email sintético** (`slug@familiauribe.com`): Supabase Auth requiere email pero queremos auth simple por nombre. Ver `lib/auth.ts`.
- **Crons una vez al día**: Vercel Hobby (free) limita la frecuencia. Pagar Pro o cambiar a GitHub Actions si necesitas más rápido.
- **No scraping de FIFA**: por riesgo legal. Único fallback = panel admin.
- **Migración inicial inmutable**: cualquier cambio futuro al schema = migración nueva con timestamp.
- **Empates de puntos sin orden**: no se aplica desempate, cualquiera puede aparecer primero entre los empatados.

---

## Licencia

Uso familiar privado. No incluye assets ni marcas de FIFA. No para uso comercial.
