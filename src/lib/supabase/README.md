# Couche Supabase

- `client.ts` : client navigateur (`createBrowserClient`), utilisé dans les composants `"use client"`.
- `server.ts` : client serveur (`createServerClient` + cookies), utilisé dans les Server Components et Server Actions.
- `middleware.ts` : rafraîchit la session à chaque requête et alimente `middleware.ts` à la racine.
- `admin.ts` : client `service_role`, réservé aux Route Handlers / Server Actions de confiance.
- `types.ts` : type `Database` décrivant les tables/vues du schéma SQL.
- `queries.ts` : fonctions de lecture partagées.

Le schéma complet se trouve dans `supabase/schema.sql`.