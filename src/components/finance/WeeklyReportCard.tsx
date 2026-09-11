"use client";

import { forwardRef } from "react";

import { formatFcfa } from "@/lib/format";

import type { WeeklyRosterRow } from "@/types";

interface Props {
  weekLabel: string;
  paidCount: number;
  unpaidCount: number;
  collected: number;
  rows: WeeklyRosterRow[];
}

export const WeeklyReportCard = forwardRef<HTMLDivElement, Props>(
  function WeeklyReportCard(
    { weekLabel, paidCount, unpaidCount, collected, rows },
    ref,
  ) {
    const paid = rows.filter((r) => r.hasPaid);
    const unpaid = rows.filter((r) => !r.hasPaid);

    return (
      <div
        ref={ref}
        style={{ width: 720 }}
        className="bg-white p-8 font-sans text-club-navy-900"
      >
        <div className="flex items-center justify-between border-b-4 border-club-sky-600 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-club-navy-900 text-xl font-black text-white">
              S
            </div>
            <div>
              <p className="text-xl font-black uppercase tracking-wide">
                Striker FC
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-club-sky-700">
                Rapport de cotisations
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500">{weekLabel}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-club-green-50 p-4">
            <p className="text-xs font-semibold uppercase text-club-green-700">
              Ont payé
            </p>
            <p className="mt-1 text-2xl font-black text-club-green-800">
              {paidCount}
            </p>
          </div>
          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs font-semibold uppercase text-red-600">
              Non payeurs
            </p>
            <p className="mt-1 text-2xl font-black text-red-700">
              {unpaidCount}
            </p>
          </div>
          <div className="rounded-xl bg-club-sky-50 p-4">
            <p className="text-xs font-semibold uppercase text-club-sky-700">
              Montant collecté
            </p>
            <p className="mt-1 text-2xl font-black text-club-sky-800">
              {formatFcfa(collected)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-club-green-700">
              Payeurs ({paid.length})
            </p>
            <ul className="space-y-1 text-sm">
              {paid.length === 0 ? (
                <li className="text-slate-400">Aucun paiement.</li>
              ) : (
                paid.map((r) => (
                  <li key={r.playerId} className="flex justify-between">
                    <span>{r.fullName}</span>
                    <span className="font-semibold text-club-green-700">
                      100 FCFA
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-red-600">
              Non payeurs ({unpaid.length})
            </p>
            <ul className="space-y-1 text-sm">
              {unpaid.length === 0 ? (
                <li className="text-slate-400">Tout le monde a payé 🎉</li>
              ) : (
                unpaid.map((r) => (
                  <li key={r.playerId} className="flex justify-between">
                    <span>{r.fullName}</span>
                    <span className="font-semibold text-red-600">
                      {formatFcfa(r.debtFcfa)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-400">
          Généré par Striker FC · {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    );
  },
);
