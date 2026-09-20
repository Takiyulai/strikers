"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { LATE_AMOUNT } from "@/lib/constants";
import { getWeekInfo } from "@/lib/dates";
import { hasPermission } from "@/lib/permissions";
import { ensureWeek } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

/** L'Assistant TG peut marquer, le TG et la direction peuvent tout faire. */
async function requireAssistant() {
  const user = await getSessionUser();
  if (!user) throw new Error("Session expirée.");
  const allowed =
    hasPermission(user.role, "attendance.mark_late") ||
    hasPermission(user.role, "finance.manage");
  if (!allowed) {
    throw new Error(
      "Seul l'Assistant Trésorier, le TG ou la direction peut gérer les retards.",
    );
  }
  return user;
}

/** Marque un joueur comme retardataire sur la semaine en cours. */
export async function markLate(
  playerId: string,
  note: string,
): Promise<ActionResult> {
  try {
    const user = await requireAssistant();
    if (!note?.trim()) {
      throw new Error("Le motif du retard est obligatoire.");
    }
    const supabase = createClient();
    const week = await ensureWeek(supabase, getWeekInfo(new Date()));

    const { error } = await supabase.from("late_arrivals").upsert(
      {
        week_id: week.id,
        player_id: playerId,
        amount: LATE_AMOUNT,
        status: "EN_RETARD",
        note: note.trim(),
        noted_by: user.id,
      },
      { onConflict: "week_id,player_id" },
    );
    if (error) throw new Error(error.message);

    revalidatePath("/retards");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/** Annule un marquage de retard (faute de frappe). */
export async function cancelLateMarking(
  weekId: string,
  playerId: string,
): Promise<ActionResult> {
  try {
    await requireAssistant();
    const supabase = createClient();

    const { error } = await supabase
      .from("late_arrivals")
      .delete()
      .eq("week_id", weekId)
      .eq("player_id", playerId);

    if (error) throw new Error(error.message);

    revalidatePath("/retards");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}

/**
 * Le joueur a payé son amende : on la comptabilise comme une dépense
 * compensatoire (catégorie AUTRE) étiquetée « Amende retard » — la caisse
 * brute reste ce qu'elle est, mais le fait de créditer via une « sortie
 * nulle » n'a pas de sens : on s'appuie plutôt sur la vue
 * v_financial_ledger étendue, qui injecte les règlements d'amendes
 * comme revenus. Ici, on marque simplement le retard comme soldé ; la
 * modification de la vue côté SQL fait le reste.
 */
export async function settleLateFine(
  weekId: string,
  playerId: string,
): Promise<ActionResult> {
  try {
    const user = await requireAssistant();
    const supabase = createClient();

    const { data: late, error: fetchError } = await supabase
      .from("late_arrivals")
      .select("id, status")
      .eq("week_id", weekId)
      .eq("player_id", playerId)
      .maybeSingle();
    if (fetchError) throw new Error(fetchError.message);
    if (!late) throw new Error("Aucun retard trouvé pour ce joueur.");
    if (late.status === "PAYE") {
      return { ok: true };
    }

    const { error: updateError } = await supabase
      .from("late_arrivals")
      .update({
        status: "PAYE",
        cleared_by: user.id,
        cleared_at: new Date().toISOString(),
      })
      .eq("id", late.id);
    if (updateError) throw new Error(updateError.message);

    revalidatePath("/retards");
    revalidatePath("/dashboard");
    revalidatePath("/cotisations");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erreur." };
  }
}