import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { getWeekInfo } from "@/lib/dates";
import {
  ensureWeek,
  fetchWeekSummary,
  fetchWeeklyRoster,
} from "@/lib/supabase/queries";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { WeeklyCollector } from "@/components/finance/WeeklyCollector";
import { WeekSummaryCard } from "@/components/finance/WeekSummaryCard";

export const metadata: Metadata = { title: "Cotisations hebdomadaires" };

export default async function CotisationsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const canManage = hasPermission(user.role, "finance.manage");
  const supabase = createClient();

  const info = getWeekInfo(new Date());
  const week = await ensureWeek(supabase, info);
  const [summary, roster] = await Promise.all([
    fetchWeekSummary(supabase, week),
    fetchWeeklyRoster(supabase, week.id),
  ]);

  return (
    <DashboardShell
      title="Cotisations hebdomadaires"
      description={`${week.label ?? "Semaine en cours"} · 100 FCFA par membre — tout le monde paie, sauf le Président d'honneur et le Coach`}
    >
      <div className="space-y-6">
        <WeekSummaryCard summary={summary} />
        <WeeklyCollector
          roster={roster}
          weekId={week.id}
          weekLabel={week.label ?? info.label}
          canManage={canManage}
        />
      </div>
    </DashboardShell>
  );
}