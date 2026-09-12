"use client";

import { forwardRef } from "react";

import { formatDate } from "@/lib/dates";
import { formatFcfa } from "@/lib/format";

interface Props {
  title: string;
  motif?: string | null;
  amount: number;
  dueDate?: string | null;
  collected: number;
  expectedTotal: number;
  paidNames: string[];
  unpaidNames: string[];
}

/**
 * Format portrait 480 px : lisible sur téléphone et dans WhatsApp.
 */
export const SpecialReportCard = forwardRef<HTMLDivElement, Props>(
  function SpecialReportCard(
    {
      title,
      motif,
      amount,
      dueDate,
      collected,
      expectedTotal,
      paidNames,
      unpaidNames,
    },
    ref,
  ) {
    return (
      <div
        ref={ref}
        style={{ width: 480 }}
        className="bg-white p-6 font-sans text-club-navy-900"
      >
        <div className="flex items-center justify-between border-b-4 border-club-green-600 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-club-navy-900 text-lg font-black text-white">
              S
            </div>
            <div>
              <p className="text-lg font-black uppercase leading-tight tracking-wide">
                Striker FC
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-club-green-700">
                Cotisation exceptionnelle
              </p>
            </div>
          </div>
          {dueDate ? (
            <p className="max-w-[160px] text-right text-[11px] font-bold text-slate-500">
              Échéance : {formatDate(dueDate)}
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <p className="text-xl font-black leading-tight">{title}</p>
          {motif ? (
            <p className="mt-1 text-[13px] leading-snug text-slate-600">
              {motif}
            </p>
          ) : null}
          <p className="mt-1 text-[12px] font-semibold text-slate-500">
            {formatFcfa(amount)} par membre
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between rounded-xl bg-club-green-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-club-green-700">
              Collecté
            </p>
            <p className="text-xl font-black text-club-green-800">
              {formatFcfa(collected)}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-club-sky-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-club-sky-700">
              Attendu
            </p>
            <p className="text-xl font-black text-club-sky-800">
              {formatFcfa(expectedTotal)}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
              Payeurs
            </p>
            <p className="text-xl font-black text-club-navy-900">
              {paidNames.length}/{paidNames.length + unpaidNames.length}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[12px] font-bold uppercase text-club-green-700">
            Ont payé ({paidNames.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {paidNames.length === 0 ? (
              <li className="text-[13px] text-slate-400">Aucun paiement.</li>
            ) : (
              paidNames.map((name) => (
                <li
                  key={name}
                  className="border-b border-slate-100 pb-1 text-[14px] font-medium"
                >
                  {name}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-4">
          <p className="text-[12px] font-bold uppercase text-red-600">
            Non payeurs ({unpaidNames.length})
          </p>
          <ul className="mt-2 space-y-1.5">
            {unpaidNames.length === 0 ? (
              <li className="text-[13px] text-slate-400">
                Tout le monde a payé 🎉
              </li>
            ) : (
              unpaidNames.map((name) => (
                <li
                  key={name}
                  className="border-b border-slate-100 pb-1 text-[14px] font-medium"
                >
                  {name}
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
