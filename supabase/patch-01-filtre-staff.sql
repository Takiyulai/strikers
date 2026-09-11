-- ============================================================================
-- STRIKER FC — Patch 01 : cotisation et effectif
--
-- RÈGLE DU CLUB :
--   • TOUT LE MONDE paie la cotisation hebdomadaire (100 FCFA), sans
--     exception, SAUF le Président d'honneur et le Coach.
--   • Le reste du staff (Président, Vice-président, TG, Arbitre) est
--     également joueur : il paie, s'entraîne et peut être convoqué.
--
-- Ce patch aligne les vues sur cette règle. Aucune donnée n'est perdue.
-- Idempotent : relancez-le autant de fois que nécessaire (une version
-- antérieure de ce patch est automatiquement remplacée).
-- ============================================================================

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

-- Dette hebdomadaire : tout le monde sauf Président d'honneur et Coach
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

-- Assiduité : tout le monde sauf Président d'honneur et Coach
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
-- VÉRIFICATIONS
-- ---------------------------------------------------------------------------
-- Le rôle de chacun doit s'afficher :
select full_name, role, status from public.v_players order by full_name;

-- Le Président d'honneur et le Coach ne doivent PAS apparaître ici :
select * from public.v_weekly_debts;