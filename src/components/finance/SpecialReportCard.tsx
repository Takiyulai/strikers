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

/** Visuel récapitulatif d'une cotisation exceptionnelle (export PNG). */
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
        style={{ width: 720 }}
        className="bg-white p-8 font-sans text-club-navy-900"
      >
        <div className="flex items-center justify-between border-b-4 border-club-green-600 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-club-navy-900 text-xl font-black text-white">
              S
            </div>
            <div>
              <p className="text-xl font-black uppercase tracking-wide">
                Striker FC
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-club-green-700">
                Cotisation exceptionnelle
              </p>
            </div>
          </div>
          {dueDate ? (
            <p className="text-sm font-semibold text-slate-500">
              Échéance : {formatDate(dueDate)}
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="text-2xl font-black">{title}</p>
          {motif ? <p className="mt-1 text-sm text-slate-600">{motif}</p> : null}
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {formatFcfa(amount)} par membre
          </p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-club-green-50 p-4">
            <p className="text-xs font-semibold uppercase text-club-green-700">
              Collecté
            </p>
            <p className="mt-1 text-2xl font-black text-club-green-800">
              {formatFcfa(collected)}
            </p>
          </div>
          <div className="rounded-xl bg-club-sky-50 p-4">
            <p className="text-xs font-semibold uppercase text-club-sky-700">
              Attendu
            </p>
            <p className="mt-1 text-2xl font-black text-club-sky-800">
              {formatFcfa(expectedTotal)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase text-slate-600">
              Payeurs
            </p>
            <p className="mt-1 text-2xl font-black text-club-navy-900">
              {paidNames.length}/{paidNames.length + unpaidNames.length}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-club-green-700">
              Ont payé ({paidNames.length})
            </p>
            <ul className="space-y-1 text-sm">
              {paidNames.length === 0 ? (
                <li className="text-slate-400">Aucun paiement.</li>
              ) : (
                paidNames.map((name) => <li key={name}>{name}</li>)
              )}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-red-600">
              Non payeurs ({unpaidNames.length})
            </p>
            <ul className="space-y-1 text-sm">
              {unpaidNames.length === 0 ? (
                <li className="text-slate-400">Tout le monde a payé 🎉</li>
              ) : (
                unpaidNames.map((name) => <li key={name}>{name}</li>)
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
