# Paso a paso para configurar el entorno

Esta guía te lleva desde "tengo una computadora con nada instalado" hasta "Claude Code está construyendo la app con todas las reglas, hooks, comandos y agentes funcionando".

**Tiempo estimado**: 30-45 minutos (la mayoría es esperar instalaciones).

---

## Parte 1 — Herramientas en tu máquina (una sola vez)

### 1.1 Instalar Node.js 18+

Verifica si ya lo tienes:

```bash
node --version
```

Si no, o si es menor a 18:

- **macOS** (con Homebrew): `brew install node`
- **Windows**: descarga desde https://nodejs.org/ (LTS)
- **Linux**: usa `nvm` (recomendado):
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  source ~/.bashrc
  nvm install --lts
  ```

Verifica:

```bash
node --version   # debe decir v20.x o v22.x
npm --version
```

### 1.2 Instalar pnpm (gestor de paquetes que usamos)

```bash
npm install -g pnpm
pnpm --version
```

### 1.3 Instalar Git

```bash
git --version
```

Si no está: https://git-scm.com/downloads

### 1.4 Instalar Claude Code

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

Si te pide autenticarte, ejecuta `claude` y sigue las instrucciones (te abrirá el navegador para conectar tu cuenta de Anthropic).

### 1.5 Instalar Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con scoop) — o descarga binario de https://github.com/supabase/cli/releases
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
curl -fsSL https://supabase.com/install.sh | sh
```

Verifica:

```bash
supabase --version
```

### 1.6 Instalar Vercel CLI

```bash
npm install -g vercel
vercel --version
```

### 1.7 (Opcional pero útil) Instalar `jq`

Los hooks del proyecto usan `jq` para parsear JSON. Funciona sin él, pero queda más limpio con:

```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq

# Windows (con scoop)
scoop install jq
```

---

## Parte 2 — Cuentas externas (una sola vez)

### 2.1 Crear cuenta de Supabase

1. Ve a https://supabase.com y regístrate (puedes usar GitHub).
2. **No crees el proyecto todavía**. Lo haremos en la Parte 4.

### 2.2 Crear cuenta de Vercel

1. Ve a https://vercel.com y regístrate con GitHub.
2. **No conectes el proyecto todavía**.

### 2.3 Crear cuenta de GitHub (si no la tienes)

Vas a necesitar un repo donde guardar el código. Crea una cuenta en https://github.com si aún no tienes.

---

## Parte 3 — Crear el proyecto local

### 3.1 Crear la carpeta del proyecto

```bash
mkdir polla-mundial-2026
cd polla-mundial-2026
git init
```

### 3.2 Descomprimir el `.claude/` y `CLAUDE.md`

Descarga el `polla-mundial-2026-claude-config.tar.gz` que te entregué antes y descomprímelo dentro de la carpeta del proyecto:

```bash
# Asumiendo que el tar.gz está en ~/Downloads
tar -xzf ~/Downloads/polla-mundial-2026-claude-config.tar.gz --strip-components=1
```

Verifica que quedó así:

```bash
ls -la
# Debe mostrar:
# .claude/
# CLAUDE.md
```

Y dentro de `.claude/`:

```bash
ls -la .claude/
# .claude/README.md
# .claude/settings.json
# .claude/agents/
# .claude/commands/
# .claude/skills/
# .claude/hooks/
```

### 3.3 Asegurar que los hooks son ejecutables

```bash
chmod +x .claude/hooks/*.sh
```

### 3.4 Copiar la INSTRUCCIÓN y el PRD al proyecto

Pon `INSTRUCCION_polla_mundial_2026_v2.md` y `PRD_polla_mundial_2026.md` también en la raíz del proyecto. Son referencia para ti y para Claude.

### 3.5 Crear `.gitignore` inicial

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem
.vscode/
.idea/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env*.local

# Vercel
.vercel

# Claude Code — settings personales (no compartir)
.claude/settings.local.json

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Supabase local
supabase/.branches/
supabase/.temp/
EOF
```

### 3.6 Primer commit

```bash
git add .
git commit -m "chore: inicialización con .claude/ y CLAUDE.md"
```

### 3.7 Subir a GitHub

1. En github.com → New Repository → nombre `polla-mundial-2026` → **privado** (recomendado, son datos familiares).
2. NO inicialices con README, .gitignore ni license (ya los tenemos).
3. Sigue las instrucciones que GitHub te muestra:

```bash
git remote add origin git@github.com:TU_USUARIO/polla-mundial-2026.git
git branch -M main
git push -u origin main
```

---

## Parte 4 — Configurar Supabase

### 4.1 Crear proyecto Supabase

1. En https://supabase.com/dashboard → New Project.
2. Nombre: `polla-mundial-2026`.
3. Database password: **genera una fuerte y guárdala en tu password manager**.
4. Región: la más cercana a tu familia (`South America (São Paulo)` si están en LATAM).
5. Plan: Free.
6. Espera 1-2 minutos a que termine de provisionar.

### 4.2 Guardar las llaves

Una vez creado, ve a **Settings → API** y copia estos valores:

- `Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` (clic en "Reveal") → será tu `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA la commitees**

### 4.3 Crear `.env.local`

En la raíz del proyecto:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://TUPROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...tu_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu_service_role...
FAMILY_INVITE_CODE=PONLE_UN_CODIGO_FAMILIAR_DIFICIL_DE_ADIVINAR
CRON_SECRET=genera_un_string_aleatorio_largo_aqui
EOF
```

Para generar un `CRON_SECRET` decente:

```bash
# macOS / Linux
openssl rand -hex 32

# o en cualquier sistema con node:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Sugerencia para `FAMILY_INVITE_CODE`: algo memorable pero único, ej: `LOSPEREZ2026MUNDIAL` o `PRIMOS-WC26-XYZ`.

### 4.4 Crear `.env.local.example`

Versión sin secretos, esta sí va al repo:

```bash
cat > .env.local.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FAMILY_INVITE_CODE=FAMILIA2026
CRON_SECRET=
EOF
```

---

## Parte 5 — Lanzar Claude Code y construir la app

### 5.1 Abrir Claude Code en el proyecto

```bash
cd polla-mundial-2026
claude
```

Si todo está bien, al iniciar verás el output del **hook `session-start.sh`** mostrando:

```
🏆 Polla Mundial 2026 — Estado del proyecto
📋 Archivos clave:
  ✓ CLAUDE.md
  ✗ package.json (FALTA)
  ...
⏳ Faltan X días para el partido inaugural (11 jun 2026)
```

Si no ves esto, los hooks no están funcionando — revisa que `chmod +x .claude/hooks/*.sh` se ejecutó.

### 5.2 Verificar que los comandos estén disponibles

En Claude Code, escribe `/` y verás la lista. Deberías ver:

- `/agregar-partido`
- `/calcular-puntos`
- `/crear-migracion`
- `/deploy-preview`
- `/revisar-rls`
- `/seed-partidos`
- (y los built-in como `/clear`, `/help`, `/agents`)

### 5.3 Verificar agentes

Escribe `/agents` para ver la lista de subagentes disponibles:

- `backend-supabase`
- `data-sync`
- `frontend-mobile`
- `scoring-engineer`
- `security-auditor`

### 5.4 Pegar la instrucción de construcción

Copia el contenido completo de `INSTRUCCION_polla_mundial_2026_v2.md` y pégalo en Claude Code.

Claude debería responder confirmando que leyó `CLAUDE.md` y listar los primeros 3 archivos que va a crear. Si no lo hace, dile: "Lee primero CLAUDE.md y .claude/README.md, luego confírmame que entiendes el proyecto antes de generar código."

### 5.5 Acompañar la construcción

Mientras Claude va construyendo, te recomiendo:

- **Revisar cada bloque grande** antes de aceptar (especialmente la migración SQL inicial — es inmutable).
- Cuando termine el algoritmo de scoring, **pide explícitamente** "corre `pnpm test` y muéstrame los resultados".
- Cuando termine el schema, dile "corre `/revisar-rls`".
- Antes de hacer push a producción, dile "corre `/deploy-preview`".

---

## Parte 6 — Aplicar la migración SQL a Supabase

Una vez Claude haya generado `supabase/migrations/0001_init.sql`:

### 6.1 Opción A — Vía Supabase Studio (más fácil)

1. Ve a https://supabase.com/dashboard → tu proyecto → SQL Editor.
2. New query → pega el contenido completo de `0001_init.sql`.
3. Run. Verifica que no haya errores.

### 6.2 Opción B — Vía Supabase CLI (más robusto)

```bash
# Link al proyecto remoto (una sola vez)
supabase link --project-ref TU_PROJECT_REF
# (el project-ref está en la URL del dashboard: dashboard.supabase.com/project/XXXXX)

# Aplicar migraciones
supabase db push
```

### 6.3 Verificar que las tablas existan

En Supabase Studio → Table Editor, deberías ver:

- `profiles`
- `matches`
- `bets`

Y en SQL Editor, prueba:

```sql
select * from pg_policies where tablename in ('profiles', 'matches', 'bets');
```

Deberías ver ~10 policies (las que definiste en el PRD).

---

## Parte 7 — Crear tu usuario admin

### 7.1 Levantar la app local

```bash
pnpm install
pnpm dev
```

Abre http://localhost:3000.

### 7.2 Registrarte como primer usuario

1. Ve a `/signup`.
2. Usa el `FAMILY_INVITE_CODE` que pusiste en `.env.local`.
3. Crea tu cuenta con tu nombre.

### 7.3 Marcarte como admin

En Supabase Studio → SQL Editor:

```sql
update profiles
set is_admin = true
where display_name = 'TuNombre';
```

Verifica:

```sql
select id, display_name, is_admin from profiles;
```

Cierra sesión y vuelve a entrar — ahora deberías ver `/admin` en tu nav.

---

## Parte 8 — Cargar los partidos del Mundial

### 8.1 Disparar el seed

Con la app corriendo en local, en otra terminal:

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" http://localhost:3000/api/cron/sync-matches
```

Deberías ver una respuesta JSON con el conteo de partidos insertados. Esperado: ~104.

### 8.2 Verificar en Supabase

```sql
select count(*) from matches;        -- ~104
select stage, count(*) from matches group by stage;
-- group: 72, r32: 16, r16: 8, qf: 4, sf: 2, third: 1, final: 1
```

### 8.3 Verificar en la app

Refresca `/matches` — deberías ver el listado completo agrupado por fecha.

---

## Parte 9 — Deploy a Vercel

### 9.1 Conectar el repo

```bash
vercel link
```

Sigue las instrucciones (selecciona tu cuenta, dale un nombre al proyecto).

### 9.2 Subir las variables de entorno

**No subas el `.env.local` directamente** — cada variable se configura en Vercel:

```bash
# Una por una (te pedirá el valor)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add FAMILY_INVITE_CODE production
vercel env add CRON_SECRET production
```

Repite para `preview` y `development` si quieres.

O hazlo en el dashboard de Vercel → tu proyecto → Settings → Environment Variables.

### 9.3 Primer deploy

```bash
vercel --prod
```

Vercel te dará la URL (algo como `polla-mundial-2026.vercel.app`).

### 9.4 Verificar crons

En Vercel → tu proyecto → Settings → Cron Jobs, deberías ver los dos crons definidos en `vercel.json`:

- `/api/cron/sync-matches` — diario
- `/api/cron/score-matches` — cada 2 horas

### 9.5 Disparar el primer sync en producción

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://TU_APP.vercel.app/api/cron/sync-matches
```

---

## Parte 10 — Compartir con la familia

### 10.1 Mensaje sugerido para WhatsApp

```
🏆 ¡La Polla Familiar del Mundial 2026 está lista!

Link: https://TU_APP.vercel.app

Código de invitación: PONLE_EL_CODIGO_DE_TU_ENV

Reglas:
⚽ Predice el marcador exacto de los 104 partidos
🎯 3 puntos por marcador exacto
✅ 1 punto por acertar resultado (ganador/empate/perdedor)
⏰ Las apuestas se cierran al pitazo inicial de cada partido

¡A jugar! 🇲🇽🇺🇸🇨🇦
```

### 10.2 Recordatorio mental

- Si alguien olvida la contraseña, ve a Supabase Studio → Authentication → Users → busca su email → "Send password recovery" o resetea manualmente.
- Si el cron falla, usa `/admin` para ingresar resultados manualmente.
- Revisa el ranking de vez en cuando para confirmar que los puntos se calcularon.

---

## Troubleshooting común

### "Los hooks no se ejecutan"

```bash
ls -la .claude/hooks/
# Cada .sh debe tener "-rwxr-xr-x"
```

Si no, corre `chmod +x .claude/hooks/*.sh`.

### "El sync de partidos devuelve 401"

El header `Authorization: Bearer <secret>` debe coincidir exactamente con `CRON_SECRET` en tu env. Verifica con `echo $CRON_SECRET` (después de hacer `source .env.local`).

### "Inserté una apuesta pero no la veo"

Probablemente RLS. En Claude Code, escribe: `usa la skill debug-rls para diagnosticar`.

### "Quiero resetear todo y empezar de nuevo"

```sql
-- En Supabase SQL Editor (CUIDADO, destructivo)
truncate table bets, matches cascade;
delete from auth.users;  -- borra todos los usuarios
```

Luego vuelve a la Parte 7.

### "Claude propone instalar una librería distinta a las del stack"

Dile: "El stack está definido en CLAUDE.md sección 2. Usa solo lo que está ahí. Si crees que necesitas algo más, pregunta antes."

---

## Checklist final antes de invitar a la familia

- [ ] `pnpm build` sin errores
- [ ] `pnpm test` pasa
- [ ] `/deploy-preview` sin bloqueadores
- [ ] Login/signup funciona en producción
- [ ] Aparecen los 104 partidos
- [ ] Puedes apostar un marcador y aparece
- [ ] El admin (tú) puede editar un resultado manualmente
- [ ] El ranking se ve bien con al menos 2 usuarios y 1 partido jugado
- [ ] Probado en mobile (abre la URL desde el celular)

¡Listo! Ya tienes una polla mundialista profesional para tu familia. 🏆⚽
