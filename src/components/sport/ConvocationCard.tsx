"use client";

import { forwardRef } from "react";

import { formatDate } from "@/lib/dates";

import type { ConvocationRole } from "@/types/database";

interface Row {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
  role: ConvocationRole;
}

export const ConvocationCard = forwardRef<
  HTMLDivElement,
  {
    opponent: string;
    matchDate: string;
    matchTime: string | null;
    location: string | null;
    rows: Row[];
  }
>(function ConvocationCard(
  { opponent, matchDate, matchTime, location, rows },
  ref,
) {
  const titulaires = rows.filter((r) => r.role === "TITULAIRE");
  const remplacants = rows.filter((r) => r.role === "REMPLACANT");
  const absents = rows.filter((r) => r.role === "ABSENT");

  return (
    <div
      ref={ref}
      style={{ width: 720 }}
      className="bg-club-navy-950 p-8 font-sans text-white"
    >
      <div className="flex items-center justify-between border-b border-white/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-club-sky-500 text-xl font-black">
            S
          </div>
          <div>
            <p className="text-xl font-black uppercase tracking-wide">
              Striker FC
            </p>
            <p className="text-xs font-medium uppercase tracking-widest text-club-sky-300">
              Convocation officielle
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">Striker FC — {opponent}</p>
          <p className="text-sm text-white/70">
            {formatDate(matchDate)}
            {matchTime ? ` · ${matchTime}` : ""}
          </p>
          {location ? <p className="text-sm text-white/70">{location}</p> : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-club-green-400">
            Titulaires ({titulaires.length})
          </p>
          <ul className="space-y-1.5">
            {titulaires.map((r) => (
              <li
                key={r.playerId}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-club-green-600 text-[11px] font-bold">
                  {r.jerseyNumber ?? "–"}
                </span>
                {r.fullName}
              </li>
            ))}
            {titulaires.length === 0 ? (
              <li className="text-sm text-white/40">À définir</li>
            ) : null}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-club-sky-300">
            Remplaçants ({remplacants.length})
          </p>
          <ul className="space-y-1.5">
            {remplacants.map((r) => (
              <li
                key={r.playerId}
                className="flex items-center gap-2 text-sm text-white/90"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-club-sky-600 text-[11px] font-bold">
                  {r.jerseyNumber ?? "–"}
                </span>
                {r.fullName}
              </li>
            ))}
            {remplacants.length === 0 ? (
              <li className="text-sm text-white/40">À définir</li>
            ) : null}
          </ul>

          {absents.length > 0 ? (
            <>
              <p className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-amber-400">
                Absents ({absents.length})
              </p>
              <ul className="space-y-1 text-sm text-white/60">
                {absents.map((r) => (
                  <li key={r.playerId}>{r.fullName}</li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-8 border-t border-white/20 pt-3 text-center text-xs text-white/50">
        Présence obligatoire à l&apos;heure indiquée · Staff Striker FC
      </p>
    </div>
  );
});