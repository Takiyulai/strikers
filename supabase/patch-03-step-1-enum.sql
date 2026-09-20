-- ============================================================================
-- STRIKER FC — Patch 03 (étape 1/2) : ajout du rôle ASSISTANT_TG
--
-- Pourquoi un script séparé :
--   PostgreSQL refuse d'utiliser une nouvelle valeur d'enum dans la même
--   transaction que `ALTER TYPE … ADD VALUE` (erreur 55P04). En exécutant
--   UNIQUEMENT ce script dans la fenêtre SQL, le SQL Editor Supabase
--   committe la transaction implicitement, et l'étape 2 peut alors
--   référencer la nouvelle valeur.
--
-- ⚠️ Ne pas ajouter d'autres requêtes ici (sélection, count, etc.) qui
--   toucheraient le type enum — elles ré-introduiraient l'erreur 55P04.
-- ============================================================================

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
