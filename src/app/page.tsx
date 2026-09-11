import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { PLAYER_ROLES_FILTER } from "@/lib/constants";
import {
  fetchMonthlyTopAttendance,
  fetchUpcomingMatches,
} from "@/lib/supabase/queries";
import { getNextTraining } from "@/lib/schedule";

import { Hero } from "@/components/landing/Hero";
import { PublicStats } from "@/components/landing/PublicStats";
import { ValuesSection } from "@/components/landing/ValuesSection";
import { StaffSection } from "@/components/landing/StaffSection";

import type { PublicStats as Stats } from "@/types";

export const revalidate = 300;

async function loadStats(): Promise<Stats> {
  try {
    const supabase = createClient();

    const [{ count: activePlayers }, matches, topAttendance] =
      await Promise.all([
        supabase
          .from("v_players")
          .select("id", { count: "exact", head: true })
          .not("role", "in", PLAYER_ROLES_FILTER)
          .eq("status", "ACTIF"),
        fetchUpcomingMatches(supabase, 1),
        fetchMonthlyTopAttendance(supabase).catch(() => null),
      ]);

    const next = matches[0] ?? null;
    const nextTraining = getNextTraining();

    return {
      activePlayers: activePlayers ?? 0,
      nextTraining: {
        dayLabel: nextTraining.dayLabel,
        timeLabel: nextTraining.timeLabel,
        isToday: nextTraining.isToday,
        daysAway: nextTraining.daysAway,
      },
      nextMatch: next
        ? {
            opponent: next.opponent,
            match_date: next.match_date,
            match_time: next.match_time,
            location: next.location,
            is_home: next.is_home,
          }
        : null,
      topAttendance: topAttendance
        ? {
            full_name: topAttendance.fullName,
            sessions_attended: topAttendance.sessionsAttended,
            sessions_recorded: topAttendance.sessionsRecorded,
            monthLabel: topAttendance.monthLabel,
          }
        : null,
    };
  } catch {
    return {
      activePlayers: 0,
      nextTraining: null,
      nextMatch: null,
      topAttendance: null,
    };
  }
}

export default async function HomePage() {
  const stats = await loadStats();

  return (
    <div className="min-h-screen bg-white">
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-black text-club-navy-900">
              S
            </span>
            <span className="text-sm font-black uppercase tracking-wide text-white">
              Striker FC
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur hover:bg-white/20"
          >
            Connexion
          </Link>
        </div>
      </header>

      <Hero />
      <PublicStats stats={stats} />
      <ValuesSection />
      <StaffSection />

      <footer className="bg-club-navy-950 py-10 text-center text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-lg font-black uppercase tracking-wide">
            Striker FC
          </p>
          <p className="mt-2 text-xs text-white/50">
            © {new Date().getFullYear()} Striker FC — Tous droits réservés.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <Link href="/login" className="text-white/70 hover:text-white">
              Connexion
            </Link>
            <Link href="/register" className="text-white/70 hover:text-white">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}