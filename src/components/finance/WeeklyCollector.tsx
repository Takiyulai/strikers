"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Search } from "lucide-react";

import {
  recordWeeklyPayment,
  removeWeeklyPayment,
} from "@/lib/actions/finances";
import { cn } from "@/lib/cn";
import { formatFcfa } from "@/lib/format";
import { POSITION_LABELS } from "@/lib/constants";

import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { WeeklyReportButton } from "@/components/finance/WeeklyReportButton";

import type { WeeklyRosterRow } from "@/types";
import type { PlayerPosition } from "@/types/database";

export function WeeklyCollector({
  roster,
  weekId,
  weekLabel,
  canManage,
}: {
  roster: WeeklyRosterRow[];
  weekId: string;
  weekLabel: string;
  canManage: boolean;
}) {
  const [rows, setRows] = useState(roster);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        String(r.jerseyNumber ?? "").includes(q),
    );
  }, [rows, query]);

  const paidCount = rows.filter((r) => r.hasPaid).length;
  const unpaidCount = rows.length - paidCount;

  function toggle(row: WeeklyRosterRow) {
    if (!canManage) return;
    setError(null);
    setPendingId(row.playerId);

    const next = !row.hasPaid;
    setRows((prev) =>
      prev.map((r) =>
        r.playerId === row.playerId ? { ...r, hasPaid: next } : r,
      ),
    );

    startTransition(async () => {
      const result = next
        ? await recordWeeklyPayment(row.playerId)
        : await removeWeeklyPayment(weekId, row.playerId);

      if (!result.ok) {
        setError(result.error);
        setRows((prev) =>
          prev.map((r) =>
            r.playerId === row.playerId ? { ...r, hasPaid: !next } : r,
          ),
        );
      }
      setPendingId(null);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="section-title">Saisie de la semaine</h3>
          <p className="text-sm text-slate-500">
            Cochez uniquement les joueurs ayant payé. Les autres sont
            automatiquement considérés comme non payeurs.
          </p>
        </div>
        <WeeklyReportButton
          weekLabel={weekLabel}
          rows={rows}
          paidCount={paidCount}
          unpaidCount={unpaidCount}
        />
      </div>

      <div className="p-5">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un joueur ou un numéro…"
            className="pl-9"
          />
        </div>

        {error ? (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Aucun joueur ne correspond à la recherche.
            </p>
          ) : (
            filtered.map((row) => (
              <button
                key={row.playerId}
                type="button"
                disabled={!canManage || pendingId === row.playerId}
                onClick={() => toggle(row)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                  row.hasPaid
                    ? "border-club-green-200 bg-club-green-50"
                    : "border-slate-200 bg-white hover:bg-slate-50",
                  !canManage && "cursor-default opacity-90",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    row.hasPaid
                      ? "bg-club-green-600 text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {row.hasPaid ? <Check className="h-4 w-4" /> : row.jerseyNumber ?? "–"}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-club-navy-900">
                    {row.fullName}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {row.position
                      ? POSITION_LABELS[row.position as PlayerPosition]
                      : "Poste non défini"}
                  </span>
                </span>

                <span className="flex flex-col items-end gap-1">
                  <Badge tone={row.hasPaid ? "green" : "neutral"}>
                    {row.hasPaid ? "Payé" : "Non payé"}
                  </Badge>
                  {row.hasPaid && row.paidRecordedBy ? (
                    <span className="text-[11px] text-slate-400">
                      Par {row.paidRecordedBy}
                    </span>
                  ) : null}
                  {row.debtFcfa > 0 ? (
                    <span className="text-[11px] font-medium text-red-600">
                      Dette : {formatFcfa(row.debtFcfa)}
                    </span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}