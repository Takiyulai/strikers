export * from "./database";

import type {
  PlayerWithProfile,
  SpecialContribution,
  UserRole,
} from "./database";

export const ROLE_LABELS: Record<UserRole, string> = {
  PRESIDENT_HONNEUR: "Président d'honneur",
  PRESIDENT: "Président",
  VICE_PRESIDENT: "Vice-président",
  SECRETAIRE: "Secrétaire",
  COACH: "Coach",
  ARBITRE: "Arbitre",
  TG: "Trésorier Général",
  JOUEUR: "Joueur",
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  PRESIDENT_HONNEUR: "bg-amber-100 text-amber-800",
  PRESIDENT: "bg-club-navy-100 text-club-navy-800",
  VICE_PRESIDENT: "bg-club-navy-100 text-club-navy-700",
  SECRETAIRE: "bg-indigo-100 text-indigo-800",
  COACH: "bg-club-green-100 text-club-green-800",
  ARBITRE: "bg-purple-100 text-purple-800",
  TG: "bg-club-sky-100 text-club-sky-800",
  JOUEUR: "bg-slate-100 text-slate-700",
};

export const STAFF_ROLES: UserRole[] = [
  "PRESIDENT_HONNEUR",
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETAIRE",
  "COACH",
  "ARBITRE",
  "TG",
];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  playerId: string | null;
}

export type PlayerListItem = PlayerWithProfile;

/** Statistiques publiques affichées sur la landing page. */
export interface PublicStats {
  activePlayers: number;
  nextTraining: {
    dayLabel: string;
    timeLabel: string;
    isToday: boolean;
    daysAway: number;
  } | null;
  nextMatch: {
    opponent: string;
    match_date: string;
    match_time: string | null;
    location: string | null;
    is_home: boolean;
  } | null;
  playerOfMonth: {
    fullName: string;
    monthLabel: string;
    highlights: string[];
  } | null;
}

/** Résumé financier d'une semaine de cotisation. */
export interface WeekSummary {
  week: {
    id: string;
    year: number;
    week_number: number;
    week_start: string;
    week_end: string;
    label: string | null;
  };
  totalActivePlayers: number;
  paidCount: number;
  unpaidCount: number;
  collected: number;
  expected: number;
  paidPlayerIds: string[];
}

/** Ligne du registre de saisie hebdomadaire (TG). */
export interface WeeklyRosterRow {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  hasPaid: boolean;
  debtFcfa: number;
  totalPaid: number;
}

/** Récapitulatif financier global. */
export interface FinanceOverview {
  balance: BalanceLike;
  weeklyCollectedThisMonth: number;
  specialCollected: number;
  totalExpenses: number;
  totalDebt: number;
  debtorsCount: number;
}

export interface BalanceLike {
  total_income: number;
  total_expense: number;
  balance: number;
}

/** Cotisation exceptionnelle enrichie de ses statistiques de paiement. */
export interface SpecialContributionWithStats {
  contribution: SpecialContribution;
  collected: number;
  paidCount: number;
  expectedCount: number;
  paidPlayerIds: string[];
}

/** Score mensuel multi-critères : présences, cotisations, impacts. */
export interface PlayerOfMonth {
  fullName: string;
  monthLabel: string;
  score: number;
  attendance: { attended: number; total: number };
  dues: { paid: number; late: number };
  impacts: { buts: number; passes: number; cleanSheets: number };
  highlights: string[];
}