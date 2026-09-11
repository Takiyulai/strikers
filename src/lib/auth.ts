import { createClient } from "@/lib/supabase/server";

import type { UserRole } from "@/types/database";
import type { SessionUser } from "@/types";

/**
 * Charge l'utilisateur connecté avec son profil et sa fiche joueur.
 * Renvoie null si aucun utilisateur ou si le profil est inactif.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) return null;

  const { data: player } = await supabase
    .from("players")
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: profile.email ?? user.email ?? "",
    fullName: profile.full_name ?? "",
    role: profile.role as UserRole,
    playerId: player?.id ?? null,
  };
}

/** Exige une session active, sinon lève une erreur. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}