import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import {
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate } from "@/lib/dates";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { EquipmentForm } from "@/components/sport/EquipmentForm";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";

import type { EquipmentStatus } from "@/types/database";

const STATUS_TONE: Record<
  EquipmentStatus,
  "green" | "amber" | "red" | "neutral"
> = {
  BON: "green",
  MOYEN: "amber",
  MAUVAIS: "red",
  HORS_SERVICE: "neutral",
};

export const metadata: Metadata = { title: "Matériel" };

export default async function MaterielPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const canManage = hasPermission(user.role, "equipment.manage");
  const supabase = createClient();

  const { data: equipment } = await supabase
    .from("equipment")
    .select("*")
    .order("name");

  const items = equipment ?? [];
  const toReplace = items.filter(
    (e) => e.status === "MAUVAIS" || e.status === "HORS_SERVICE",
  ).length;

  return (
    <DashboardShell
      title="Matériel"
      description="Inventaire des équipements de l'équipe."
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Références" value={items.length} tone="sky" />
        <StatCard
          label="Unités totales"
          value={items.reduce((sum, e) => sum + e.quantity, 0)}
          tone="green"
        />
        <StatCard
          label="À remplacer"
          value={toReplace}
          hint="État mauvais ou hors service"
          tone="red"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.length === 0 ? (
            <EmptyState
              title="Aucun matériel enregistré"
              description="Ajoutez ballons, maillots, chasubles, cônes ou filets."
            />
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-club-navy-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {EQUIPMENT_CATEGORY_LABELS[item.category]} ·{" "}
                    {item.quantity} unité(s) · ajouté le{" "}
                    {formatDate(item.added_date)}
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-xs text-slate-500">{item.notes}</p>
                  ) : null}
                </div>
                <Badge tone={STATUS_TONE[item.status]}>
                  {EQUIPMENT_STATUS_LABELS[item.status]}
                </Badge>
              </div>
            ))
          )}
        </div>

        {canManage ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="section-title mb-4">Ajouter du matériel</h3>
              <EquipmentForm />
            </div>
          </aside>
        ) : null}
      </div>
    </DashboardShell>
  );
}