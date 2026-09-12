// Type `Database` attendu par supabase-js : décrit tables et vues exposées.
// Il doit rester aligné sur supabase/schema.sql.
//
// Note : postgrest-js exige `Row: Record<string, unknown>`. Les types de lignes
// sont donc contraints explicitement, et `Insert`/`Update` sont intersectés avec
// `Record<string, unknown>` pour rester compatibles avec `GenericTable`.

import type {
  Attendance,
  AttendanceStat,
  Balance,
  Equipment,
  Expense,
  FinancialLedgerEntry,
  Match,
  MatchConvocation,
  Player,
  PlayerImpact,
  PlayerWithProfile,
  Profile,
  SpecialContribution,
  SpecialContributionPayment,
  TrainingSession,
  WeeklyDebt,
  WeeklyPaid,
  WeeklyPayment,
  WeeklyWeek,
} from "@/types/database";

type RowShape = Record<string, unknown>;

type Table<Row extends RowShape> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type View<Row extends RowShape> = {
  Row: Row;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      players: Table<Player>;
      weekly_weeks: Table<WeeklyWeek>;
      weekly_payments: Table<WeeklyPayment>;
      special_contributions: Table<SpecialContribution>;
      special_contribution_payments: Table<SpecialContributionPayment>;
      expenses: Table<Expense>;
      training_sessions: Table<TrainingSession>;
      attendances: Table<Attendance>;
      matches: Table<Match>;
      match_convocations: Table<MatchConvocation>;
      player_impacts: Table<PlayerImpact>;
      equipment: Table<Equipment>;
    };
    Views: {
      v_players: View<PlayerWithProfile>;
      v_weekly_debts: View<WeeklyDebt>;
      v_weekly_paid: View<WeeklyPaid>;
      v_financial_ledger: View<FinancialLedgerEntry>;
      v_balance: View<Balance>;
      v_attendance_stats: View<AttendanceStat>;
    };
    Functions: {
      current_role: { Args: Record<string, never>; Returns: string };
      can_manage_team: { Args: Record<string, never>; Returns: boolean };
      can_manage_finance: { Args: Record<string, never>; Returns: boolean };
      can_create_contribution: { Args: Record<string, never>; Returns: boolean };
      can_manage_contribution: { Args: Record<string, never>; Returns: boolean };
      can_manage_sport: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: string;
      player_status: string;
      player_position: string;
      expense_category: string;
      equipment_status: string;
      equipment_category: string;
      match_type: string;
      match_status: string;
      convocation_role: string;
      special_contribution_status: string;
      impact_type: string;
    };
    CompositeTypes: Record<string, never>;
  };
};