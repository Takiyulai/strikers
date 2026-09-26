import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { PLAYER_ROLES_FILTER } from "@/lib/constants";
import {
  fetchPlayerOfMonth,
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

    const [{ count: activePlayers }, matches, playerOfMonth] =
      await Promise.all([
        supabase
          .from("v_players")
          .select("id", { count: "exact", head: true })
          .not("role", "in", PLAYER_ROLES_FILTER)
          .eq("status", "ACTIF"),
        fetchUpcomingMatches(supabase, 1),
        fetchPlayerOfMonth(supabase).catch(() => null),
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
      playerOfMonth: playerOfMonth
        ? {
            fullName: playerOfMonth.fullName,
            monthLabel: playerOfMonth.monthLabel,
            highlights: playerOfMonth.highlights,
          }
        : null,
    };
  } catch {
    return {
      activePlayers: 0,
      nextTraining: null,
      nextMatch: null,
      playerOfMonth: null,
    };
  }
}

export default async function HomePage() {
  const stats = await loadStats();

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <header className="absolute left-0 right-0 top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-lg font-black shadow-lg backdrop-blur-md">
              S
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black uppercase tracking-[0.14em]">Striker FC</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.28em] text-white/45">Football club</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-semibold text-white/65 md:flex">
            <a href="#club" className="transition-colors hover:text-white">Le club</a>
            <a href="#valeurs" className="transition-colors hover:text-white">Nos valeurs</a>
            <a href="#staff" className="transition-colors hover:text-white">Le staff</a>
          </nav>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            Connexion
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <Hero />
      <PublicStats stats={stats} />
      <ValuesSection />
      <StaffSection />

      <footer className="border-t border-white/10 bg-club-navy-950 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8 lg:px-10">
          <div className="text-center sm:text-left">
            <p className="text-base font-black uppercase tracking-[0.14em]">Striker FC</p>
            <p className="mt-1 text-xs text-white/35">La discipline forge les champions.</p>
          </div>
          <p className="text-xs text-white/35">© {new Date().getFullYear()} Striker FC — Tous droits réservés.</p>
          <div className="flex gap-5 text-xs font-semibold">
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
