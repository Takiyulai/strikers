import { notFound, redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { fetchPlayers } from "@/lib/supabase/queries";
import { MATCH_STATUS_LABELS, MATCH_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/dates";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ConvocationBuilder } from "@/components/sport/ConvocationBuilder";
import { Badge } from "@/components/ui/Badge";

import type { ConvocationRole } from "@/types/database";

export default async function MatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const canManage = hasPermission(user.role, "sport.manage");

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!match) notFound();

  const [players, { data: convocations }] = await Promise.all([
    fetchPlayers(supabase),
    supabase
      .from("match_convocations")
      .select("player_id, role")
      .eq("match_id", params.id),
  ]);

  return (
    <DashboardShell
      title={`Striker FC ${match.is_home ? "vs" : "@"} ${match.opponent}`}
      description={`${MATCH_TYPE_LABELS[match.match_type]} · ${formatDate(
        match.match_date,
      )}`}
      action={
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
      }
    >
      {canManage ? (
        <ConvocationBuilder
          matchId={match.id}
          opponent={match.opponent}
          matchDate={match.match_date}
          matchTime={match.match_time}
          location={match.location}
          players={players}
          initial={(convocations ?? []).map((c) => ({
            player_id: c.player_id,
            role: c.role as ConvocationRole,
          }))}
        />
      ) : (
        <p className="text-sm text-slate-500">
          Seul le staff sportif peut préparer la convocation.
        </p>
      )}
    </DashboardShell>
  );
}
