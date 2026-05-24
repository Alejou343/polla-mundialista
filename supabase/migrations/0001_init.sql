-- =====================================================================
-- Polla Mundial 2026 — migración inicial
-- Crea schema, RLS y vista de ranking.
-- ESTE ARCHIVO ES INMUTABLE. Cualquier cambio futuro debe ser una migración nueva
-- con timestamp (ver skill `migracion-sql` o comando /crear-migracion).
-- =====================================================================

-- ---------- helper: trigger genérico para updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- matches ----------
create table public.matches (
  id text primary key,
  stage text not null check (stage in ('group','r32','r16','qf','sf','final','third')),
  group_name text,
  match_number int not null,
  home_team text not null,
  away_team text not null,
  home_team_code text,
  away_team_code text,
  venue text,
  kickoff_time timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','live','finished','postponed')),
  home_score int check (home_score is null or (home_score >= 0 and home_score <= 30)),
  away_score int check (away_score is null or (away_score >= 0 and away_score <= 30)),
  scored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index matches_kickoff_idx on public.matches(kickoff_time);
create index matches_status_idx on public.matches(status);
create index matches_stage_idx on public.matches(stage);

create trigger matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- ---------- bets ----------
create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  predicted_home_score int not null check (predicted_home_score >= 0 and predicted_home_score <= 20),
  predicted_away_score int not null check (predicted_away_score >= 0 and predicted_away_score <= 20),
  points_earned int check (points_earned is null or points_earned in (0, 1, 3)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index bets_user_idx on public.bets(user_id);
create index bets_match_idx on public.bets(match_id);

create trigger bets_updated_at
  before update on public.bets
  for each row execute function public.set_updated_at();

-- ---------- vista leaderboard ----------
-- Sin segundo criterio de orden: empates de puntos no requieren orden determinístico.
create view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(b.points_earned), 0)::int as total_points,
  count(b.id) filter (where b.points_earned = 3)::int as exact_scores,
  count(b.id) filter (where b.points_earned = 1)::int as correct_results,
  count(b.id)::int as total_bets
from public.profiles p
left join public.bets b on b.user_id = p.id
group by p.id, p.display_name
order by total_points desc;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.bets enable row level security;

-- ---------- profiles ----------
create policy "profiles_select_all"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------- matches ----------
create policy "matches_select_all"
  on public.matches for select
  using (auth.role() = 'authenticated');

create policy "matches_admin_write"
  on public.matches for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- ---------- bets ----------
-- El dueño SIEMPRE ve sus apuestas (las ajenas se filtran por la otra policy)
create policy "bets_select_own"
  on public.bets for select
  using (user_id = auth.uid());

-- Apuestas ajenas visibles solo después del kickoff de ese partido
create policy "bets_select_others_after_kickoff"
  on public.bets for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = bets.match_id
        and m.kickoff_time <= now()
    )
  );

create policy "bets_insert_own_before_kickoff"
  on public.bets for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.kickoff_time > now()
    )
  );

create policy "bets_update_own_before_kickoff"
  on public.bets for update
  using (
    user_id = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = bets.match_id
        and m.kickoff_time > now()
    )
  );

create policy "bets_delete_own_before_kickoff"
  on public.bets for delete
  using (
    user_id = auth.uid() and
    exists (
      select 1 from public.matches m
      where m.id = bets.match_id
        and m.kickoff_time > now()
    )
  );

-- =====================================================================
-- Notas operativas (no son ejecutables — solo documentación inline)
-- =====================================================================
-- 1. El cron `/api/cron/score-matches` corre con SUPABASE_SERVICE_ROLE_KEY
--    que bypassea RLS, por eso puede escribir `points_earned` libremente.
-- 2. Para marcar a un usuario como admin, ejecutar manualmente:
--      update public.profiles set is_admin = true where display_name = 'NombreAdmin';
-- 3. La vista `leaderboard` no requiere refresh manual: es una view normal, no materialized.
