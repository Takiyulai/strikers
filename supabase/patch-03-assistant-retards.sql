-- ============================================================================
-- STRIKER FC — Patch 03 : Assistant TG + retards
--
-- 1. Nouveau rôle ASSISTANT_TG : surveille les retardataires. N'apparaît
--    pas dans la liste du staff affichée publiquement.
-- 2. Table late_arrivals : un retard par semaine et par joueur, statut
--    « EN_RETARD » / « PAYE ». Le montant (300 FCFA) est calculé à la
--    volée pour rester facile à ajuster.
-- 3. Quand un retard est payé, l'argent entre dans le fonds de caisse
--    via la vue v_financial_ledger étendue.
-- 4. Vue v_weekly_debts : la dette hebdomadaire inclut les retards.
-- 5. Vue v_financial_ledger et v_balance : prennent en compte les amendes.
--
-- Idempotent : peut être relancé sans risque.
-- ============================================================================

-- 1. Rôle Assistant TG -------------------------------------------------------
--    alter type ne peut pas se combiner avec d'autres alter type dans la
--    même transaction : on l'isole dans un DO block silencieux.
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'user_role'
      and e.enumlabel = 'ASSISTANT_TG'
  ) then
    alter type public.user_role add value 'ASSISTANT_TG' after 'TG';
  end if;
end$$;

-- 2. Table des retards -------------------------------------------------------
create table if not exists public.late_arrivals (
  id           uuid primary key default gen_random_uuid(),
  week_id      uuid not null references public.weekly_weeks (id) on delete cascade,
  player_id    uuid not null references public.players (id) on delete cascade,
  amount       integer not null default 300 check (amount > 0),
  note         text,
  status       text not null default 'EN_RETARD' check (status in ('EN_RETARD', 'PAYE')),
  noted_by     uuid references public.profiles (id) on delete set null,
  noted_at     timestamptz not null default now(),
  cleared_by   uuid references public.profiles (id) on delete set null,
  cleared_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique (week_id, player_id)
);

-- Ajout de la colonne « note » si la table existait déjà sans elle.
alter table public.late_arrivals add column if not exists note text;

create index if not exists idx_late_arrivals_week   on public.late_arrivals (week_id);
create index if not exists idx_late_arrivals_player on public.late_arrivals (player_id);
create index if not exists idx_late_arrivals_status on public.late_arrivals (status);

alter table public.late_arrivals enable row level security;

-- Lecture pour tout membre connecté (utile aux dashboards et stats).
drop policy if exists late_select on public.late_arrivals;
create policy late_select on public.late_arrivals
  for select to authenticated using (true);

-- Marquage et levée : can_manage_finance() (TG, direction, PH).
drop policy if exists late_write on public.late_arrivals;
create policy late_write on public.late_arrivals
  for all to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

-- Insertion : ouvert aussi à l'Assistant TG (rôle dédié).
drop policy if exists late_insert_assistant on public.late_arrivals;
create policy late_insert_assistant on public.late_arrivals
  for insert to authenticated
  with check (
    public.can_manage_finance()
    or public.current_role() = 'ASSISTANT_TG'
  );

-- 3. Vue enrichie : la dette hebdomadaire inclut les retards non payés.
--    On tente une recréation (CREATE OR REPLACE VIEW) qui fonctionne
--    que la vue existe déjà ou pas.
create or replace view public.v_weekly_debts as
with all_weeks as (
  select id from public.weekly_weeks
),
base_players as (
  select p.id as player_id
  from public.players p
  where p.status = 'ACTIF'
),
week_due as (
  select bp.player_id, aw.id as week_id, 100 as due_fcfa
  from base_players bp cross join all_weeks aw
),
paid as (
  select player_id, week_id
  from public.weekly_payments
),
late as (
  select player_id, week_id, amount
  from public.late_arrivals
  where status = 'EN_RETARD'
)
select
  wd.player_id,
  sum(wd.due_fcfa + coalesce(l.amount, 0)) as debt_fcfa
from week_due wd
left join paid p
  on p.player_id = wd.player_id and p.week_id = wd.week_id
left join late l
  on l.player_id = wd.player_id and l.week_id = wd.week_id
where p.player_id is null
group by wd.player_id;

-- 4. Journal financier unifié (revenus + dépenses) ----------------------------
--    Reprend la vue créée dans le schéma principal et y ajoute les
--    règlements d'amendes (statut PAYE) comme source d'INCOME.
create or replace view public.v_financial_ledger as
with all_entries as (
  select
    wp.id                            as id,
    'INCOME'::text                   as entry_type,
    'COTISATION_HEBDO'::text         as source,
    wp.amount                        as amount,
    coalesce(pr.full_name, 'Joueur') as label,
    wp.paid_at                       as occurred_at,
    wp.recorded_by                   as recorded_by
  from public.weekly_payments wp
  join public.players p   on p.id = wp.player_id
  join public.profiles pr on pr.id = p.profile_id
  union all
  select
    scp.id,
    'INCOME',
    'COTISATION_EXCEPTIONNELLE',
    scp.amount,
    sc.title,
    scp.paid_at,
    scp.recorded_by
  from public.special_contribution_payments scp
  join public.special_contributions sc on sc.id = scp.contribution_id
  union all
  select
    la.id,
    'INCOME',
    'AMENDE_RETARD',
    la.amount,
    'Amende retard — ' || coalesce(pr.full_name, 'Joueur'),
    la.cleared_at,
    la.cleared_by
  from public.late_arrivals la
  join public.players p   on p.id = la.player_id
  join public.profiles pr on pr.id = p.profile_id
  where la.status = 'PAYE' and la.cleared_at is not null
  union all
  select
    e.id,
    'EXPENSE',
    e.category::text,
    e.amount,
    e.title,
    e.expense_date::timestamptz,
    e.recorded_by
  from public.expenses e
)
select * from all_entries;

-- 5. Solde global : recalculé pour intégrer les amendes payées.
create or replace view public.v_balance as
select
  coalesce((select sum(amount) from public.v_financial_ledger where entry_type = 'INCOME'), 0)::integer
    as total_income,
  coalesce((select sum(amount) from public.v_financial_ledger where entry_type = 'EXPENSE'), 0)::integer
    as total_expense,
  (
    coalesce((select sum(amount) from public.v_financial_ledger where entry_type = 'INCOME'), 0)
    - coalesce((select sum(amount) from public.v_financial_ledger where entry_type = 'EXPENSE'), 0)
  )::integer as balance;

-- 6. Vérifications ----------------------------------------------------------
select count(*) as retards from public.late_arrivals;
select unnest(enum_range(null::public.user_role)) as role;