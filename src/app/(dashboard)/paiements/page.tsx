import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatFcfa } from "@/lib/format";
import { formatDateTime } from "@/lib/dates";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

export const metadata: Metadata = { title: "Paiements" };

export default async function PaiementsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = createClient();

  const { data: ledger } = await supabase
    .from("v_financial_ledger")
    .select("*")
    .order("occurred_at", { ascending: false })
    .limit(100);

  const income = (ledger ?? []).filter((e) => e.entry_type === "INCOME");
  const totalIncome = income.reduce((sum, e) => sum + e.amount, 0);

  return (
    <DashboardShell
      title="Paiements"
      description="Journal des encaissements de l'équipe."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Entrées enregistrées" value={income.length} tone="sky" />
        <StatCard
          label="Total encaissé"
          value={formatFcfa(totalIncome)}
          tone="green"
        />
      </div>

      <div className="mt-6 space-y-3">
        {!ledger || ledger.length === 0 ? (
          <EmptyState
            title="Aucun mouvement enregistré"
            description="Les cotisations et dépenses apparaîtront ici."
          />
        ) : (
          ledger.map((entry) => (
            <div
              key={`${entry.entry_type}-${entry.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-club-navy-900">
                  {entry.label}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.source} · {formatDateTime(entry.occurred_at)}
                </p>
              </div>
              <span
                className={
                  entry.entry_type === "INCOME"
                    ? "shrink-0 text-sm font-bold text-club-green-600"
                    : "shrink-0 text-sm font-bold text-red-600"
                }
              >
                {entry.entry_type === "INCOME" ? "+" : "−"}
                {formatFcfa(entry.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}