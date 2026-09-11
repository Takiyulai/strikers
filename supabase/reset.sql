-- ============================================================================
-- STRIKER FC — RÉINITIALISATION TOTALE DU SCHÉMA `public`
--
-- À exécuter SEUL, en une fois, AVANT supabase/schema.sql.
-- Ce script ne recrée rien : il ne fait que supprimer tout l'ancien SQL
-- (tables, vues, fonctions, types, politiques) de la version précédente.
--
-- Pourquoi un fichier séparé ?
-- Le SQL Editor exécute tout le texte collé dans une seule transaction :
-- si UNE seule instruction échoue, TOUT est annulé, y compris le nettoyage.
-- En isolant la suppression, on garantit qu'elle est bien enregistrée même
-- si la recréation du schéma devait échouer ensuite.
--
-- ⚠️  Opération destructive et irréversible.
-- ============================================================================

drop schema if exists public cascade;
create schema public;

-- Droits standard attendus par Supabase (PostgREST / anon / authenticated).
grant usage on schema public to anon, authenticated, service_role;
grant all on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- VÉRIFICATION — cette requête doit renvoyer ZÉRO ligne.
-- Si elle renvoie des noms de tables, la suppression n'a pas eu lieu.
-- ---------------------------------------------------------------------------
select table_name
from information_schema.tables
where table_schema = 'public';