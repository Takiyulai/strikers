# Striker FC — Plateforme de gestion d'équipe

Application web de gestion complète d'un club de football : joueurs, cotisations
hebdomadaires et exceptionnelles, dépenses, entraînements, matchs, convocations et
matériel.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS 3 (palette club : bleu ciel, blanc, vert, bleu marine)
- Supabase (Auth, PostgreSQL, RLS) via `@supabase/ssr`
- `html-to-image` pour la génération des visuels PNG
- `lucide-react` pour les icônes, `date-fns` pour les dates

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

## Variables d'environnement

Renseignées dans `.env.local` (voir `.env.example`) :

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (client navigateur) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur (opérations privilégiées) |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application |

## Base de données

1. Ouvrir le **SQL Editor** du tableau de bord Supabase.
2. Exécuter `supabase/schema.sql` : types, tables, vues, fonctions, triggers et
   politiques RLS.
3. Facultatif : exécuter `supabase/seed.sql` pour un inventaire de départ.
4. Dans **Authentication > Providers**, activer l'authentification par e-mail.

À l'inscription, un trigger crée automatiquement le profil (rôle `JOUEUR`) et la
fiche joueur associée.

## Rôles

`PRESIDENT_HONNEUR`, `PRESIDENT`, `VICE_PRESIDENT`, `COACH`, `ARBITRE`, `TG`,
`JOUEUR`. Les permissions sont centralisées dans `src/lib/permissions.ts` et
appliquées côté base par les politiques RLS (`can_manage_team()`,
`can_manage_finance()`, `can_manage_sport()`, `can_create_contribution()`).

## Logique de cotisation hebdomadaire

Chaque semaine ISO est matérialisée dans `weekly_weeks` (l'historique est donc
conservé même sans paiement). Le TG ne saisit que les **payeurs** ; la vue
`v_weekly_debts` calcule automatiquement, pour chaque joueur, le nombre de
semaines non payées et la dette cumulée (100 FCFA par semaine). Un joueur actif
sans ligne dans `weekly_payments` pour une semaine est donc automatiquement
considéré comme non payeur.

## Structure

```
src/
├── app/
│   ├── (auth)/            # connexion, inscription
│   ├── (dashboard)/       # dashboard, cotisations, dépenses, joueurs, matchs…
│   ├── layout.tsx
│   └── page.tsx           # landing page publique
├── components/
│   ├── auth/  dashboard/  finance/  landing/  layout/  sport/  ui/
├── lib/
│   ├── actions/           # Server Actions (finances, sport)
│   ├── supabase/          # clients browser / server / admin + types
│   ├── auth.ts  permissions.ts  dates.ts  format.ts  constants.ts  png.ts
├── types/
└── hooks/
supabase/
├── schema.sql             # schéma complet (tables, vues, RLS)
└── seed.sql
```

## Visuels PNG

Les rapports de cotisation et les convocations sont générés côté client :
un composant caché (hors écran) est capturé par `html-to-image`, puis téléchargé
en PNG, prêt à être partagé sur WhatsApp.