-- ============================================================================
-- STRIKER FC — Données initiales (facultatif)
-- À exécuter après schema.sql, dans l'éditeur SQL Supabase.
-- Remplacez les UUID par ceux de vos utilisateurs une fois inscrits.
-- ============================================================================

-- Exemple de matériel de départ
insert into public.equipment (name, category, quantity, status, notes)
values
  ('Ballons de match', 'BALLONS', 6, 'BON', null),
  ('Maillots domicile', 'MAILLOTS', 20, 'BON', 'Bleu ciel / blanc'),
  ('Chasubles entraînement', 'CHASUBLES', 24, 'MOYEN', null),
  ('Cônes', 'CONES', 30, 'BON', null),
  ('Filets de but', 'FILETS', 2, 'MAUVAIS', 'À remplacer')
on conflict do nothing;