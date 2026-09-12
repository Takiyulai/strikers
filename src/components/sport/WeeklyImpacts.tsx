"use client";

import { useState, useTransition } from "react";

import { setPlayerImpact } from "@/lib/actions/sport";
import { cn } from "@/lib/cn";
import { IMPACT_TYPES, IMPACT_TYPE_LABELS } from "@/lib/constants";

import type { ImpactType } from "@/types/database";

interface RosterRow {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
}

type ImpactMap = Record<string, Partial<Record<ImpactType, number>>>;

/**
 * Points hebdomadaires du staff : consigne les buts, passes décisives et
 * clean sheets de la semaine. Ces impacts alimentent le score du
 * « joueur du mois ».
 */
export function WeeklyImpacts({
  roster,
  initialImpacts,
}: {
  roster: RosterRow[];
  initialImpacts: ImpactMap;
}) {
  const [impacts, setImpacts] = useState<ImpactMap>(initialImpacts);
  const [, startTransition] = useTransition();

  function adjust(playerId: string, type: ImpactType, delta: number) {
    const current = impacts[playerId]?.[type] ?? 0;
    const next = Math.max(0, current + delta);
    setImpacts((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], [type]: next },
    }));
    startTransition(async () => {
      await setPlayerImpact(playerId, type, next);
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="section-title">Joueurs décisifs de la semaine</h3>
      <p className="mt-0.5 text-sm text-slate-500">
        Chaque semaine, le staff consigne les buts, passes décisives et clean
        sheets (gardiens). Ces impacts comptent pour le titre de joueur du
        mois.
      </p>

      <div className="mt-4 space-y-2">
        {roster.map((row) => (
          <div
            key={row.playerId}
            className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm font-semibold text-club-navy-900">
              {row.jerseyNumber ? `${row.jerseyNumber}. ` : ""}
              {row.fullName}
            </p>
            <div className="flex flex-wrap gap-2">
              {IMPACT_TYPES.map((type) => {
                const value = impacts[row.playerId]?.[type] ?? 0;
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-1.5 py-0.5",
                      value > 0
                        ? "border-club-green-300 bg-club-green-50"
                        : "border-slate-200 bg-white",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => adjust(row.playerId, type, -1)}
                      aria-label={`Retirer ${IMPACT_TYPE_LABELS[type]}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="min-w-[92px] text-center text-xs font-semibold text-club-navy-800">
                      {IMPACT_TYPE_LABELS[type]}
                      {value > 0 ? ` ${value}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjust(row.playerId, type, 1)}
                      aria-label={`Ajouter ${IMPACT_TYPE_LABELS[type]}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-club-green-600 text-white hover:bg-club-green-700"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}