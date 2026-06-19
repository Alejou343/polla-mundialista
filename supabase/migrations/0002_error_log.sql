-- =====================================================================
-- Polla Mundial 2026 — migración 0002
-- Tabla error_log para captura persistente de errores en Server Actions.
-- Service role escribe (vía lib/log-error.ts). Solo admins leen.
-- =====================================================================

create table public.error_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action text not null,
  code text,
  message text,
  user_id uuid references public.profiles(id) on delete set null,
  match_id text references public.matches(id) on delete set null,
  payload jsonb
);

create index error_log_created_at_idx on public.error_log(created_at desc);
create index error_log_action_idx on public.error_log(action);
create index error_log_user_id_idx on public.error_log(user_id);

alter table public.error_log enable row level security;

-- INSERT: nadie desde el cliente. Service role bypassa RLS (lo usamos en log-error.ts).
-- (No creamos policy de INSERT → queda denegado para anon y authenticated)

-- SELECT: solo admins
create policy error_log_select_admin on public.error_log
  for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- UPDATE/DELETE: nadie (los logs son inmutables; service role limpia con maintenance)
