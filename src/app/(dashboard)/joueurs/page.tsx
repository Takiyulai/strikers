import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import {
  PLAYER_ROLES_FILTER,
  POSITION_LABELS,
  PLAYER_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { ROLE_LABELS } from "@/types";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerRowActions } from "@/components/dashboard/PlayerRowActions";

import type { PlayerPosition, PlayerStatus, UserRole } from "@/types/database";

export const metadata: Metadata = { title: "Joueurs" };

export default async function JoueursPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const canManage = hasPermission(user.role, "team.manage");
  const supabase = createClient();

  const { data: players } = await supabase
    .from("v_players")
    .select("*")
    .not("role", "in", PLAYER_ROLES_FILTER)
    .order("full_name");

  return (
    <DashboardShell
      title="Joueurs"
      description="Effectif de Striker FC et informations sportives."
    >
      {!players || players.length === 0 ? (
        <EmptyState
          title="Aucun joueur inscrit"
          description="Les joueurs apparaîtront ici dès leur inscription."
        />
      ) : (
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-club-navy-900 text-sm font-bold text-white">
                  {player.jersey_number ?? "–"}
                </span>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-club-navy-900">
                    {player.full_name}
                    {player.role !== "JOUEUR" ? (
                      <Badge tone="navy">
                        {ROLE_LABELS[player.role as UserRole]}
                      </Badge>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {player.position
                      ? POSITION_LABELS[player.position as PlayerPosition]
                      : "Poste non défini"}{" "}
                    · Inscrit le {formatDate(player.registration_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  tone={
                    player.status === "ACTIF"
                      ? "green"
                      : player.status === "EN_ATTENTE"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {PLAYER_STATUS_LABELS[player.status as PlayerStatus]}
                </Badge>
                {canManage ? (
                  <PlayerRowActions
                    playerId={player.id}
                    fullName={player.full_name}
                    position={player.position as PlayerPosition | null}
                    jerseyNumber={player.jersey_number}
                    status={player.status as PlayerStatus}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}