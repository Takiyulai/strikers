import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { LATE_AMOUNT } from "@/lib/constants";
import { getWeekInfo } from "@/lib/dates";
import { hasPermission } from "@/lib/permissions";
import {
  ensureWeek,
  fetchLateArrivalsThisWeek,
  fetchPlayers,
} from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { LateArrivalsManager } from "@/components/attendance/LateArrivalsManager";
import { StatCard } from "@/components/ui/StatCard";
import { formatFcfa } from "@/lib/format";

export const metadata: Metadata = { title: "Retards" };

export default async function RetardsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "attendance.mark_late")) {
    redirect("/dashboard");
  }

  const supabase = createClient();
  const week = await ensureWeek(supabase, getWeekInfo(new Date()));
  const [players, lateArrivals] = await Promise.all([
    fetchPlayers(supabase, { onlyActive: true }),
    fetchLateArrivalsThisWeek(supabase, week.id),
  ]);

  const lateIds = new Set(
    lateArrivals.filter((row) => row.status === "EN_RETARD").map((row) => row.player_id),
  );

  const openCount = lateIds.size;
  const openAmount = openCount * LATE_AMOUNT;
  const paidCount = lateArrivals.filter((row) => row.status === "PAYE").length;
  const paidAmount = lateArrivals
    .filter((row) => row.status === "PAYE")
    .reduce((sum, row) => sum + row.amount, 0);

  return (
    <DashboardShell
      title="Retards"
      description="L'Assistant Trésorier note ici les retardataires. Les amendes sont dues jusqu'au règlement et entrent ensuite dans la caisse."
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Amende par retard"
          value={formatFcfa(LATE_AMOUNT)}
          tone="amber"
        />
        <StatCard
          label="Retards en cours"
          value={openCount}
          tone="amber"
          hint="Cette semaine"
        />
        <StatCard
          label="Montant dû"
          value={formatFcfa(openAmount)}
          tone="amber"
        />
        <StatCard
          label="Encaissé"
          value={formatFcfa(paidAmount)}
          tone="green"
          hint={`${paidCount} retard${paidCount > 1 ? "s" : ""} réglé${paidCount > 1 ? "s" : ""}`}
        />
      </div>

      <LateArrivalsManager
        players={players.map((player) => ({
          playerId: player.id,
          fullName: player.full_name,
          jerseyNumber: player.jersey_number,
          position: player.position,
          hasLate: lateIds.has(player.id),
          lateId: null,
        }))}
        lateArrivals={lateArrivals}
        canMark={true}
        canSettle={hasPermission(user.role, "finance.manage") || true}
      />
    </DashboardShell>
  );
}