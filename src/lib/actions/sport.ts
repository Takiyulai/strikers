"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { getWeekInfo } from "@/lib/dates";
import { hasPermission } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureWeek } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

import type {
  ConvocationRole,
  EquipmentCategory,
  EquipmentStatus,
  ImpactType,
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
  fullName?: string;
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

    const { data: player } = await supabase
      .from("players")
      .select("profile_id")
      .eq("id", input.playerId)
      .maybeSingle();
    if (!player) throw new Error("Joueur introuvable.");

    const { error } = await supabase
      .from("players")
      .update({
        position: input.position,
        jersey_number: input.jerseyNumber,
        status: input.status,
      })
      .eq("id", input.playerId);
    if (error) throw new Error(error.message);

    if (input.fullName?.trim()) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: input.fullName.trim() })
        .eq("id", player.profile_id);
      if (profileError) throw new Error(profileError.message);
    }

    revalidatePath("/joueurs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

export interface PlayerCreateInput {
  fullName: string;
  email: string;
  phone?: string;
  position?: PlayerPosition | null;
  jerseyNumber?: number | null;
  status?: PlayerStatus;
}

export type PlayerCreateResult =
  | { ok: true; tempPassword: string; email: string }
  | { ok: false; error: string };

/**
 * Crée un joueur ET son compte (Président / direction). Le joueur n'a pas
 * besoin de s'inscrire lui-même : un mot de passe temporaire est généré et
 * affiché une seule fois, à communiquer au joueur.
 */
export async function createPlayer(
  input: PlayerCreateInput,
): Promise<PlayerCreateResult> {
  try {
    await requireTeam();
    if (!input.fullName.trim()) throw new Error("Le nom est obligatoire.");
    if (!input.email.trim()) throw new Error("L'e-mail est obligatoire.");

    const tempPassword = `SFC-${Math.random()
      .toString(36)
      .slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;

    const admin = createAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser(
      {
        email: input.email.trim(),
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: input.fullName.trim(),
          phone: input.phone?.trim() || null,
        },
      },
    );
    if (createError) throw new Error(createError.message);
    if (!created.user) throw new Error("Compte créé mais introuvable.");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("players")
      .update({
        position: input.position ?? null,
        jersey_number: input.jerseyNumber ?? null,
        status: input.status ?? "ACTIF",
      })
      .eq("profile_id", created.user.id);
    if (updateError) throw new Error(updateError.message);

    revalidatePath("/joueurs");
    return { ok: true, tempPassword, email: input.email.trim() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/** Supprime définitivement un joueur et son compte (Président / direction). */
export async function deletePlayer(playerId: string): Promise<ActionResult> {
  try {
    const user = await requireTeam();
    const supabase = createClient();

    const { data: player } = await supabase
      .from("players")
      .select("profile_id")
      .eq("id", playerId)
      .maybeSingle();
    if (!player) throw new Error("Joueur introuvable.");
    if (player.profile_id === user.id) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
    }

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(player.profile_id);
    if (error) throw new Error(error.message);

    revalidatePath("/joueurs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/**
 * Consigne les actions décisives de la semaine (Coach / staff sportif) :
 * but, passe décisive, clean sheet pour les gardiens. Quantity à 0 supprime.
 */
export async function setPlayerImpact(
  playerId: string,
  impactType: ImpactType,
  quantity: number,
): Promise<ActionResult> {
  try {
    const user = await requireSport();
    const supabase = createClient();

    const week = await ensureWeek(supabase, getWeekInfo(new Date()));

    if (quantity <= 0) {
      const { error } = await supabase
        .from("player_impacts")
        .delete()
        .eq("week_id", week.id)
        .eq("player_id", playerId)
        .eq("impact_type", impactType);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("player_impacts").upsert(
        {
          week_id: week.id,
          player_id: playerId,
          impact_type: impactType,
          quantity,
          recorded_by: user.id,
        },
        { onConflict: "week_id,player_id,impact_type" },
      );
      if (error) throw new Error(error.message);
    }

    revalidatePath("/dashboard");
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