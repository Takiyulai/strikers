-- ============================================================================
-- STRIKER FC — Patch 02 : impacts hebdomadaires
--
-- 1. Table player_impacts : chaque semaine, le staff consigne les actions
--    décisives (but, passe décisive, clean sheet pour les gardiens).
--    Ces impacts alimentent le score « joueur du mois ».
-- 2. Les cotisations exceptionnelles sont gérées par le TRÉSORIER GÉNÉRAL
--    et la direction : aucun nouveau rôle n'est créé, aucune modification
--    d'enum — le script passe donc sans l'erreur 55P04.
--
-- Idempotent : peut être relancé sans risque. Aucune donnée n'est perdue.
-- À exécuter SEUL dans le SQL Editor (remplace la version précédente).
-- ============================================================================

-- 1. Type d'impact -----------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'impact_type') then
    create type public.impact_type as enum ('BUT', 'PASSE_DECISIVE', 'CLEAN_SHEET');
  end if;
end$$;

-- 2. Table des impacts hebdomadaires ----------------------------------------
create table if not exists public.player_impacts (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid not null references public.weekly_weeks (id) on delete cascade,
  player_id   uuid not null references public.players (id) on delete cascade,
  impact_type public.impact_type not null,
  quantity    integer not null default 1 check (quantity > 0),
  note        text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (week_id, player_id, impact_type)
);

create index if not exists idx_impacts_week   on public.player_impacts (week_id);
create index if not exists idx_impacts_player on public.player_impacts (player_id);

alter table public.player_impacts enable row level security;

drop policy if exists impacts_select on public.player_impacts;
create policy impacts_select on public.player_impacts
  for select to authenticated using (true);

drop policy if exists impacts_write on public.player_impacts;
create policy impacts_write on public.player_impacts
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

-- 3. Cotisations exceptionnelles : Trésorier Général + direction -------------
--    Les policies sc_* passent à can_manage_finance() (TG inclus).
drop policy if exists sc_insert on public.special_contributions;
create policy sc_insert on public.special_contributions
  for insert to authenticated with check (public.can_manage_finance());

drop policy if exists sc_update on public.special_contributions;
create policy sc_update on public.special_contributions
  for update to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

drop policy if exists sc_delete on public.special_contributions;
create policy sc_delete on public.special_contributions
  for delete to authenticated using (public.can_manage_finance());

-- ---------------------------------------------------------------------------
-- VÉRIFICATIONS
-- ---------------------------------------------------------------------------
-- La table des impacts doit exister :
select count(*) as impacts from public.player_impacts;

-- Le TG doit pouvoir gérer les cotisations exceptionnelles :
select
  case when exists (select 1 from pg_proc p
                    join pg_namespace n on n.oid = p.pronamespace
                    where n.nspname = 'public'
                      and p.proname = 'can_manage_finance')
    then 'Fonction can_manage_finance présente ✓'
    else 'ATTENTION : fonction absente'
  end as controle;