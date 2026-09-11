"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";

import type {
  ConvocationRole,
  EquipmentCategory,
  EquipmentStatus,
  MatchType,
  PlayerPosition,
  PlayerStatus,
  UserRole,
} from "@/types/database";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireSport() {
  const user = await getSessionUser();
  if (!user) throw new Error("Session expirée.");
  if (!hasPermission(user.role, "sport.manage")) {
    throw new Error("Vous n'avez pas la permission d'effectuer cette action.");
  }
  return user;
}

async function requireTeam() {
  const user = await getSessionUser();
  if (!user) throw new Error("Session expirée.");
  if (!hasPermission(user.role, "team.manage")) {
    throw new Error("Vous n'avez pas la permission d'effectuer cette action.");
  }
  return user;
}

/* ------------------------------- Entraînements ---------------------------- */

export interface TrainingInput {
  title: string;
  sessionDate: string;
  startTime?: string;
  location?: string;
  notes?: string;
}

export async function createTraining(
  input: TrainingInput,
): Promise<ActionResult> {
  try {
    const user = await requireSport();
    if (!input.title.trim()) throw new Error("Le titre est obligatoire.");
    if (!input.sessionDate) throw new Error("La date est obligatoire.");

    const supabase = createClient();
    const { error } = await supabase.from("training_sessions").insert({
      title: input.title.trim(),
      session_date: input.sessionDate,
      start_time: input.startTime || null,
      location: input.location?.trim() || null,
      notes: input.notes?.trim() || null,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/entrainements");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export async function saveAttendance(
  sessionId: string,
  presentPlayerIds: string[],
): Promise<ActionResult> {
  try {
    await requireSport();
    const supabase = createClient();

    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id")
      .eq("status", "ACTIF");
    if (playersError) throw new Error(playersError.message);

    const presentSet = new Set(presentPlayerIds);
    const rows = (players ?? []).map((p) => ({
      session_id: sessionId,
      player_id: p.id,
      present: presentSet.has(p.id),
    }));

    if (rows.length > 0) {
      const { error } = await supabase
        .from("attendances")
        .upsert(rows, { onConflict: "session_id,player_id" });
      if (error) throw new Error(error.message);
    }

    revalidatePath("/entrainements");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/* --------------------------------- Matchs --------------------------------- */

export interface MatchInput {
  opponent: string;
  isHome: boolean;
  matchDate: string;
  matchTime?: string;
  location?: string;
  matchType: MatchType;
  notes?: string;
}

export async function createMatch(input: MatchInput): Promise<ActionResult> {
  try {
    const user = await requireSport();
    if (!input.opponent.trim())
      throw new Error("L'adversaire est obligatoire.");
    if (!input.matchDate) throw new Error("La date est obligatoire.");

    const supabase = createClient();
    const { error } = await supabase.from("matches").insert({
      opponent: input.opponent.trim(),
      is_home: input.isHome,
      match_date: input.matchDate,
      match_time: input.matchTime || null,
      location: input.location?.trim() || null,
      match_type: input.matchType,
      status: "A_VENIR",
      notes: input.notes?.trim() || null,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/matchs");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export async function saveConvocation(
  matchId: string,
  entries: { playerId: string; role: ConvocationRole }[],
): Promise<ActionResult> {
  try {
    await requireSport();
    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("match_convocations")
      .delete()
      .eq("match_id", matchId);
    if (deleteError) throw new Error(deleteError.message);

    if (entries.length > 0) {
      const { error } = await supabase.from("match_convocations").insert(
        entries.map((entry) => ({
          match_id: matchId,
          player_id: entry.playerId,
          role: entry.role,
        })),
      );
      if (error) throw new Error(error.message);
    }

    revalidatePath(`/matchs/${matchId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export async function updateMatchResult(
  matchId: string,
  ourScore: number,
  opponentScore: number,
): Promise<ActionResult> {
  try {
    await requireSport();
    const supabase = createClient();

    const { error } = await supabase
      .from("matches")
      .update({
        our_score: ourScore,
        opponent_score: opponentScore,
        status: "JOUE",
      })
      .eq("id", matchId);
    if (error) throw new Error(error.message);

    revalidatePath("/matchs");
    revalidatePath(`/matchs/${matchId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/* -------------------------------- Matériel -------------------------------- */

export interface EquipmentInput {
  name: string;
  category: EquipmentCategory;
  quantity: number;
  status: EquipmentStatus;
  notes?: string;
}

export async function createEquipment(
  input: EquipmentInput,
): Promise<ActionResult> {
  try {
    await requireTeam();
    if (!input.name.trim()) throw new Error("Le nom est obligatoire.");

    const supabase = createClient();
    const { error } = await supabase.from("equipment").insert({
      name: input.name.trim(),
      category: input.category,
      quantity: Math.max(0, Math.round(input.quantity)),
      status: input.status,
      notes: input.notes?.trim() || null,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/materiel");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus,
): Promise<ActionResult> {
  try {
    await requireTeam();
    const supabase = createClient();

    const { error } = await supabase
      .from("equipment")
      .update({ status })
      .eq("id", equipmentId);
    if (error) throw new Error(error.message);

    revalidatePath("/materiel");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/* ------------------------------- Joueurs ---------------------------------- */

export interface PlayerUpdateInput {
  playerId: string;
  position: PlayerPosition | null;
  jerseyNumber: number | null;
  status: PlayerStatus;
}

export async function updatePlayer(
  input: PlayerUpdateInput,
): Promise<ActionResult> {
  try {
    await requireTeam();
    const supabase = createClient();

    const { error } = await supabase
      .from("players")
      .update({
        position: input.position,
        jersey_number: input.jerseyNumber,
        status: input.status,
      })
      .eq("id", input.playerId);
    if (error) throw new Error(error.message);

    revalidatePath("/joueurs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export async function updateProfileRole(
  profileId: string,
  role: UserRole,
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("Session expirée.");
    if (!hasPermission(user.role, "roles.manage")) {
      throw new Error("Seul le Président peut attribuer les rôles.");
    }
    if (profileId === user.id) {
      throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", profileId);
    if (error) throw new Error(error.message);

    revalidatePath("/joueurs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}