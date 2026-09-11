-- ============================================================================
-- STRIKER FC — Schéma PostgreSQL (Supabase)
--
-- ⚠️  SCRIPT DE RÉINITIALISATION COMPLÈTE
-- Ce script commence par supprimer TOUS les objets du schéma `public`
-- (tables, vues, fonctions, types), y compris ceux laissés par une version
-- précédente du projet. Il recrée ensuite l'ensemble du schéma.
--
-- Il est idempotent : vous pouvez le relancer autant de fois que nécessaire.
-- ⚠️  Toutes les données des tables de l'application seront effacées.
--
-- Exécution : SQL Editor du tableau de bord Supabase → coller → Run.
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- 0. TABLE RASE
--    On supprime dynamiquement tout ce qui existe dans `public`, sans avoir
--    à connaître les noms : cela élimine les tables de l'ancienne version
--    (players, weekly_contributions, payments, financial_ledger…).
-- ---------------------------------------------------------------------------

-- 0.1 Vues
--     On collecte les noms AVANT de supprimer : itérer sur un curseur tout en
--     modifiant le catalogue peut sauter des objets.
do $$
declare
  vues text[];
  v text;
begin
  select array_agg(viewname) into vues
  from pg_views where schemaname = 'public';

  if vues is not null then
    foreach v in array vues loop
      execute format('drop view if exists public.%I cascade', v);
    end loop;
  end if;
end$$;

-- 0.2 Tables (hormis les tables système éventuelles)
do $$
declare
  tables text[];
  t text;
begin
  select array_agg(tablename) into tables
  from pg_tables
  where schemaname = 'public'
    and tablename not in ('spatial_ref_sys', 'geography_columns', 'geometry_columns');

  if tables is not null then
    foreach t in array tables loop
      execute format('drop table if exists public.%I cascade', t);
    end loop;
  end if;
end$$;

-- 0.3 Fonctions définies par l'application uniquement.
--     On exclut les fonctions appartenant à une extension (pgcrypto, PostGIS…)
--     pour ne pas casser gen_random_uuid() ou d'autres helpers.
do $$
declare
  signatures text[];
  s text;
begin
  select array_agg(format('%I(%s)', p.proname,
                          pg_get_function_identity_arguments(p.oid)))
  into signatures
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and not exists (
      select 1 from pg_depend d
      where d.objid = p.oid and d.deptype = 'e'
    );

  if signatures is not null then
    foreach s in array signatures loop
      execute format('drop function if exists public.%s cascade', s);
    end loop;
  end if;
end$$;

-- 0.4 Types énumérés
do $$
declare
  types text[];
  ty text;
begin
  select array_agg(t.typname) into types
  from pg_type t
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public' and t.typtype = 'e'
    and not exists (
      select 1 from pg_depend d
      where d.objid = t.oid and d.deptype = 'e'
    );

  if types is not null then
    foreach ty in array types loop
      execute format('drop type if exists public.%I cascade', ty);
    end loop;
  end if;
end$$;

-- 0.5 Trigger d'inscription sur auth.users
do $$
begin
  drop trigger if exists on_auth_user_created on auth.users;
exception when others then
  raise notice 'Trigger auth.users non supprimé (droits) : %', sqlerrm;
end$$;

-- ---------------------------------------------------------------------------
-- 1. TYPES ÉNUMÉRÉS
-- ---------------------------------------------------------------------------
create type public.user_role as enum (
  'PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT',
  'COACH', 'ARBITRE', 'TG', 'JOUEUR'
);

create type public.player_status as enum ('EN_ATTENTE', 'ACTIF', 'INACTIF');

create type public.player_position as enum (
  'GARDIEN', 'DEFENSEUR', 'MILIEU', 'ATTAQUANT', 'POLYVALENT'
);

create type public.expense_category as enum (
  'TRANSPORT', 'EQUIPEMENT', 'ACTIVITES', 'TERRAIN',
  'ARBITRAGE', 'COTISATION', 'AUTRE'
);

create type public.equipment_status as enum (
  'BON', 'MOYEN', 'MAUVAIS', 'HORS_SERVICE'
);

create type public.equipment_category as enum (
  'BALLONS', 'MAILLOTS', 'CHASUBLES', 'CONES', 'FILETS', 'AUTRE'
);

create type public.match_type as enum ('AMICAL', 'CHAMPIONNAT', 'COUPE', 'TOURNOI');

create type public.match_status as enum ('A_VENIR', 'JOUE', 'ANNULE');

create type public.convocation_role as enum (
  'TITULAIRE', 'REMPLACANT', 'ABSENT', 'NON_CONVOQUE'
);

create type public.special_contribution_status as enum (
  'ACTIVE', 'CLOTUREE', 'EXPIREE'
);

-- ---------------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------------

-- 2.1 Profils (étend auth.users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null default '',
  full_name   text not null default '',
  phone       text,
  role        public.user_role not null default 'JOUEUR',
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2.2 Joueurs (informations sportives, liées au profil)
create table public.players (
  id                 uuid primary key default gen_random_uuid(),
  profile_id         uuid not null unique references public.profiles (id) on delete cascade,
  position           public.player_position,
  jersey_number      integer,
  registration_date  date not null default current_date,
  status             public.player_status not null default 'ACTIF',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 2.3 Semaines de cotisation (historique préservé même sans paiement)
create table public.weekly_weeks (
  id           uuid primary key default gen_random_uuid(),
  year         integer not null,
  week_number  integer not null check (week_number between 1 and 53),
  week_start   date not null,
  week_end     date not null,
  label        text,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (year, week_number)
);

-- 2.4 Paiements hebdomadaires : SEULS les payeurs sont enregistrés.
--     Un joueur actif sans ligne pour une semaine est automatiquement en dette.
create table public.weekly_payments (
  id           uuid primary key default gen_random_uuid(),
  week_id      uuid not null references public.weekly_weeks (id) on delete cascade,
  player_id    uuid not null references public.players (id) on delete cascade,
  amount       integer not null default 100 check (amount >= 0),
  paid_at      timestamptz not null default now(),
  recorded_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (week_id, player_id)
);

-- 2.5 Cotisations exceptionnelles
create table public.special_contributions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  motif       text,
  amount      integer not null check (amount >= 0),
  due_date    date,
  status      public.special_contribution_status not null default 'ACTIVE',
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.special_contribution_payments (
  id               uuid primary key default gen_random_uuid(),
  contribution_id  uuid not null references public.special_contributions (id) on delete cascade,
  player_id        uuid not null references public.players (id) on delete cascade,
  amount           integer not null check (amount >= 0),
  paid_at          timestamptz not null default now(),
  recorded_by      uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  unique (contribution_id, player_id)
);

-- 2.6 Dépenses
create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  motif         text,
  amount        integer not null check (amount >= 0),
  category      public.expense_category not null default 'AUTRE',
  expense_date  date not null default current_date,
  recorded_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 2.7 Entraînements et présences
create table public.training_sessions (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  session_date  date not null,
  start_time    time,
  location      text,
  notes         text,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.attendances (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.training_sessions (id) on delete cascade,
  player_id   uuid not null references public.players (id) on delete cascade,
  present     boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (session_id, player_id)
);

-- 2.8 Matchs et convocations
create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  opponent        text not null,
  is_home         boolean not null default true,
  match_date      date not null,
  match_time      time,
  location        text,
  match_type      public.match_type not null default 'AMICAL',
  status          public.match_status not null default 'A_VENIR',
  our_score       integer,
  opponent_score  integer,
  notes           text,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.match_convocations (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches (id) on delete cascade,
  player_id   uuid not null references public.players (id) on delete cascade,
  role        public.convocation_role not null default 'TITULAIRE',
  position    text,
  created_at  timestamptz not null default now(),
  unique (match_id, player_id)
);

-- 2.9 Matériel
create table public.equipment (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    public.equipment_category not null default 'AUTRE',
  quantity    integer not null default 1 check (quantity >= 0),
  status      public.equipment_status not null default 'BON',
  added_date  date not null default current_date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. INDEX
-- ---------------------------------------------------------------------------
create index idx_players_profile        on public.players (profile_id);
create index idx_players_status         on public.players (status);
create index idx_weekly_payments_week   on public.weekly_payments (week_id);
create index idx_weekly_payments_player on public.weekly_payments (player_id);
create index idx_scp_contribution       on public.special_contribution_payments (contribution_id);
create index idx_scp_player             on public.special_contribution_payments (player_id);
create index idx_expenses_date          on public.expenses (expense_date);
create index idx_attendances_session    on public.attendances (session_id);
create index idx_convocations_match     on public.match_convocations (match_id);
create index idx_trainings_date         on public.training_sessions (session_date);
create index idx_matches_date           on public.matches (match_date);

-- ---------------------------------------------------------------------------
-- 4. FONCTIONS UTILITAIRES
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Création automatique du profil + fiche joueur à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    'JOUEUR'
  )
  on conflict (id) do nothing;

  insert into public.players (profile_id, status)
  values (new.id, 'ACTIF')
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Rôle de l'utilisateur connecté
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Raccourcis de permissions
create or replace function public.can_manage_team()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT')
     from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.can_manage_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT', 'TG')
     from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.can_create_contribution()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT')
     from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.can_manage_sport()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT', 'COACH', 'ARBITRE')
     from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- 5. TRIGGERS updated_at
-- ---------------------------------------------------------------------------
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.players
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.special_contributions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.training_sessions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.matches
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.equipment
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. VUES
-- ---------------------------------------------------------------------------

-- Joueurs + profil (source unique pour le frontend)
create or replace view public.v_players as
select
  p.id                as id,
  p.profile_id        as profile_id,
  pr.full_name        as full_name,
  pr.email            as email,
  pr.phone            as phone,
  pr.is_active        as profile_active,
  p.position          as position,
  p.jersey_number     as jersey_number,
  p.registration_date as registration_date,
  p.status            as status,
  p.created_at        as created_at,
  pr.role             as role
from public.players p
join public.profiles pr on pr.id = p.profile_id;

-- Dette hebdomadaire par membre : chaque semaine enregistrée après
-- l'inscription et sans paiement ajoute 100 FCFA. Règle du club : tout le
-- monde paie, sauf le Président d'honneur et le Coach.
create or replace view public.v_weekly_debts as
select
  p.id                          as player_id,
  count(w.id)::integer          as unpaid_weeks,
  (count(w.id) * 100)::integer  as debt_fcfa
from public.players p
join public.profiles pr on pr.id = p.profile_id
left join public.weekly_weeks w
  on w.week_end >= p.registration_date
 and not exists (
   select 1 from public.weekly_payments wp
   where wp.week_id = w.id and wp.player_id = p.id
 )
where pr.role not in ('PRESIDENT_HONNEUR', 'COACH')
group by p.id;

-- Total payé (hebdomadaire) par joueur
create or replace view public.v_weekly_paid as
select
  player_id,
  coalesce(sum(amount), 0)::integer as total_paid,
  count(*)::integer                as weeks_paid
from public.weekly_payments
group by player_id;

-- Journal financier unifié (revenus + dépenses)
create or replace view public.v_financial_ledger as
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
  e.id,
  'EXPENSE',
  e.category::text,
  e.amount,
  e.title,
  e.expense_date::timestamptz,
  e.recorded_by
from public.expenses e;

-- Solde global
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

-- Assiduité par membre (hors Président d'honneur et Coach)
create or replace view public.v_attendance_stats as
select
  p.id                                        as player_id,
  count(a.id)::integer                        as sessions_recorded,
  coalesce(sum(case when a.present then 1 else 0 end), 0)::integer as sessions_attended
from public.players p
join public.profiles pr on pr.id = p.profile_id
left join public.attendances a on a.player_id = p.id
where pr.role not in ('PRESIDENT_HONNEUR', 'COACH')
group by p.id;

-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.profiles                      enable row level security;
alter table public.players                       enable row level security;
alter table public.weekly_weeks                  enable row level security;
alter table public.weekly_payments               enable row level security;
alter table public.special_contributions         enable row level security;
alter table public.special_contribution_payments enable row level security;
alter table public.expenses                      enable row level security;
alter table public.training_sessions             enable row level security;
alter table public.attendances                   enable row level security;
alter table public.matches                       enable row level security;
alter table public.match_convocations            enable row level security;
alter table public.equipment                     enable row level security;

-- PROFILES ------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated using (true);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.can_manage_team())
  with check (id = auth.uid() or public.can_manage_team());

-- PLAYERS -------------------------------------------------------------------
create policy players_select on public.players
  for select to authenticated using (true);

create policy players_write on public.players
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

-- WEEKLY --------------------------------------------------------------------
create policy weekly_weeks_select on public.weekly_weeks
  for select to authenticated using (true);

create policy weekly_weeks_write on public.weekly_weeks
  for all to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

create policy weekly_payments_select on public.weekly_payments
  for select to authenticated using (true);

create policy weekly_payments_write on public.weekly_payments
  for all to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

-- SPECIAL CONTRIBUTIONS -----------------------------------------------------
create policy sc_select on public.special_contributions
  for select to authenticated using (true);

create policy sc_insert on public.special_contributions
  for insert to authenticated with check (public.can_create_contribution());

create policy sc_update on public.special_contributions
  for update to authenticated
  using (public.can_create_contribution())
  with check (public.can_create_contribution());

create policy sc_delete on public.special_contributions
  for delete to authenticated using (public.can_manage_team());

create policy scp_select on public.special_contribution_payments
  for select to authenticated using (true);

create policy scp_write on public.special_contribution_payments
  for all to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

-- EXPENSES ------------------------------------------------------------------
create policy expenses_select on public.expenses
  for select to authenticated using (true);

create policy expenses_write on public.expenses
  for all to authenticated
  using (public.can_manage_finance())
  with check (public.can_manage_finance());

-- TRAININGS -----------------------------------------------------------------
create policy trainings_select on public.training_sessions
  for select to authenticated using (true);

create policy trainings_write on public.training_sessions
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

create policy attendances_select on public.attendances
  for select to authenticated using (true);

create policy attendances_write on public.attendances
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

-- MATCHES -------------------------------------------------------------------
create policy matches_select on public.matches
  for select to authenticated using (true);

create policy matches_write on public.matches
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

create policy convocations_select on public.match_convocations
  for select to authenticated using (true);

create policy convocations_write on public.match_convocations
  for all to authenticated
  using (public.can_manage_sport())
  with check (public.can_manage_sport());

-- EQUIPMENT -----------------------------------------------------------------
create policy equipment_select on public.equipment
  for select to authenticated using (true);

create policy equipment_write on public.equipment
  for all to authenticated
  using (public.can_manage_team())
  with check (public.can_manage_team());

-- ---------------------------------------------------------------------------
-- 8. DROITS
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant select on public.v_players, public.v_weekly_debts, public.v_weekly_paid,
                public.v_financial_ledger, public.v_balance, public.v_attendance_stats
  to authenticated;
grant execute on function public.current_role(),
                            public.can_manage_team(),
                            public.can_manage_finance(),
                            public.can_create_contribution(),
                            public.can_manage_sport()
  to authenticated;

-- ---------------------------------------------------------------------------
-- 9. RATTRAPAGE DES COMPTES DÉJÀ INSCRITS
--    (profils et fiches joueurs créés avant l'installation du trigger)
-- ---------------------------------------------------------------------------
insert into public.profiles (id, email, full_name, phone, role)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  u.raw_user_meta_data ->> 'phone',
  'JOUEUR'
from auth.users u
on conflict (id) do nothing;

insert into public.players (profile_id, status)
select p.id, 'ACTIF'
from public.profiles p
on conflict (profile_id) do nothing;

-- ============================================================================
-- FIN. Vérification rapide :
--   select id, email, full_name, role from public.profiles;
--   select * from public.v_balance;
-- ============================================================================