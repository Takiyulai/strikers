import type { Metadata } from "next";
import {
  CalendarDays,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchUpcomingMatches, fetchUpcomingTrainings } from "@/lib/supabase/queries";
import { formatFcfa } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { PLAYER_ROLES_FILTER } from "@/lib/constants";
import { getNextTraining } from "@/lib/schedule";
import { hasPermission } from "@/lib/permissions";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = createClient();
  const nextTraining = getNextTraining();

  const [{ data: balance }, { count: activePlayers }, trainings, matches] =
    await Promise.all([
      supabase.from("v_balance").select("*").maybeSingle(),
      supabase
        .from("v_players")
        .select("id", { count: "exact", head: true })
        .not("role", "in", PLAYER_ROLES_FILTER)
        .eq("status", "ACTIF"),
      fetchUpcomingTrainings(supabase, 4),
      fetchUpcomingMatches(supabase, 4),
    ]);

  const canSeeFinance = hasPermission(user.role, "finance.view");

  return (
    <DashboardShell
      title={`Bonjour, ${user.fullName.split(" ")[0] || "membre"} 👋`}
      description="Voici la situation de Striker FC aujourd'hui."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Joueurs actifs"
          value={activePlayers ?? 0}
          icon={<Users className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Entraînements à venir"
          value={trainings.length}
          icon={<CalendarDays className="h-4 w-4" />}
          tone="green"
        />
        <StatCard
          label="Matchs programmés"
          value={matches.length}
          icon={<Trophy className="h-4 w-4" />}
          tone="navy"
        />
        {canSeeFinance ? (
          <StatCard
            label="Solde disponible"
            value={formatFcfa(balance?.balance ?? 0)}
            icon={<Wallet className="h-4 w-4" />}
            tone="amber"
          />
        ) : (
          <StatCard
            label="Mon rôle"
            value="Actif"
            icon={<UserCheck className="h-4 w-4" />}
            tone="amber"
          />
        )}
      </div>

      <section className="mt-4 rounded-2xl bg-pitch-gradient p-5 text-white shadow-card sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-club-sky-300">
              Prochaine séance
            </p>
            <p className="mt-1 text-2xl font-black">
              {nextTraining.dayLabel} · {nextTraining.timeLabel}
            </p>
            <p className="mt-1 text-sm text-white/70">
              {nextTraining.isToday
                ? "C'est aujourd'hui — soyez à l'heure !"
                : nextTraining.daysAway === 1
                  ? "C'est demain."
                  : `Dans ${nextTraining.daysAway} jours.`}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <CalendarDays className="h-4 w-4" />
            Entraînement {nextTraining.slot.label}
          </span>
        </div>
      </section>

      {canSeeFinance ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Revenus totaux"
            value={formatFcfa(balance?.total_income ?? 0)}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="green"
          />
          <StatCard
            label="Dépenses totales"
            value={formatFcfa(balance?.total_expense ?? 0)}
            icon={<Wallet className="h-4 w-4" />}
            tone="red"
          />
          <StatCard
            label="Solde"
            value={formatFcfa(balance?.balance ?? 0)}
            icon={<Wallet className="h-4 w-4" />}
            tone="sky"
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="section-title">Séances enregistrées</h3>
          <div className="mt-4 space-y-3">
            {trainings.length === 0 ? (
              <EmptyState
                title="Aucun entraînement planifié"
                description="Les séances à venir apparaîtront ici."
              />
            ) : (
              trainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-club-navy-900">
                      {training.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {training.location ?? "Lieu à préciser"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-club-sky-700">
                    {formatDate(training.session_date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="section-title">Prochains matchs</h3>
          <div className="mt-4 space-y-3">
            {matches.length === 0 ? (
              <EmptyState
                title="Aucun match programmé"
                description="Les rencontres à venir apparaîtront ici."
              />
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-club-navy-900">
                      Striker FC {match.is_home ? "vs" : "@"} {match.opponent}
                    </p>
                    <p className="text-xs text-slate-500">
                      {match.location ?? "Lieu à préciser"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-club-sky-700">
                    {formatDate(match.match_date)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}