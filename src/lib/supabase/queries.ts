import { endOfMonth, format, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";
import { PLAYER_ROLES_FILTER, WEEKLY_AMOUNT } from "@/lib/constants";

import type {
  Match,
  PlayerOfMonth,
  PlayerWithProfile,
  SpecialContributionWithStats,
  TrainingSession,
  WeeklyRosterRow,
  WeekSummary,
} from "@/types";
import type { WeeklyWeek } from "@/types/database";

type SupabaseLike = ReturnType<typeof createClient>;

/**
 * Liste des membres soumis à la cotisation et à l'effectif de jeu :
 * tout le monde, sauf le Président d'honneur et le Coach.
 * Le Président, le Vice-président, le TG et l'Arbitre sont donc inclus.
 */
export async function fetchPlayers(
  supabase: SupabaseLike,
  options: { onlyActive?: boolean } = {},
): Promise<PlayerWithProfile[]> {
  let query = supabase
    .from("v_players")
    .select("*")
    .not("role", "in", PLAYER_ROLES_FILTER)
    .order("full_name");

  if (options.onlyActive !== false) {
    query = query.eq("status", "ACTIF");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as PlayerWithProfile[];
}

/**
 * Joueur le plus assidu du mois en cours.
 * La donnée est volontairement mensuelle : c'est une progression du moment,
 * pas un classement définitif.
 */
export async function fetchMonthlyTopAttendance(
  supabase: SupabaseLike,
): Promise<{
  fullName: string;
  sessionsAttended: number;
  sessionsRecorded: number;
  monthLabel: string;
} | null> {
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const { data: sessions, error: sessionsError } = await supabase
    .from("training_sessions")
    .select("id")
    .gte("session_date", monthStart);
  if (sessionsError) throw new Error(sessionsError.message);

  const sessionIds = (sessions ?? []).map((session) => session.id);
  if (sessionIds.length === 0) return null;

  const { data: attendances, error: attendanceError } = await supabase
    .from("attendances")
    .select("player_id")
    .eq("present", true)
    .in("session_id", sessionIds);
  if (attendanceError) throw new Error(attendanceError.message);

  const counts = new Map<string, number>();
  for (const row of attendances ?? []) {
    counts.set(row.player_id, (counts.get(row.player_id) ?? 0) + 1);
  }
  if (counts.size === 0) return null;

  const [topPlayerId, attended] = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const { data: player } = await supabase
    .from("v_players")
    .select("full_name")
    .eq("id", topPlayerId)
    .maybeSingle();
  if (!player) return null;

  return {
    fullName: player.full_name,
    sessionsAttended: attended,
    sessionsRecorded: sessionIds.length,
    monthLabel: format(new Date(), "MMMM yyyy", { locale: fr }),
  };
}

/** Retrouve la semaine enregistrée pour une date, ou la crée. */
export async function ensureWeek(
  supabase: SupabaseLike,
  info: {
    year: number;
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    label: string;
  },
): Promise<WeeklyWeek> {
  const { data: existing } = await supabase
    .from("weekly_weeks")
    .select("*")
    .eq("year", info.year)
    .eq("week_number", info.weekNumber)
    .maybeSingle();

  if (existing) return existing as WeeklyWeek;

  const { data, error } = await supabase
    .from("weekly_weeks")
    .insert({
      year: info.year,
      week_number: info.weekNumber,
      week_start: info.weekStart,
      week_end: info.weekEnd,
      label: info.label,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as WeeklyWeek;
}

/** Récapitulatif d'une semaine (payeurs, non-payeurs, montant collecté). */
export async function fetchWeekSummary(
  supabase: SupabaseLike,
  week: WeeklyWeek,
): Promise<WeekSummary> {
  const players = await fetchPlayers(supabase, { onlyActive: true });

  const { data: payments, error } = await supabase
    .from("weekly_payments")
    .select("player_id, amount")
    .eq("week_id", week.id);

  if (error) throw new Error(error.message);

  const paidPlayerIds = (payments ?? []).map((p) => p.player_id);
  const collected = (payments ?? []).reduce((sum, p) => sum + p.amount, 0);
  const totalActivePlayers = players.length;

  return {
    week: {
      id: week.id,
      year: week.year,
      week_number: week.week_number,
      week_start: week.week_start,
      week_end: week.week_end,
      label: week.label,
    },
    totalActivePlayers,
    paidCount: paidPlayerIds.length,
    unpaidCount: Math.max(totalActivePlayers - paidPlayerIds.length, 0),
    collected,
    expected: totalActivePlayers * WEEKLY_AMOUNT,
    paidPlayerIds,
  };
}

/** Tableau de saisie hebdomadaire : chaque joueur actif + son statut. */
export async function fetchWeeklyRoster(
  supabase: SupabaseLike,
  weekId: string,
): Promise<WeeklyRosterRow[]> {
  const players = await fetchPlayers(supabase, { onlyActive: true });

  const [{ data: payments }, { data: debts }, { data: paidTotals }, { data: profiles }] =
    await Promise.all([
      supabase
        .from("weekly_payments")
        .select("player_id, recorded_by")
        .eq("week_id", weekId),
      supabase.from("v_weekly_debts").select("player_id, debt_fcfa"),
      supabase.from("v_weekly_paid").select("player_id, total_paid"),
      supabase.from("profiles").select("id, full_name"),
    ]);

  const paidSet = new Set((payments ?? []).map((p) => p.player_id));
  const debtMap = new Map((debts ?? []).map((d) => [d.player_id, d.debt_fcfa]));
  const totalPaidMap = new Map(
    (paidTotals ?? []).map((p) => [p.player_id, p.total_paid]),
  );
  const namesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
  );

  return players.map((player) => {
    const payment = (payments ?? []).find((p) => p.player_id === player.id);
    return {
      playerId: player.id,
      fullName: player.full_name,
      jerseyNumber: player.jersey_number,
      position: player.position,
      hasPaid: paidSet.has(player.id),
      debtFcfa: debtMap.get(player.id) ?? 0,
      totalPaid: totalPaidMap.get(player.id) ?? 0,
      paidRecordedBy: payment?.recorded_by
        ? namesById.get(payment.recorded_by) ?? null
        : null,
    };
  });
}

/** Prochains entraînements. */
export async function fetchUpcomingTrainings(
  supabase: SupabaseLike,
  limit = 5,
): Promise<TrainingSession[]> {
  const { data, error } = await supabase
    .from("training_sessions")
    .select("*")
    .gte("session_date", new Date().toISOString().slice(0, 10))
    .order("session_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingSession[];
}

/** Prochains matchs. */
export async function fetchUpcomingMatches(
  supabase: SupabaseLike,
  limit = 5,
): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "A_VENIR")
    .gte("match_date", new Date().toISOString().slice(0, 10))
    .order("match_date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as Match[];
}

/** Cotisations exceptionnelles enrichies de leurs paiements (traçables). */
export async function fetchSpecialContributions(
  supabase: SupabaseLike,
): Promise<SpecialContributionWithStats[]> {
  const [
    { data: contributions },
    { data: payments },
    roster,
    { data: profiles },
  ] = await Promise.all([
    supabase
      .from("special_contributions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("special_contribution_payments")
      .select("contribution_id, player_id, amount, paid_at, recorded_by"),
    fetchPlayers(supabase, { onlyActive: true }),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const expectedCount = roster.length;
  const namesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
  );

  return (contributions ?? []).map((contribution) => {
    const rows = (payments ?? []).filter(
      (payment) => payment.contribution_id === contribution.id,
    );
    return {
      contribution,
      collected: rows.reduce((sum, payment) => sum + payment.amount, 0),
      paidCount: rows.length,
      expectedCount,
      paidPlayerIds: rows.map((payment) => payment.player_id),
      payments: rows.map((payment) => ({
        playerId: payment.player_id,
        amount: payment.amount,
        paidAt: payment.paid_at,
        recordedByName: payment.recorded_by
          ? namesById.get(payment.recorded_by) ?? null
          : null,
      })),
    };
  });
}

/**
 * Joueur du mois : score combinant l'engagement aux cotisations, la
 * présence aux entraînements et les impacts hebdomadaires consignés par
 * le staff (buts, passes décisives, clean sheets).
 *
 * Score = présences ×2 + cotisations payées ×3 − semaines de retard ×2
 *         + buts ×5 + passes décisives ×3 + clean sheets ×4
 */
export async function fetchPlayerOfMonth(
  supabase: SupabaseLike,
): Promise<PlayerOfMonth | null> {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");

  const roster = await fetchPlayers(supabase, { onlyActive: true });
  if (roster.length === 0) return null;

  const [{ data: weeks }, { data: trainings }] = await Promise.all([
    supabase
      .from("weekly_weeks")
      .select("id")
      .gte("week_start", monthStart)
      .lte("week_start", monthEnd),
    supabase
      .from("training_sessions")
      .select("id")
      .gte("session_date", monthStart)
      .lte("session_date", monthEnd),
  ]);

  const weekIds = (weeks ?? []).map((week) => week.id);
  const sessionIds = (trainings ?? []).map((training) => training.id);

  const attendance = new Map<string, number>();
  if (sessionIds.length > 0) {
    const { data: attendances } = await supabase
      .from("attendances")
      .select("player_id")
      .eq("present", true)
      .in("session_id", sessionIds);
    for (const row of attendances ?? []) {
      attendance.set(row.player_id, (attendance.get(row.player_id) ?? 0) + 1);
    }
  }

  const duesPaid = new Map<string, number>();
  if (weekIds.length > 0) {
    const { data: payments } = await supabase
      .from("weekly_payments")
      .select("player_id, week_id")
      .in("week_id", weekIds);
    for (const row of payments ?? []) {
      duesPaid.set(row.player_id, (duesPaid.get(row.player_id) ?? 0) + 1);
    }
  }

  const impacts = new Map<
    string,
    { buts: number; passes: number; cleanSheets: number }
  >();
  if (weekIds.length > 0) {
    const { data: rows } = await supabase
      .from("player_impacts")
      .select("player_id, impact_type, quantity")
      .in("week_id", weekIds);
    for (const row of rows ?? []) {
      const entry =
        impacts.get(row.player_id) ?? { buts: 0, passes: 0, cleanSheets: 0 };
      if (row.impact_type === "BUT") entry.buts += row.quantity;
      else if (row.impact_type === "PASSE_DECISIVE") entry.passes += row.quantity;
      else entry.cleanSheets += row.quantity;
      impacts.set(row.player_id, entry);
    }
  }

  const expectedWeeks = weekIds.length;
  let best: PlayerOfMonth | null = null;

  for (const player of roster) {
    const attended = attendance.get(player.id) ?? 0;
    const paid = Math.min(duesPaid.get(player.id) ?? 0, expectedWeeks);
    const late = Math.max(expectedWeeks - paid, 0);
    const playerImpacts =
      impacts.get(player.id) ?? { buts: 0, passes: 0, cleanSheets: 0 };

    const score =
      attended * 2 +
      paid * 3 -
      late * 2 +
      playerImpacts.buts * 5 +
      playerImpacts.passes * 3 +
      playerImpacts.cleanSheets * 4;

    if (!best || score > best.score) {
      const highlights: string[] = [];
      if (playerImpacts.buts > 0) {
        highlights.push(
          `${playerImpacts.buts} but${playerImpacts.buts > 1 ? "s" : ""}`,
        );
      }
      if (playerImpacts.passes > 0) {
        highlights.push(
          `${playerImpacts.passes} passe${
            playerImpacts.passes > 1 ? "s" : ""
          } décisive${playerImpacts.passes > 1 ? "s" : ""}`,
        );
      }
      if (playerImpacts.cleanSheets > 0) {
        highlights.push(
          `${playerImpacts.cleanSheets} clean sheet${
            playerImpacts.cleanSheets > 1 ? "s" : ""
          }`,
        );
      }
      if (sessionIds.length > 0) {
        highlights.push(`${attended}/${sessionIds.length} entraînements`);
      }
      highlights.push(
        late === 0
          ? "cotisations à jour"
          : `${late} semaine${late > 1 ? "s" : ""} de retard`,
      );

      const rawMonth = format(now, "MMMM yyyy", { locale: fr });
      best = {
        fullName: player.full_name,
        monthLabel: rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1),
        score,
        attendance: { attended, total: sessionIds.length },
        dues: { paid, late },
        impacts: playerImpacts,
        highlights,
      };
    }
  }

  return best;
}