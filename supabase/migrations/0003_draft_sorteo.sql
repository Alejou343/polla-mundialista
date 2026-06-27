-- =====================================================================
-- Polla Mundial 2026 — migración 0003
-- "Sorteo de campeón": juego paralelo a la polla de marcadores.
-- 16 participantes, 32 equipos del R32, 2 equipos por persona.
-- Restricción: nadie recibe ambos lados del mismo cruce de R32.
-- Gana quien tenga al campeón. Pozo: 800.000 COP.
--
-- Tablas nuevas: draft_config, draft_entries
-- Columna nueva en matches: winner_code
-- Vista nueva: draft_team_status
-- =====================================================================


-- ─── 1. winner_code en matches ────────────────────────────────────────────────
-- El campo home_score/away_score solo refleja el minuto 90 (regla de la polla).
-- Para el sorteo necesitamos el ganador REAL del cruce (incluye penales).
-- El admin o el cron lo rellena al finalizar cada partido de eliminatoria.
alter table public.matches
  add column if not exists winner_code text;

comment on column public.matches.winner_code is
  'Código del equipo ganador del cruce eliminatorio (incluye prórrogas/penales). '
  'NULL hasta que el partido termine. Solo aplica a stage != group.';


-- ─── 2. draft_config — singleton de control del sorteo ───────────────────────
-- Una sola fila (id=1). El constraint lo garantiza.
-- status:
--   pending → sorteo aún no corrido (default)
--   drawn   → sorteo corrido, parejas visibles para todos
--   closed  → juego terminado (hay campeón)
create table public.draft_config (
  id              int          primary key default 1,
  status          text         not null default 'pending'
                               check (status in ('pending', 'drawn', 'closed')),
  pot_amount      int          not null default 800000,  -- en COP
  draw_seed       text,        -- semilla usada; para auditoría y reproducibilidad
  drawn_at        timestamptz, -- cuándo se corrió el sorteo
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now(),
  -- Garantiza que solo exista una fila
  constraint draft_config_singleton check (id = 1)
);

-- Fila inicial (sin esto no hay nada que leer hasta que el admin inserte manualmente)
insert into public.draft_config (id, status, pot_amount)
  values (1, 'pending', 800000);

create trigger draft_config_updated_at
  before update on public.draft_config
  for each row execute function public.set_updated_at();


-- ─── 3. draft_entries — asignaciones resultado del sorteo ────────────────────
create table public.draft_entries (
  id              uuid         primary key default gen_random_uuid(),
  user_id         uuid         not null references public.profiles(id) on delete cascade,
  -- Código del equipo asignado (ej: 'BRA', 'ARG', 'USA', 'ESP')
  team_code       text         not null,
  -- Nombre legible del equipo (ej: 'Brazil', 'Argentina')
  team_name       text         not null,
  -- Cruce de R32 al que pertenece este equipo.
  -- FK a matches garantiza que el partido exista y sea válido.
  r32_match_id    text         not null references public.matches(id),
  assigned_at     timestamptz  not null default now(),

  -- Cada equipo solo puede aparecer una vez en el sorteo (32 equipos, 32 filas)
  unique (team_code),

  -- Nadie puede recibir ambos equipos del mismo cruce de R32.
  -- Con esta constraint, si user_id=X ya tiene el equipo local de r32_match_id=Y,
  -- intentar insertar el visitante de Y para X falla con violación de unique.
  unique (user_id, r32_match_id)
);

create index draft_entries_user_idx      on public.draft_entries(user_id);
create index draft_entries_r32_match_idx on public.draft_entries(r32_match_id);
create index draft_entries_team_code_idx on public.draft_entries(team_code);

-- Trigger: máximo 2 equipos por participante
-- El sorteo inserta en batch; el trigger evalúa BEFORE cada fila,
-- viendo el conteo de filas ya comprometidas, por lo que 1→2 pasa y 2→3 falla.
create or replace function public.check_draft_entries_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*)
    from public.draft_entries
    where user_id = new.user_id
  ) >= 2 then
    raise exception
      'Límite de equipos superado: el participante % ya tiene 2 equipos asignados.',
      new.user_id;
  end if;
  return new;
end;
$$;

create trigger draft_entries_max_per_user
  before insert on public.draft_entries
  for each row execute function public.check_draft_entries_limit();


-- ─── 4. Vista: estado de cada equipo en el sorteo ────────────────────────────
-- team_status: 'campeon' | 'eliminado' | 'vivo'
--
-- Lógica:
--  campeon   = ganó el partido stage='final' (winner_code = team_code)
--  eliminado = perdió cualquier partido de eliminatoria (winner_code != team_code)
--  vivo      = ninguno de los anteriores (aún compite)
--
-- Nota sobre tercer puesto: un equipo que pierde la SF queda 'eliminado'
-- aunque juegue y gane el partido por el 3er puesto. No es el campeón,
-- así que 'eliminado' es correcto para los fines de este juego.
--
-- La vista hereda RLS de draft_entries: solo es visible después del sorteo.
create view public.draft_team_status as
select
  de.id,
  de.user_id,
  p.display_name                          as participant_name,
  de.team_code,
  de.team_name,
  de.r32_match_id,
  de.assigned_at,
  case
    -- Campeon: ganó la final
    when exists (
      select 1
      from   public.matches m
      where  m.stage        = 'final'
        and  m.status       = 'finished'
        and  m.winner_code  = de.team_code
    ) then 'campeon'

    -- Eliminado: perdió algún partido de la fase eliminatoria
    when exists (
      select 1
      from   public.matches m
      where  m.status       = 'finished'
        and  m.stage        in ('r32', 'r16', 'qf', 'sf', 'final', 'third')
        and  (m.home_team_code = de.team_code or m.away_team_code = de.team_code)
        and  m.winner_code  is not null
        and  m.winner_code  <> de.team_code
    ) then 'eliminado'

    else 'vivo'
  end                                     as team_status
from  public.draft_entries de
join  public.profiles       p on p.id = de.user_id;


-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.draft_config  enable row level security;
alter table public.draft_entries enable row level security;

-- ─── draft_config ─────────────────────────────────────────────────────────────
-- SELECT: cualquier usuario autenticado puede leer el estado del sorteo.
-- INSERT/UPDATE/DELETE: sin policy → denegado para 'authenticated'.
--   El script del sorteo usa service role (bypassa RLS).
--   El admin ajusta con service role también.
create policy "draft_config_select_authenticated"
  on public.draft_config for select
  to authenticated
  using (true);

-- ─── draft_entries ────────────────────────────────────────────────────────────
-- SELECT: visible para todos los autenticados ÚNICAMENTE después del sorteo.
--   Antes de 'drawn' nadie (excepto service role) puede ver las asignaciones,
--   evitando que alguien vea el resultado antes de que sea público.
-- INSERT/UPDATE/DELETE: sin policy → denegado para 'authenticated'.
--   El script del sorteo (Server Action admin + service role) inserta todo.
create policy "draft_entries_select_after_draw"
  on public.draft_entries for select
  to authenticated
  using (
    exists (
      select 1
      from   public.draft_config dc
      where  dc.status in ('drawn', 'closed')
    )
  );


-- =====================================================================
-- Notas operativas
-- =====================================================================
-- 1. El script del sorteo (app/api/admin/draft/route.ts o Server Action):
--    a. Verifica que draft_config.status = 'pending'.
--    b. Limpia draft_entries por si hay una corrida previa fallida.
--    c. Lee los 16 partidos R32 (limpios, sin duplicados) con sus team codes.
--    d. Genera la asignación aleatoria respetando la restricción de no-cruce.
--    e. Inserta las 32 filas en draft_entries (service role).
--    f. Actualiza draft_config.status = 'drawn', draw_seed, drawn_at.
--    Usa SUPABASE_SERVICE_ROLE_KEY. Nunca exponer al cliente.
--
-- 2. Para derivar el ganador automáticamente:
--    SELECT team_code, participant_name
--    FROM public.draft_team_status
--    WHERE team_status = 'campeon';
--    → La vista lee matches.winner_code del partido stage='final'.
--
-- 3. Para determinar vivo/eliminado de cada equipo:
--    SELECT * FROM public.draft_team_status ORDER BY participant_name;
--    → No requiere cron; es una view normal que refleja el estado actual de matches.
--
-- 4. winner_code se actualiza con service role al mismo tiempo que home_score/away_score
--    en el cron de score-matches, o manualmente por el admin.
--    UPDATE public.matches SET winner_code = 'BRA' WHERE id = 'r32_73';
