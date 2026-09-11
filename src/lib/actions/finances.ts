"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WEEKLY_AMOUNT } from "@/lib/constants";
import { getWeekInfo } from "@/lib/dates";
import { ensureWeek } from "@/lib/supabase/queries";

import type { ExpenseCategory } from "@/types/database";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireFinance() {
  const user = await getSessionUser();
  if (!user) throw new Error("Session expirée.");
  const { hasPermission } = await import("@/lib/permissions");
  if (!hasPermission(user.role, "finance.manage")) {
    throw new Error("Vous n'avez pas la permission d'effectuer cette action.");
  }
  return user;
}

/** Enregistre le paiement hebdomadaire d'un joueur (100 FCFA). */
export async function recordWeeklyPayment(
  playerId: string,
  weekDateISO?: string,
): Promise<ActionResult> {
  try {
    const user = await requireFinance();
    const supabase = createClient();

    const date = weekDateISO ? new Date(weekDateISO) : new Date();
    const info = getWeekInfo(date);
    const week = await ensureWeek(supabase, info);

    const { error } = await supabase.from("weekly_payments").upsert(
      {
        week_id: week.id,
        player_id: playerId,
        amount: WEEKLY_AMOUNT,
        paid_at: new Date().toISOString(),
        recorded_by: user.id,
      },
      { onConflict: "week_id,player_id" },
    );

    if (error) throw new Error(error.message);

    revalidatePath("/cotisations");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

/** Annule un paiement hebdomadaire enregistré par erreur. */
export async function removeWeeklyPayment(
  weekId: string,
  playerId: string,
): Promise<ActionResult> {
  try {
    await requireFinance();
    const supabase = createClient();

    const { error } = await supabase
      .from("weekly_payments")
      .delete()
      .eq("week_id", weekId)
      .eq("player_id", playerId);

    if (error) throw new Error(error.message);

    revalidatePath("/cotisations");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export interface ExpenseInput {
  title: string;
  motif?: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
}

/** Enregistre une dépense. */
export async function createExpense(input: ExpenseInput): Promise<ActionResult> {
  try {
    const user = await requireFinance();

    if (!input.title.trim()) throw new Error("Le titre est obligatoire.");
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Le montant doit être supérieur à zéro.");
    }

    const supabase = createClient();
    const { error } = await supabase.from("expenses").insert({
      title: input.title.trim(),
      motif: input.motif?.trim() || null,
      amount: Math.round(input.amount),
      category: input.category,
      expense_date: input.expenseDate,
      recorded_by: user.id,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/depenses");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export interface SpecialContributionInput {
  title: string;
  motif?: string;
  amount: number;
  dueDate?: string;
}

/** Crée une cotisation exceptionnelle (Président / Vice-président). */
export async function createSpecialContribution(
  input: SpecialContributionInput,
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) throw new Error("Session expirée.");

    const { hasPermission } = await import("@/lib/permissions");
    if (!hasPermission(user.role, "contribution.create")) {
      throw new Error("Seul le Président peut créer une cotisation.");
    }

    if (!input.title.trim()) throw new Error("Le titre est obligatoire.");
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error("Le montant doit être supérieur à zéro.");
    }

    const supabase = createClient();
    const { error } = await supabase.from("special_contributions").insert({
      title: input.title.trim(),
      motif: input.motif?.trim() || null,
      amount: Math.round(input.amount),
      due_date: input.dueDate || null,
      status: "ACTIVE",
      created_by: user.id,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/cotisations");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

/** Enregistre le paiement d'une cotisation exceptionnelle. */
export async function recordSpecialPayment(
  contributionId: string,
  playerId: string,
  amount: number,
): Promise<ActionResult> {
  try {
    const user = await requireFinance();
    const supabase = createClient();

    const { error } = await supabase
      .from("special_contribution_payments")
      .upsert(
        {
          contribution_id: contributionId,
          player_id: playerId,
          amount: Math.round(amount),
          paid_at: new Date().toISOString(),
          recorded_by: user.id,
        },
        { onConflict: "contribution_id,player_id" },
      );

    if (error) throw new Error(error.message);

    revalidatePath("/cotisations");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}