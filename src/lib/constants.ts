import type {
  ConvocationRole,
  EquipmentCategory,
  EquipmentStatus,
  ExpenseCategory,
  MatchStatus,
  MatchType,
  PlayerPosition,
  PlayerStatus,
  SpecialContributionStatus,
  UserRole,
} from "@/types/database";

/** Cotisation hebdomadaire obligatoire, en FCFA. */
export const WEEKLY_AMOUNT = 100;

/** Montants proposés pour les cotisations exceptionnelles. */
export const SPECIAL_AMOUNTS = [500, 1000, 2000, 5000] as const;

/** Jours d'entraînement habituels (0 = dimanche). */
export const TRAINING_DAYS = [3, 6, 0] as const;

/**
 * Rôles hors effectif de jeu et non soumis à la cotisation hebdomadaire.
 * Tout le reste du staff (Président, Vice-président, TG, Arbitre) est
 * également joueur : il paie, s'entraîne et peut être convoqué.
 */
export const NON_PLAYER_ROLES: UserRole[] = ["PRESIDENT_HONNEUR", "COACH"];

/** Filtre PostgREST associé, à utiliser avec .not("role", "in", …). */
export const PLAYER_ROLES_FILTER = `(${NON_PLAYER_ROLES.join(",")})`;

export const USER_ROLES: UserRole[] = [
  "PRESIDENT_HONNEUR",
  "PRESIDENT",
  "VICE_PRESIDENT",
  "COACH",
  "ARBITRE",
  "TG",
  "JOUEUR",
];

export const PLAYER_POSITIONS: PlayerPosition[] = [
  "GARDIEN",
  "DEFENSEUR",
  "MILIEU",
  "ATTAQUANT",
  "POLYVALENT",
];

export const PLAYER_STATUSES: PlayerStatus[] = [
  "ACTIF",
  "EN_ATTENTE",
  "INACTIF",
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "TRANSPORT",
  "EQUIPEMENT",
  "ACTIVITES",
  "TERRAIN",
  "ARBITRAGE",
  "COTISATION",
  "AUTRE",
];

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  "BALLONS",
  "MAILLOTS",
  "CHASUBLES",
  "CONES",
  "FILETS",
  "AUTRE",
];

export const EQUIPMENT_STATUSES: EquipmentStatus[] = [
  "BON",
  "MOYEN",
  "MAUVAIS",
  "HORS_SERVICE",
];

export const MATCH_TYPES: MatchType[] = [
  "AMICAL",
  "CHAMPIONNAT",
  "COUPE",
  "TOURNOI",
];

export const MATCH_STATUSES: MatchStatus[] = ["A_VENIR", "JOUE", "ANNULE"];

export const CONVOCATION_ROLES: ConvocationRole[] = [
  "TITULAIRE",
  "REMPLACANT",
  "ABSENT",
  "NON_CONVOQUE",
];

export const SPECIAL_CONTRIBUTION_STATUSES: SpecialContributionStatus[] = [
  "ACTIVE",
  "CLOTUREE",
  "EXPIREE",
];

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  GARDIEN: "Gardien",
  DEFENSEUR: "Défenseur",
  MILIEU: "Milieu",
  ATTAQUANT: "Attaquant",
  POLYVALENT: "Polyvalent",
};

export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  ACTIF: "Actif",
  EN_ATTENTE: "En attente",
  INACTIF: "Inactif",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRANSPORT: "Transport",
  EQUIPEMENT: "Équipement",
  ACTIVITES: "Activités",
  TERRAIN: "Terrain",
  ARBITRAGE: "Arbitrage",
  COTISATION: "Cotisation",
  AUTRE: "Autre",
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  BALLONS: "Ballons",
  MAILLOTS: "Maillots",
  CHASUBLES: "Chasubles",
  CONES: "Cônes",
  FILETS: "Filets",
  AUTRE: "Autre",
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  BON: "Bon",
  MOYEN: "Moyen",
  MAUVAIS: "Mauvais",
  HORS_SERVICE: "Hors service",
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  AMICAL: "Match amical",
  CHAMPIONNAT: "Championnat",
  COUPE: "Coupe",
  TOURNOI: "Tournoi",
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  A_VENIR: "À venir",
  JOUE: "Joué",
  ANNULE: "Annulé",
};

export const CONVOCATION_ROLE_LABELS: Record<ConvocationRole, string> = {
  TITULAIRE: "Titulaire",
  REMPLACANT: "Remplaçant",
  ABSENT: "Absent",
  NON_CONVOQUE: "Non convoqué",
};

export const SPECIAL_CONTRIBUTION_STATUS_LABELS: Record<
  SpecialContributionStatus,
  string
> = {
  ACTIVE: "Active",
  CLOTUREE: "Clôturée",
  EXPIREE: "Expirée",
};