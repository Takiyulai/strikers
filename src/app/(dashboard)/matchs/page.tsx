import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { MATCH_STATUS_LABELS, MATCH_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { MatchForm } from "@/components/sport/MatchForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Matchs" };

export default async function MatchsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const canManage = hasPermission(user.role, "sport.manage");
  const supabase = createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: false })
    .limit(30);

  return (
    <DashboardShell
      title="Matchs"
      description="Calendrier des rencontres et convocations."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {!matches || matches.length === 0 ? (
            <EmptyState
              title="Aucun match programmé"
              description="Créez un match pour préparer la convocation."
            />
          ) : (
            matches.map((match) => (
              <Link
                key={match.id}
                href={`/matchs/${match.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-club-navy-900">
                    Striker FC {match.is_home ? "vs" : "@"} {match.opponent}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(match.match_date)}
                    {match.match_time ? ` · ${match.match_time}` : ""}
                    {match.location ? ` · ${match.location}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="navy">
                      {MATCH_TYPE_LABELS[match.match_type]}
                    </Badge>
                    <Badge
                      tone={
                        match.status === "A_VENIR"
                          ? "sky"
                          : match.status === "JOUE"
                            ? "green"
                            : "neutral"
                      }
                    >
                      {MATCH_STATUS_LABELS[match.status]}
                    </Badge>
                    {match.status === "JOUE" ? (
                      <Badge tone="amber">
                        {match.our_score ?? 0} – {match.opponent_score ?? 0}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
              </Link>
            ))
          )}
        </div>

        {canManage ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="section-title mb-4">Nouveau match</h3>
              <MatchForm />
            </div>
          </aside>
        ) : null}
      </div>
    </DashboardShell>
  );
}