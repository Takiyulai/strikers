-- ============================================================================
-- STRIKER FC — Patch 02 : Secrétaire + impacts hebdomadaires
--
-- 1. Nouveau rôle SECRETAIRE : lance, modifie et supprime les cotisations
--    exceptionnelles, enregistre leurs paiements, télécharge les récaps.
--    (Rappel : tout le monde paie la cotisation hebdomadaire, sauf le
--    Président d'honneur et le Coach — le Secrétaire paie donc aussi.)
-- 2. Table player_impacts : chaque semaine, le staff consigne les actions
--    décisives (but, passe décisive, clean sheet pour les gardiens).
--    Ces impacts alimentent le score « joueur du mois ».
--
-- Idempotent : peut être relancé sans risque. Aucune donnée n'est perdue.
-- À exécuter SEUL dans le SQL Editor, après patch-01.
-- ============================================================================

-- 1. Rôle Secrétaire ---------------------------------------------------------
alter type public.user_role add value if not exists 'SECRETAIRE' after 'VICE_PRESIDENT';

-- 2. Type d'impact -----------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'impact_type') then
    create type public.impact_type as enum ('BUT', 'PASSE_DECISIVE', 'CLEAN_SHEET');
  end if;
end$$;

-- 3. Table des impacts hebdomadaires ----------------------------------------
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

-- 4. Droits sur les cotisations exceptionnelles ------------------------------
--    PH, Président, Vice-président et Secrétaire gèrent tout le cycle.
create or replace function public.can_manage_contribution()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT', 'SECRETAIRE')
     from public.profiles where id = auth.uid()),
    false
  );
$$;

drop policy if exists sc_insert on public.special_contributions;
create policy sc_insert on public.special_contributions
  for insert to authenticated with check (public.can_manage_contribution());

drop policy if exists sc_update on public.special_contributions;
create policy sc_update on public.special_contributions
  for update to authenticated
  using (public.can_manage_contribution())
  with check (public.can_manage_contribution());

drop policy if exists sc_delete on public.special_contributions
;
create policy sc_delete on public.special_contributions
  for delete to authenticated using (public.can_manage_contribution());

-- Paiements des cotisations exceptionnelles : TG, Secrétaire et direction.
drop policy if exists scp_write on public.special_contribution_payments;
create policy scp_write on public.special_contribution_payments
  for all to authenticated
  using (public.can_manage_finance() or public.current_role() = 'SECRETAIRE')
  with check (public.can_manage_finance() or public.current_role() = 'SECRETAIRE');

-- 5. Droits ------------------------------------------------------------------
grant execute on function public.can_manage_contribution() to authenticated;

-- ---------------------------------------------------------------------------
-- VÉRIFICATIONS
-- ---------------------------------------------------------------------------
-- Le rôle Secrétaire doit apparaître dans la liste :
select unnest(enum_range(null::public.user_role)) as role;

-- La table des impacts doit exister :
select count(*) as impacts from public.player_impacts;