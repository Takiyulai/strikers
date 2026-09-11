import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { formatFcfa } from "@/lib/format";
import { formatDate } from "@/lib/dates";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { ExpenseForm } from "@/components/finance/ExpenseForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Dépenses" };

export default async function DepensesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const canManage = hasPermission(user.role, "finance.manage");
  const supabase = createClient();

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false })
    .limit(50);

  const total = (expenses ?? []).reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardShell
      title="Dépenses"
      description="Suivi des sorties de caisse de l'équipe."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title">Historique</h3>
            <Badge tone="navy">Total : {formatFcfa(total)}</Badge>
          </div>

          {!expenses || expenses.length === 0 ? (
            <EmptyState
              title="Aucune dépense enregistrée"
              description="Les dépenses apparaîtront ici dès qu'elles seront saisies."
            />
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-club-navy-900">
                    {expense.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {EXPENSE_CATEGORY_LABELS[expense.category]} ·{" "}
                    {formatDate(expense.expense_date)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-red-600">
                  −{formatFcfa(expense.amount)}
                </span>
              </div>
            ))
          )}
        </section>

        {canManage ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="section-title mb-4">Nouvelle dépense</h3>
              <ExpenseForm />
            </div>
          </aside>
        ) : null}
      </div>
    </DashboardShell>
  );
}