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

/**
 * Format portrait 480 px : quand l'image est affichée à la largeur d'un
 * téléphone (ou dans WhatsApp), le texte reste grand et net.
 */
export const WeeklyReportCard = forwardRef<HTMLDivElement, Props>(
  function WeeklyReportCard(
    { weekLabel, paidCount, unpaidCount, collected, rows },
    ref,
  ) {
    const paid = rows.filter((row) => row.hasPaid);
    const unpaid = rows.filter((row) => !row.hasPaid);

    return (
      <div
        ref={ref}
        style={{ width: 480 }}
        className="bg-white p-6 font-sans text-club-navy-900"
      >
        <div className="flex items-center justify-between border-b-4 border-club-sky-600 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-club-navy-900 text-lg font-black text-white">
              S
            </div>
            <div>
              <p className="text-lg font-black uppercase leading-tight tracking-wide">
                Striker FC
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-club-sky-700">
                Cotisations hebdomadaires
              </p>
            </div>
          </div>
          <p className="max-w-[160px] text-right text-[11px] font-bold text-slate-500">
            {weekLabel}
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-club-green-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-club-green-700">
              Ont payé
            </p>
            <p className="text-xl font-black text-club-green-800">
              {paidCount}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
              Non payeurs
            </p>
            <p className="text-xl font-black text-red-700">{unpaidCount}</p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-club-sky-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-club-sky-700">
              Montant collecté
            </p>
            <p className="text-xl font-black text-club-sky-800">
              {formatFcfa(collected)}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[12px] font-bold uppercase text-club-green-700">
            Payeurs ({paid.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {paid.length === 0 ? (
              <li className="text-[13px] text-slate-400">Aucun paiement.</li>
            ) : (
              paid.map((row) => (
                <li
                  key={row.playerId}
                  className="flex items-center justify-between border-b border-slate-100 pb-1 text-[14px]"
                >
                  <span className="font-medium">{row.fullName}</span>
                  <span className="font-bold text-club-green-700">
                    100 FCFA
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-bold uppercase text-red-600">
            Non payeurs ({unpaid.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {unpaid.length === 0 ? (
              <li className="text-[13px] text-slate-400">
                Tout le monde a payé 🎉
              </li>
            ) : (
              unpaid.map((row) => (
                <li
                  key={row.playerId}
                  className="flex items-center justify-between border-b border-slate-100 pb-1 text-[14px]"
                >
                  <span className="font-medium">{row.fullName}</span>
                  <span className="font-bold text-red-600">
                    {formatFcfa(row.debtFcfa)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <p className="mt-6 border-t border-slate-200 pt-2.5 text-center text-[10px] text-slate-400">
          Généré par Striker FC · {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    );
  },
);
