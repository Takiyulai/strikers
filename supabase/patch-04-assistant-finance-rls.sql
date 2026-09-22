-- ============================================================================
-- STRIKER FC — Patch 04 : étendre can_manage_finance() à ASSISTANT_TG
--
-- Le rôle ASSISTANT_TG possède les permissions finance.view et finance.manage
-- côté application, mais la fonction SQL can_manage_finance() (utilisée par
-- les policies RLS) ne l'incluait pas. Conséquence : toute insertion ou
-- modification depuis une page utilisée par l'Assistant TG échouait avec
-- « new row violates row-level security policy ».
--
-- Ce patch ajoute simplement ASSISTANT_TG à la liste des rôles autorisés
-- dans can_manage_finance(), ce qui débloque d'un coup :
--   • weekly_weeks       (ensureWeek)
--   • weekly_payments    (saisie cotisations)
--   • special_contribution_payments
--   • expenses
--   • late_arrivals      (déjà couvert aussi par policy dédiée)
--
-- Idempotent : peut être relancé sans risque.
-- ============================================================================

create or replace function public.can_manage_finance()
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select coalesce(
    (select role in ('PRESIDENT_HONNEUR', 'PRESIDENT', 'VICE_PRESIDENT', 'TG', 'ASSISTANT_TG')
     from public.profiles where id = auth.uid()),
    false
  );
$$;
