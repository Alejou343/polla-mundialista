# PRD — Polla Familiar Mundial 2026

## 1. Resumen ejecutivo

**Producto**: Aplicación web mobile-first para que una familia (~30 personas) prediga marcadores de los 104 partidos del Mundial 2026 y compita en un ranking de puntos.

**Stack**: Next.js 14 (App Router) en Vercel + Supabase (Postgres + Auth).

**Mundial 2026**: 11 junio – 19 julio 2026 · USA/México/Canadá · 48 equipos · 104 partidos · 12 grupos + Round of 32 + R16 + Cuartos + Semis + Final.

---

## 2. Objetivos

- Permitir a familiares predecir marcadores de cada partido antes del pitazo inicial.
- Calcular puntos automáticamente cuando termine cada partido.
- Mostrar ranking en tiempo casi-real.
- UX simple, sin fricción, optimizada para celular.
- Despliegue gratuito y mantenible por una sola persona.

## 3. No-objetivos (fuera de alcance)

- Apuestas de prórroga, penales, goleadores, campeón.
- Apps nativas iOS/Android.
- Notificaciones push o email.
- Recuperación de contraseña automática.
- Chat o comentarios entre familiares.
- Pagos o premios monetarios reales.
- Soporte multi-idioma (solo español).

---

## 4. Reglas de negocio

### 4.1 Reglas de puntuación
- **Marcador exacto** (predicción = resultado real): **3 puntos**
- **Resultado correcto** (predicción acierta ganador / empate / perdedor pero marcador distinto): **1 punto**
- **Resultado incorrecto**: **0 puntos**
- Los partidos se evalúan **al minuto 90** (tiempo regular). Prórroga y penales no afectan la puntuación.

### 4.2 Reglas de apuestas
- Cada usuario apuesta un marcador entero (`home_score`, `away_score`) para cada partido del Mundial.
- **Deadline**: el `kickoff_time` del partido. Después, la apuesta queda bloqueada permanentemente.
- Antes del kickoff, el usuario puede editar o eliminar su apuesta cuantas veces quiera.
- **Privacidad**: las apuestas de otros usuarios solo son visibles después del kickoff.

### 4.3 Reglas de registro
- Solo se puede registrar quien tenga el **código de invitación familiar** (env var, ej: `FAMILIA2026`).
- Registro pide: nombre para mostrar, contraseña, código de invitación.
- No se requiere email verificado (auth simple por nombre+password).
- No hay recuperación automática de contraseña. El admin la resetea manualmente desde Supabase.

### 4.4 Reglas de ranking
- Suma simple de puntos de todos los partidos ya jugados.
- En caso de empate de puntos, los usuarios se muestran **empatados sin orden definido** (misma posición visible).
- Se muestra: posición, nombre, puntos totales, # marcadores exactos, # aciertos de resultado, # apuestas hechas.

### 4.5 Roles
- **Familiar (default)**: apuesta, ve partidos, ve ranking.
- **Admin (único)**: todo lo del familiar + editar resultados manualmente + regenerar código de invitación + ver lista completa de usuarios + resetear contraseñas (via Supabase dashboard).

---

## 5. Arquitectura

### 5.1 Stack
| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Mobile-first, SSR para SEO innecesario pero rapidez, ecosistema |
| Auth | Supabase Auth (email+password, sin verificación) | Built-in, seguro, gratis |
| DB | Supabase Postgres | Gratis hasta 500 MB, sobra |
| Hosting | Vercel | Free tier, integración Next.js |
| Cron jobs | Vercel Cron (free tier: 2 jobs/día) o GitHub Actions | Sincronizar partidos y resultados |
| Fuente de datos | `openfootball/worldcup.json` (primario) + scraping FIFA como fallback opcional | Sin API key, open data |

### 5.2 Diagrama de alto nivel

```
[Cliente mobile/desktop]
        │
        ▼
[Next.js en Vercel] ──── Server Actions / API Routes ────► [Supabase Postgres]
        │                                                          ▲
        │                                                          │
        └──── /api/cron/sync-matches (1×/día) ──────► [openfootball JSON]
        │                                                          │
        └──── /api/cron/score-matches (cada 2h) ────► [Resultados desde fuente]
                                                                   │
                                                                   ▼
                                                          [Actualiza matches.score]
                                                          [Calcula bets.points_earned]
```

### 5.3 Esquema de base de datos

```sql
-- users (Supabase auth.users ya existe; extendemos con tabla profile)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null unique,
  is_admin boolean default false not null,
  created_at timestamptz default now() not null
);

-- partidos
create table matches (
  id text primary key,                  -- ej: "WC2026-M001"
  stage text not null,                  -- 'group', 'r32', 'r16', 'qf', 'sf', 'final', 'third'
  group_name text,                      -- 'A'..'L' o null en knockout
  match_number int not null,            -- 1..104
  home_team text not null,              -- nombre o placeholder ("W1A", "W2B" para knockout)
  away_team text not null,
  home_team_code text,                  -- 'MEX', 'USA', etc (ISO-ish)
  away_team_code text,
  venue text,
  kickoff_time timestamptz not null,    -- UTC
  status text default 'scheduled' not null, -- 'scheduled', 'live', 'finished', 'postponed'
  home_score int,                       -- null hasta que termine 90'
  away_score int,                       -- null hasta que termine 90'
  scored_at timestamptz,                -- cuándo se cerró el resultado en nuestra DB
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index matches_kickoff_idx on matches(kickoff_time);
create index matches_status_idx on matches(status);

-- apuestas
create table bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  match_id text not null references matches(id) on delete cascade,
  predicted_home_score int not null check (predicted_home_score >= 0 and predicted_home_score <= 20),
  predicted_away_score int not null check (predicted_away_score >= 0 and predicted_away_score <= 20),
  points_earned int,                    -- null hasta que se calcula
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, match_id)
);
create index bets_user_idx on bets(user_id);
create index bets_match_idx on bets(match_id);

-- vista materializada (o vista normal) para ranking
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
order by total_points desc;
```

### 5.4 Row Level Security (RLS) — crítico

```sql
alter table profiles enable row level security;
alter table matches enable row level security;
alter table bets enable row level security;

-- profiles: cualquiera autenticado ve todos los nombres, solo el dueño edita el suyo
create policy "profiles_select_all" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- matches: lectura pública (autenticada), escritura solo admin
create policy "matches_select_all" on matches for select using (auth.role() = 'authenticated');
create policy "matches_admin_write" on matches for all using (
  exists(select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- bets: el dueño SIEMPRE ve y edita las suyas; las ajenas solo después del kickoff
create policy "bets_select_own" on bets for select using (user_id = auth.uid());
create policy "bets_select_others_after_kickoff" on bets for select using (
  exists(select 1 from matches m where m.id = bets.match_id and m.kickoff_time <= now())
);
create policy "bets_insert_own_before_kickoff" on bets for insert with check (
  user_id = auth.uid() and
  exists(select 1 from matches m where m.id = match_id and m.kickoff_time > now())
);
create policy "bets_update_own_before_kickoff" on bets for update using (
  user_id = auth.uid() and
  exists(select 1 from matches m where m.id = bets.match_id and m.kickoff_time > now())
);
create policy "bets_delete_own_before_kickoff" on bets for delete using (
  user_id = auth.uid() and
  exists(select 1 from matches m where m.id = bets.match_id and m.kickoff_time > now())
);
```

> **Importante**: el cálculo de `points_earned` se hace con un **service-role key** desde el cron job, no desde el cliente. Por eso no se necesita una policy de UPDATE para bets sin restricción de kickoff.

---

## 6. Backend — Endpoints y lógica

### 6.1 Server Actions / API Routes (Next.js)

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/auth/signup` | POST | público | Valida código familiar, crea user en Supabase, crea profile |
| `/api/auth/login` | POST | público | Login via Supabase (manejado por SDK) |
| `/api/auth/logout` | POST | user | Logout |
| `/api/bets` | POST | user | Crea o actualiza una apuesta (upsert) — valida kickoff > now() |
| `/api/bets/[matchId]` | DELETE | user | Elimina apuesta — valida kickoff > now() |
| `/api/cron/sync-matches` | GET | cron secret | Sincroniza fixtures desde openfootball |
| `/api/cron/score-matches` | GET | cron secret | Cierra partidos terminados, calcula puntos |
| `/api/admin/match/[id]` | PATCH | admin | Edita resultado manualmente (fallback) |

### 6.2 Lógica de puntuación (algoritmo)

```typescript
function calculatePoints(
  predHome: number, predAway: number,
  realHome: number, realAway: number
): number {
  if (predHome === realHome && predAway === realAway) return 3;
  const predOutcome = Math.sign(predHome - predAway); // -1, 0, 1
  const realOutcome = Math.sign(realHome - realAway);
  if (predOutcome === realOutcome) return 1;
  return 0;
}
```

### 6.3 Cron job: sincronización de fixtures

- **Frecuencia**: 1 vez al día a las 06:00 UTC.
- **Acción**: descarga `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`, hace upsert por `id` en tabla `matches`. Si un partido cambió de fecha/hora, actualiza. No toca el score si ya tiene valor.

### 6.4 Cron job: scoring

- **Frecuencia**: cada 2 horas durante el torneo (o cada 1 hora si el plan free de Vercel lo permite).
- **Acción**:
  1. Busca matches con `status != 'finished'` y `kickoff_time < now() - 2h` (margen de seguridad post-90').
  2. Para cada uno, consulta la fuente de datos. Si tiene resultado final al minuto 90, escribe `home_score`, `away_score`, `status='finished'`, `scored_at=now()`.
  3. Para cada bet asociada, calcula `points_earned` con el algoritmo de 6.2.

### 6.5 Fuente de datos
- **Primaria**: `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json` (CDN GitHub raw, sin API key).
- **Fallback manual**: panel admin para editar `home_score` / `away_score` de cualquier match. Útil si la fuente está rota o atrasada.

---

## 7. Frontend — Vistas y componentes

### 7.1 Rutas (App Router)

```
/                       → redirect a /login o /matches según sesión
/login                  → form login (display_name + password)
/signup                 → form signup (display_name + password + código familiar)
/matches                → lista de partidos agrupados por fecha
/matches/[id]           → detalle del partido (apuesta + apuestas familiares si ya empezó)
/ranking                → tabla de ranking
/admin                  → solo admin: editar resultados, ver usuarios
/perfil                 → ver/editar nombre, cambiar contraseña
```

### 7.2 Componentes clave

- `<MatchCard>`: muestra equipos, banderas (emoji o SVG simple), fecha local, estado.
  - Si `kickoff > now()`: input de marcador editable (`home_score` / `away_score`).
  - Si `kickoff <= now()` y `status != finished`: muestra "🔒 Apuestas cerradas — En juego".
  - Si `status === finished`: muestra marcador real, tu apuesta, tus puntos.
- `<DateGroupHeader>`: separador por día, formato local del navegador (`Intl.DateTimeFormat`).
- `<StageFilter>`: tabs para filtrar por etapa (Grupos / R32 / R16 / Cuartos / Semis / Final).
- `<RankingTable>`: tabla con posición, nombre, puntos, exactos, aciertos.
- `<BetsList>`: solo visible post-kickoff, lista de apuestas de todos los familiares para un match.
- `<InviteBanner>`: solo admin, muestra el código de invitación copiable.

### 7.3 Estados UI importantes

- **Loading**: skeleton de cards.
- **Empty**: "Aún no hay partidos cargados" en mejor caso solo si la sync falla; el cron debería tener fixtures siempre.
- **Error de red**: toast + retry.
- **Conflict / kickoff pasado**: toast "Apuestas cerradas para este partido".

---

## 8. Branding — Mundial 2026 (inspirado, no oficial)

### 8.1 Paleta de colores
- **Verde césped**: `#0E7C3A` (primary)
- **Dorado trofeo**: `#F4C430` (accent, ganador)
- **Rojo cancha**: `#D32F2F` (perdedor / error)
- **Azul cielo**: `#1E88E5` (info)
- **Carbón**: `#1A1A1A` (texto)
- **Marfil**: `#FAF7F0` (background)

Inspiración: colores cancha + medalla + banderas de los 3 anfitriones (USA, México, Canadá → rojo/blanco/azul/verde dominante).

### 8.2 Tipografía
- Headlines: **Bebas Neue** o **Anton** (deportiva, condensada).
- Body: **Inter** o system-ui (legible mobile).

### 8.3 Elementos visuales
- Iconos de banderas con emoji 🇲🇽🇺🇸🇨🇦 etc. para evitar imágenes pesadas.
- Pelota de fútbol SVG simple como loading spinner.
- Gradientes suaves verde→dorado para headers de etapas knockout.
- **Evitar logos, mascotas, o assets oficiales de FIFA**.

---

## 9. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # solo server, para cron jobs
FAMILY_INVITE_CODE=FAMILIA2026    # cambiar a algo único
CRON_SECRET=                      # token para proteger /api/cron/*
```

---

## 10. Plan de despliegue

1. Crear proyecto en Supabase, correr el SQL de §5.3 y §5.4.
2. Crear usuario admin manualmente en Supabase Auth, marcar `is_admin = true` en su profile.
3. Crear proyecto Next.js, conectar repo a Vercel.
4. Configurar env vars en Vercel.
5. Configurar Vercel Cron en `vercel.json`:
   ```json
   {
     "crons": [
       { "path": "/api/cron/sync-matches", "schedule": "0 6 * * *" },
       { "path": "/api/cron/score-matches", "schedule": "0 */2 * * *" }
     ]
   }
   ```
6. Disparar `/api/cron/sync-matches` manualmente la primera vez para poblar partidos.
7. Compartir URL + código familiar por WhatsApp.

---

## 11. Métricas de éxito

- Todos los familiares (~30) registrados antes del 11 junio 2026.
- ≥80% de partidos con apuesta de ≥80% de familiares activos.
- Ranking visible y correcto en menos de 1h después del pitazo final de cada partido.
- Zero downtime durante kickoffs.

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Fuente de datos cae o se atrasa | Panel admin para editar marcadores a mano |
| Partido se aplaza (raro pero posible) | Cron sync detecta cambio de fecha; apuestas se reabren si kickoff es futuro |
| Familiar hace trampa cambiando hora del navegador | Toda validación de kickoff es server-side (RLS + Server Actions) |
| Contraseñas olvidadas | Admin resetea desde Supabase dashboard |
| Vercel Cron free tier limita a 2 jobs | Combinar ambos crons en uno solo que ejecute ambas funciones |

---

## 13. Roadmap post-lanzamiento (opcional, fuera de v1)

- v1.1: predicción de campeón al inicio del torneo (bonus 10 puntos).
- v1.2: badges (primer marcador exacto, racha de 5 partidos acertados, etc).
- v1.3: notificaciones email "te quedan 2h para apostar".
- v1.4: vista comparativa de "mi pronóstico vs el de mi sobrino".
