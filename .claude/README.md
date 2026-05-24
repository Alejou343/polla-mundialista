# `.claude/` — Configuración para Claude Code

Esta carpeta contiene toda la configuración que personaliza Claude Code para el proyecto **Polla Mundial 2026**. Está pensada para ser commiteada al repo — todos los colaboradores se benefician de las mismas reglas.

## Estructura

```
.claude/
├── settings.json           # Hooks activos (eventos lifecycle)
├── commands/               # Slash commands manuales (/nombre)
├── agents/                 # Subagentes especializados
├── skills/                 # Skills auto-invocadas + /nombre
├── hooks/                  # Scripts bash que corren los hooks
└── README.md               # Este archivo
```

## Slash Commands disponibles

Escribe `/` en Claude Code para verlos. Los del proyecto:

| Comando | Qué hace |
|---|---|
| `/agregar-partido <home> <away> <kickoff>` | Inserta un partido de prueba |
| `/calcular-puntos <match_id>` | Recalcula puntos de un partido |
| `/revisar-rls` | Audita policies de RLS contra las reglas |
| `/crear-migracion <nombre>` | Crea archivo de migración con timestamp |
| `/seed-partidos` | Pobla `matches` desde openfootball |
| `/deploy-preview` | Checklist pre-deploy |

## Agentes especializados

Claude los invoca automáticamente cuando la descripción del agente coincide con la tarea. También puedes pedirle: "Usa el agente <nombre> para…".

| Agente | Cuándo se usa |
|---|---|
| **backend-supabase** | Schemas, queries, RLS, Server Actions |
| **frontend-mobile** | Componentes UI, Tailwind, responsive |
| **scoring-engineer** | Algoritmo de puntuación y sus tests |
| **data-sync** | Cron jobs, parser openfootball, fallback manual |
| **security-auditor** | Audita seguridad (solo lectura, no modifica) |

## Skills

Se auto-invocan según el contexto (descripción en el frontmatter) y también funcionan como comandos manuales (`/nombre-de-la-skill`).

| Skill | Trigger típico |
|---|---|
| **nueva-vista** | "Crea la página de…" |
| **nuevo-endpoint** | "Crea el endpoint…" / "Server Action para…" |
| **migracion-sql** | "Agregar columna…" / "Nueva tabla…" |
| **seed-partidos** | "Poblar partidos…" / "Cargar fixtures" |
| **debug-rls** | "No veo mis apuestas" / "Query no devuelve filas" |
| **prueba-puntuacion** | "Tests de scoring" / "Casos de prueba" |

## Hooks activos

Configurados en `settings.json`, ejecutan scripts de `hooks/`:

| Evento | Script | Comportamiento |
|---|---|---|
| `SessionStart` | `session-start.sh` | Imprime estado del proyecto (env, migrations, días al Mundial) |
| `PreToolUse Bash` | `pre-bash-guard.sh` | Bloquea `rm -rf`, `DROP TABLE`, `git push -f`, etc. |
| `PreToolUse Edit/Write` | `pre-edit-protect.sh` | Bloquea ediciones a `.env*` y `0001_init.sql` |
| `PostToolUse Edit/Write` | `post-edit-quality.sh` | Corre prettier + typecheck, detecta service role en cliente |
| `Stop` | `stop-summary.sh` | Resumen de cambios + advertencias contextuales |

Los hooks de `PreToolUse` pueden bloquear acciones (exit 2). Los demás son informativos (exit 0).

## Cómo modificar

- **Slash command nuevo**: crea `commands/<nombre>.md` con frontmatter (`description`, `argument-hint`). El cuerpo es el prompt.
- **Skill nueva**: crea `skills/<nombre>/SKILL.md` con frontmatter (`name`, `description`). En `description` indica claramente *cuándo* invocarse.
- **Agente nuevo**: crea `agents/<nombre>.md` con frontmatter (`name`, `description`, `tools`, `model`). El cuerpo es el system prompt.
- **Hook nuevo**: edita `settings.json` y crea el script en `hooks/`. Recuerda `chmod +x`.

## Privacidad

- **`settings.json` y este directorio se commitean al repo** — son políticas del proyecto.
- **`settings.local.json` (si existe) NO se commitea** — esa es para overrides personales (agrega `.claude/settings.local.json` al `.gitignore`).

## Recursos

- Documentación de Claude Code: https://docs.claude.com/en/docs/claude-code/overview
- Mapa de docs: https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md
