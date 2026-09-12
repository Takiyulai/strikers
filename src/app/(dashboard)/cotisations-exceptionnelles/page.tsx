import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { fetchPlayers, fetchSpecialContributions } from "@/lib/supabase/queries";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpecialContributionsManager } from "@/components/finance/SpecialContributionsManager";

export const metadata: Metadata = { title: "Cotisations spéciales" };

export default async function CotisationsExceptionnellesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!hasPermission(user.role, "contribution.view")) redirect("/dashboard");

  const supabase = createClient();
  const [contributions, roster] = await Promise.all([
    fetchSpecialContributions(supabase),
    fetchPlayers(supabase, { onlyActive: true }),
  ]);

  const canManage = hasPermission(user.role, "contribution.create");
  const canRecord = canManage || hasPermission(user.role, "finance.manage");

  return (
    <DashboardShell
      title="Cotisations exceptionnelles"
      description="Lancées par le Trésorier Général ou la direction — montant, motif, paiements et récapitulatif."
    >
      <SpecialContributionsManager
        contributions={contributions}
        roster={roster.map((player) => ({
          playerId: player.id,
          fullName: player.full_name,
          jerseyNumber: player.jersey_number,
        }))}
        canManage={canManage}
        canRecord={canRecord}
      />
    </DashboardShell>
  );
}