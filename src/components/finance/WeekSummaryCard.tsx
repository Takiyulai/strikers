import { formatFcfa } from "@/lib/format";

import { StatCard } from "@/components/ui/StatCard";

import type { WeekSummary } from "@/types";

export function WeekSummaryCard({ summary }: { summary: WeekSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Ont payé"
        value={summary.paidCount}
        hint={`sur ${summary.totalActivePlayers} actifs`}
        tone="green"
      />
      <StatCard label="N'ont pas payé" value={summary.unpaidCount} tone="red" />
      <StatCard
        label="Montant collecté"
        value={formatFcfa(summary.collected)}
        tone="sky"
      />
      <StatCard
        label="Attendu"
        value={formatFcfa(summary.expected)}
        hint={`Reste ${formatFcfa(
          Math.max(summary.expected - summary.collected, 0),
        )}`}
        tone="amber"
      />
    </div>
  );
}