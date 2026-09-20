import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  fetchFinancialOverview,
  fetchUpcomingMatches,
  fetchUpcomingTrainings,
} from "@/lib/supabase/queries";
import { formatFcfa } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { PLAYER_ROLES_FILTER } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const canSeeFinance = hasPermission(user.role, "finance.view");
  const isHighStaff =
    user.role === "PRESIDENT_HONNEUR" ||
    user.role === "PRESIDENT" ||
    user.role === "VICE_PRESIDENT";

  const [financial, { count: activePlayers }, trainings, matches] =
    await Promise.all([
      canSeeFinance
        ? fetchFinancialOverview(supabase)
        : Promise.resolve(null),
      supabase
        .from("v_players")
        .select("id", { count: "exact", head: true })
        .not("role", "in", PLAYER_ROLES_FILTER)
        .eq("status", "ACTIF"),
      fetchUpcomingTrainings(supabase, 4),
      fetchUpcomingMatches(supabase, 4),
    ]);

  const weeklyRate = financial
    ? Math.round((financial.weeklyPaidCount / Math.max(financial.weeklyActivePlayers, 1)) * 100)
    : 0;

  return (
    <DashboardShell
      title={`Bonjour, ${user.fullName.split(" ")[0] || "membre"} 👋`}
      description="Voici la situation de Striker FC aujourd'hui."
    >
      {/* Le reminder de séance est rendu dans le header sticky. */}
      {/* Bloc identité club : toujours visible */}
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
        {!canSeeFinance ? (
          <StatCard
            label="Mon rôle"
            value="Actif"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="amber"
          />
        ) : (
          <StatCard
            label="Solde disponible"
            value={formatFcfa(financial?.balance ?? 0)}
            icon={<Wallet className="h-4 w-4" />}
            tone="amber"
          />
        )}
      </div>

      {/* Bloc chiffres caisse pour la direction — en tête de page. */}
      {canSeeFinance && financial && isHighStaff ? (
        <section className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <header className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="section-title">Vue d&apos;ensemble de la caisse</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Chiffres consolidés à l&apos;instant T. Les détails sont dans
                les sections Cotisations, Cotis. spéciales, Dépenses et
                Retards.
              </p>
            </div>
            <span className="rounded-full bg-club-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-club-sky-700">
              Direction
            </span>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-club-green-200 bg-club-green-50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-club-green-700">
                <TrendingUp className="h-3.5 w-3.5" />
                Revenus totaux
              </p>
              <p className="mt-1 text-xl font-black text-club-green-800">
                {formatFcfa(financial.income)}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                <TrendingDown className="h-3.5 w-3.5" />
                Dépenses totales
              </p>
              <p className="mt-1 text-xl font-black text-red-700">
                {formatFcfa(financial.expense)}
              </p>
            </div>
            <div className="rounded-xl border border-club-sky-200 bg-club-sky-50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-club-sky-700">
                <PiggyBank className="h-3.5 w-3.5" />
                Solde net
              </p>
              <p className="mt-1 text-xl font-black text-club-sky-800">
                {formatFcfa(financial.balance)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                <Coins className="h-3.5 w-3.5" />
                Amendes à encaisser
              </p>
              <p className="mt-1 text-xl font-black text-amber-800">
                {formatFcfa(financial.pendingLateAmount)}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700/80">
                {financial.pendingLateCount} retard
                {financial.pendingLateCount > 1 ? "s" : ""} non réglé
                {financial.pendingLateCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cotisation hebdomadaire
              </p>
              <p className="mt-1 text-lg font-black text-club-navy-900">
                {financial.weeklyPaidCount} / {financial.weeklyActivePlayers} joueurs
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {weeklyRate}% de paiement · {formatFcfa(financial.weeklyCollected)} sur{" "}
                {formatFcfa(financial.weeklyExpected)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cotis. exceptionnelles
              </p>
              <p className="mt-1 text-lg font-black text-club-navy-900">
                {formatFcfa(financial.specialCollected)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Encaissé · Reste à percevoir : {formatFcfa(financial.specialPending)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Retards soldés
              </p>
              <p className="mt-1 text-lg font-black text-club-navy-900">
                {formatFcfa(
                  financial.income - financial.weeklyCollected - financial.specialCollected,
                )}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Amendes déjà reversées à la caisse.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
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