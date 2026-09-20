// Types reflétant le schéma Supabase de Striker FC.
// Déclarés en alias `type` (et non `interface`) : Supabase exige des types de
// lignes assignables à Record<string, unknown>, ce qu'une interface n'est pas.

export type UserRole =
  | "PRESIDENT_HONNEUR"
  | "PRESIDENT"
  | "VICE_PRESIDENT"
  | "COACH"
  | "ARBITRE"
  | "TG"
  | "ASSISTANT_TG"
  | "JOUEUR";

export type PlayerStatus = "EN_ATTENTE" | "ACTIF" | "INACTIF";

export type PlayerPosition =
  | "GARDIEN"
  | "DEFENSEUR"
  | "MILIEU"
  | "ATTAQUANT"
  | "POLYVALENT";

export type ExpenseCategory =
  | "TRANSPORT"
  | "EQUIPEMENT"
  | "ACTIVITES"
  | "TERRAIN"
  | "ARBITRAGE"
  | "COTISATION"
  | "AUTRE";

export type EquipmentStatus = "BON" | "MOYEN" | "MAUVAIS" | "HORS_SERVICE";

export type EquipmentCategory =
  | "BALLONS"
  | "MAILLOTS"
  | "CHASUBLES"
  | "CONES"
  | "FILETS"
  | "AUTRE";

export type MatchType = "AMICAL" | "CHAMPIONNAT" | "COUPE" | "TOURNOI";

export type MatchStatus = "A_VENIR" | "JOUE" | "ANNULE";

export type ConvocationRole =
  | "TITULAIRE"
  | "REMPLACANT"
  | "ABSENT"
  | "NON_CONVOQUE";

export type SpecialContributionStatus = "ACTIVE" | "CLOTUREE" | "EXPIREE";

export type FinancialEntryType = "INCOME" | "EXPENSE";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  profile_id: string;
  position: PlayerPosition | null;
  jersey_number: number | null;
  registration_date: string;
  status: PlayerStatus;
  created_at: string;
  updated_at: string;
};

/** Ligne de la vue v_players (joueur + profil). */
export type PlayerWithProfile = {
  id: string;
  profile_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  profile_active: boolean;
  position: PlayerPosition | null;
  jersey_number: number | null;
  registration_date: string;
  status: PlayerStatus;
  created_at: string;
  role: UserRole;
};

export type WeeklyWeek = {
  id: string;
  year: number;
  week_number: number;
  week_start: string;
  week_end: string;
  label: string | null;
  created_by: string | null;
  created_at: string;
};

export type WeeklyPayment = {
  id: string;
  week_id: string;
  player_id: string;
  amount: number;
  paid_at: string;
  recorded_by: string | null;
  created_at: string;
};

export type WeeklyDebt = {
  player_id: string;
  unpaid_weeks: number;
  debt_fcfa: number;
};

export type WeeklyPaid = {
  player_id: string;
  total_paid: number;
  weeks_paid: number;
};

export type SpecialContribution = {
  id: string;
  title: string;
  motif: string | null;
  amount: number;
  due_date: string | null;
  status: SpecialContributionStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SpecialContributionPayment = {
  id: string;
  contribution_id: string;
  player_id: string;
  amount: number;
  paid_at: string;
  recorded_by: string | null;
  created_at: string;
};

export type ImpactType = "BUT" | "PASSE_DECISIVE" | "CLEAN_SHEET";

export type PlayerImpact = {
  id: string;
  week_id: string;
  player_id: string;
  impact_type: ImpactType;
  quantity: number;
  note: string | null;
  recorded_by: string | null;
  created_at: string;
};

export type LateArrivalStatus = "EN_RETARD" | "PAYE";

export type LateArrival = {
  id: string;
  week_id: string;
  player_id: string;
  amount: number;
  note: string | null;
  status: LateArrivalStatus;
  noted_by: string | null;
  noted_at: string;
  cleared_by: string | null;
  cleared_at: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  title: string;
  motif: string | null;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  recorded_by: string | null;
  created_at: string;
};

export type FinancialLedgerEntry = {
  id: string;
  entry_type: FinancialEntryType;
  source: string;
  amount: number;
  label: string;
  occurred_at: string;
  recorded_by: string | null;
};

export type Balance = {
  total_income: number;
  total_expense: number;
  balance: number;
};

export type TrainingSession = {
  id: string;
  title: string;
  session_date: string;
  start_time: string | null;
  location: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Attendance = {
  id: string;
  session_id: string;
  player_id: string;
  present: boolean;
  created_at: string;
};

export type AttendanceStat = {
  player_id: string;
  sessions_recorded: number;
  sessions_attended: number;
};

export type Match = {
  id: string;
  opponent: string;
  is_home: boolean;
  match_date: string;
  match_time: string | null;
  location: string | null;
  match_type: MatchType;
  status: MatchStatus;
  our_score: number | null;
  opponent_score: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MatchConvocation = {
  id: string;
  match_id: string;
  player_id: string;
  role: ConvocationRole;
  position: string | null;
  created_at: string;
};

export type Equipment = {
  id: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  status: EquipmentStatus;
  added_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};