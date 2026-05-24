# Polla Mundial 2026 — Guía para Claude

> Este archivo es la "constitución" del proyecto. Claude lo lee al inicio de cada sesión. Mantén las decisiones aquí, no las re-expliques en cada prompt.

## 0. Documentación del proyecto

Los documentos de referencia viven en `docs/`:

- `docs/INSTRUCCION_polla_mundial_2026_v2.md` — instrucción de construcción
- `docs/PRD_polla_mundial_2026.md` — PRD técnico con schema SQL y arquitectura
- `docs/PASO_A_PASO_setup.md` — guía de setup del entorno

Cuando este archivo o cualquier skill mencione "el PRD" o "la instrucción", la ruta correcta tiene el prefijo `docs/`.

## 1. Qué estamos construyendo

Aplicación web para que ~30 familiares predigan los marcadores de los 104 partidos del Mundial 2026 (11 jun – 19 jul 2026, USA/MX/CA, 48 equipos, 12 grupos + Round of 32 + R16 + Cuartos + Semis + Final). Compiten en un ranking por puntos.

**Reglas de puntuación (críticas, no inventes variantes):**
- Marcador exacto → **3 puntos**
- Resultado correcto (ganador/empate/perdedor) con marcador distinto → **1 punto**
- Resultado incorrecto → **0 puntos**
- Solo cuenta el resultado **al minuto 90**. Prórroga y penales no afectan.

**Reglas de apuestas:**
- Deadline absoluto: `kickoff_time` de cada partido.
- Edición y eliminación libre antes del kickoff.
- Validación de tiempo **siempre server-side** (Supabase RLS + Server Actions). Nunca confiar en el cliente.
- Apuestas ajenas solo visibles **después del kickoff** del partido.

**Ranking:**
- Suma simple de puntos.
- Empates **se muestran empatados sin desempate**. No hay orden definido entre usuarios con los mismos puntos; cualquiera puede aparecer primero.

## 2. Stack técnico (no proponer alternativas sin pedir)

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind CSS | Mobile-first siempre |
| Auth + DB | Supabase (Postgres + Auth) | RLS obligatorio |
| Hosting | Vercel | Free tier |
| Cron | Vercel Cron | 2 jobs máximo en free tier |
| Datos partidos | `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json` | Sin API key |
| Estilo | Tailwind + diseño mobile-first | Sin Material UI, sin shadcn/ui |
| Iconos | Emoji (banderas, balón) | Evitar imágenes pesadas |

## 3. Estructura del repo

```
/
├── app/                      # Next.js App Router
│   ├── (auth)/login/page.tsx
│   ├── (auth)/signup/page.tsx
│   ├── (app)/matches/page.tsx
│   ├── (app)/matches/[id]/page.tsx
│   ├── (app)/ranking/page.tsx
│   ├── (app)/admin/page.tsx
│   ├── (app)/perfil/page.tsx
│   ├── api/
│   │   ├── bets/route.ts
│   │   ├── bets/[matchId]/route.ts
│   │   ├── cron/sync-matches/route.ts
│   │   ├── cron/score-matches/route.ts
│   │   └── admin/match/[id]/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/               # Componentes UI reutilizables
├── lib/
│   ├── supabase/             # Clients (server, client, admin/service)
│   ├── scoring.ts            # Algoritmo de puntuación (CON TESTS)
│   ├── openfootball.ts       # Parser del JSON externo
│   └── types.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql     # Schema + RLS
├── tests/
│   └── scoring.test.ts
├── public/
├── .claude/                  # Config de Claude Code (este archivo)
├── vercel.json               # Crons config
├── .env.local.example
├── package.json
└── README.md
```

## 4. Convenciones de código

- **TypeScript estricto** (`"strict": true`).
- **Server Components por default**. Solo `'use client'` cuando se necesite estado/interactividad.
- **Server Actions** para mutaciones simples. **API routes** para crons y endpoints que necesitan auth manual.
- **Validación con Zod** en todo input de usuario y respuesta de API externa.
- **Nombres en español** para variables de dominio (`apuesta`, `partido`, `ranking`) y **en inglés** para conceptos técnicos (`fetch`, `client`, `route`).
- **UI 100% en español**. No mezclar idiomas en la interfaz.
- **Fechas siempre en UTC** en DB. Formatear en frontend con `Intl.DateTimeFormat` y timezone del navegador.
- **Errores con tipo discriminado**, no excepciones lanzadas: `{ ok: true, data } | { ok: false, error }`.
- **No instalar dependencias** sin confirmar primero. Preguntar antes de añadir un paquete.

## 5. Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # SOLO server-side, nunca exponer al cliente
FAMILY_INVITE_CODE=FAMILIA2026
CRON_SECRET=                    # Para proteger /api/cron/*
```

**Regla absoluta**: `SUPABASE_SERVICE_ROLE_KEY` nunca aparece en código del cliente. Si veo un `import` de service role desde un componente, es un bug grave.

## 6. Comandos del proyecto

> Gestor de paquetes: **npm** (no pnpm, aunque docs antiguos lo mencionen).

```bash
npm run dev         # Servidor de desarrollo
npm run build       # Build de producción
npm test            # Vitest para tests unitarios
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run seed        # Pobla matches inicialmente desde openfootball
```

## 7. Reglas de seguridad (no negociables)

1. **RLS activada** en todas las tablas (`profiles`, `matches`, `bets`).
2. **Service role** solo en cron jobs y rutas admin protegidas.
3. **Cron endpoints** protegidos con header `Authorization: Bearer ${CRON_SECRET}`.
4. **Validación de kickoff** en cada Server Action que toca `bets` (no solo confiar en RLS, doble check).
5. **Nunca mostrar apuestas ajenas antes del kickoff**. Si la query devuelve filas adicionales por bug, el RLS debe filtrarlas igual.
6. **No log de contraseñas, tokens, ni service role key** en consola.
7. **Inputs numéricos sanitizados**: `predicted_home_score` y `predicted_away_score` deben estar en `[0, 20]`.

## 8. Reglas de UX (Mundial 2026)

- **Mobile-first absoluto**. Si algo se ve bien en desktop pero mal en mobile, está mal.
- **Paleta**:
  - Verde césped `#0E7C3A` (primary)
  - Dorado trofeo `#F4C430` (accent / éxito)
  - Rojo `#D32F2F` (error / perdedor)
  - Azul cielo `#1E88E5` (info)
  - Carbón `#1A1A1A` (texto)
  - Marfil `#FAF7F0` (background)
- **Tipografía**: Bebas Neue o Anton para headlines, Inter para body.
- **No usar logos, mascotas o assets oficiales de FIFA**. Es uso familiar pero queremos cero riesgo legal.
- **Estados claros**:
  - 🟢 Programado (apuestas abiertas)
  - 🔒 En juego (apuestas cerradas)
  - ⚽ Terminado (con puntos calculados)
- **Mensajes en español natural**, no traducciones automáticas. Ej: "Apuestas cerradas" no "Cerrado para apostar".

## 9. Antipatrones (cosas que NO hacer)

- ❌ Validar el kickoff solo en el cliente con `new Date()`.
- ❌ Usar `localStorage` para guardar la apuesta antes de enviarla.
- ❌ Hacer fetch del JSON de openfootball desde el cliente. Solo server.
- ❌ Mostrar el ranking con un SELECT que cuente filas del cliente. Usar la vista `leaderboard`.
- ❌ Hacer scraping de FIFA.com.
- ❌ Crear una tabla `users` paralela a `auth.users`. La fuente de verdad es Supabase Auth; extender con `profiles`.
- ❌ Bloquear UI esperando el sync de partidos. Mostrar lo que haya en DB.
- ❌ Tests que dependan de la hora actual sin mock de `Date.now()`.
- ❌ Recalcular puntos restando — siempre recalcular desde cero por partido (idempotente).

## 10. Cómo trabajar con Claude en este proyecto

### Comandos disponibles (slash commands)

- `/agregar-partido` — Inserta un partido manualmente (útil para testing).
- `/calcular-puntos <match_id>` — Recalcula puntos de un partido específico.
- `/revisar-rls` — Audita las policies de RLS contra el README.
- `/crear-migracion <nombre>` — Crea archivo de migración SQL con timestamp.
- `/seed-partidos` — Pobla la DB con todos los partidos desde openfootball.
- `/deploy-preview` — Checklist pre-deploy.

### Agentes especializados

- **backend-supabase**: Diseña queries, RLS, migraciones, Server Actions.
- **frontend-mobile**: Componentes React, Tailwind, responsive mobile-first.
- **scoring-engineer**: Algoritmo de puntuación, edge cases, tests.
- **data-sync**: Cron jobs, parser de openfootball, manejo de cambios.
- **security-auditor**: Revisa RLS, service role usage, validaciones.

### Skills auto-invocadas

- **nueva-vista**: Patrón para crear una página nueva (auth, layout, loading, error).
- **nuevo-endpoint**: Patrón para crear API route con Zod + auth check.
- **migracion-sql**: Crear migración con convenciones del proyecto.
- **seed-partidos**: Script para poblar matches.
- **debug-rls**: Diagnosticar por qué una query no devuelve filas (probablemente RLS).
- **prueba-puntuacion**: Genera casos de test para el scorer.

### Hooks activos

- **PostToolUse Edit/Write**: corre `prettier` y `typecheck` automático.
- **PreToolUse Bash**: bloquea comandos peligrosos (`rm -rf`, `DROP TABLE`, `truncate`).
- **PreToolUse Edit**: bloquea ediciones a `.env*` files y `supabase/migrations/0001_init.sql` (la migración inicial es inmutable; crear una nueva).
- **SessionStart**: imprime el estado del proyecto (cuántos partidos, próximos kickoffs, env vars faltantes).

## 11. Glosario de dominio

- **Partido (match)**: uno de los 104 enfrentamientos del Mundial.
- **Apuesta (bet)**: predicción de marcador de un usuario para un partido.
- **Kickoff**: hora de inicio del partido. Es el deadline de apuestas.
- **Etapa (stage)**: `group` | `r32` | `r16` | `qf` | `sf` | `final` | `third`.
- **Polla**: nombre informal de la competencia familiar (Colombia/Venezuela).
- **Familiar**: usuario regular.
- **Admin**: yo, único usuario con `is_admin=true`.

## 12. Cuando dudes, pregunta

Si una decisión cambia el modelo de datos, las reglas de negocio, o agrega una dependencia, **pregunta primero**. No inventes features. Mejor un mensaje extra que un refactor.
