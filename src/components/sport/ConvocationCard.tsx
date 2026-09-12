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

function PlayerLine({
  jersey,
  name,
  chipClass,
}: {
  jersey: number | null;
  name: string;
  chipClass: string;
}) {
  return (
    <li className="flex items-center gap-2.5 border-b border-white/10 pb-1.5 text-[15px] text-white/90">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${chipClass}`}
      >
        {jersey ?? "–"}
      </span>
      <span className="font-medium">{name}</span>
    </li>
  );
}

/**
 * Format portrait 480 px : lisible sur téléphone et dans WhatsApp.
 */
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
  const titulaires = rows.filter((row) => row.role === "TITULAIRE");
  const remplacants = rows.filter((row) => row.role === "REMPLACANT");
  const absents = rows.filter((row) => row.role === "ABSENT");

  return (
    <div
      ref={ref}
      style={{ width: 480 }}
      className="bg-club-navy-950 p-6 font-sans text-white"
    >
      <div className="flex items-center gap-2.5 border-b border-white/15 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-club-sky-500 text-lg font-black">
          S
        </div>
        <div>
          <p className="text-lg font-black uppercase leading-tight tracking-wide">
            Striker FC
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-club-sky-300">
            Convocation officielle
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xl font-black leading-tight">
          Striker FC — {opponent}
        </p>
        <p className="mt-1 text-[13px] font-semibold text-club-sky-300">
          {formatDate(matchDate)}
          {matchTime ? ` · ${matchTime.slice(0, 5)}` : ""}
        </p>
        {location ? (
          <p className="text-[12px] text-white/60">{location}</p>
        ) : null}
      </div>

      <div className="mt-5">
        <p className="text-[12px] font-bold uppercase tracking-wide text-club-green-400">
          Titulaires ({titulaires.length})
        </p>
        <ul className="mt-2 space-y-1.5">
          {titulaires.length === 0 ? (
            <li className="text-[13px] text-white/40">À définir</li>
          ) : (
            titulaires.map((row) => (
              <PlayerLine
                key={row.playerId}
                jersey={row.jerseyNumber}
                name={row.fullName}
                chipClass="bg-club-green-600"
              />
            ))
          )}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-[12px] font-bold uppercase tracking-wide text-club-sky-300">
          Remplaçants ({remplacants.length})
        </p>
        <ul className="mt-2 space-y-1.5">
          {remplacants.length === 0 ? (
            <li className="text-[13px] text-white/40">À définir</li>
          ) : (
            remplacants.map((row) => (
              <PlayerLine
                key={row.playerId}
                jersey={row.jerseyNumber}
                name={row.fullName}
                chipClass="bg-club-sky-600"
              />
            ))
          )}
        </ul>
      </div>

      {absents.length > 0 ? (
        <div className="mt-4">
          <p className="text-[12px] font-bold uppercase tracking-wide text-amber-400">
            Absents ({absents.length})
          </p>
          <ul className="mt-2 space-y-1 text-[13px] text-white/60">
            {absents.map((row) => (
              <li key={row.playerId}>{row.fullName}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-6 border-t border-white/15 pt-2.5 text-center text-[10px] text-white/50">
        Présence obligatoire à l&apos;heure indiquée · Staff Striker FC
      </p>
    </div>
  );
});
