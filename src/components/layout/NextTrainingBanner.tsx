"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { getNextTraining } from "@/lib/schedule";

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86_400);
  const hours = String(Math.floor((total % 86_400) / 3_600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3_600) / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return days > 0
    ? `${days}j ${hours}:${minutes}:${seconds}`
    : `${hours}:${minutes}:${seconds}`;
}

/**
 * Bannière globale affichée sous le header : prochaine séance calculée
 * d'après l'horaire fixe, avec minuteur. Version compacte.
 */
export function NextTrainingBanner() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <section className="border-b border-club-navy-800/50 bg-pitch-gradient text-white">
        <div className="mx-auto max-w-6xl px-3 py-1.5">
          <p className="text-xs font-medium text-white/70">
            Prochaine séance : chargement…
          </p>
        </div>
      </section>
    );
  }

  const next = getNextTraining(new Date(now));
  const remaining = Math.max(next.date.getTime() - now, 0);

  return (
    <section className="border-b border-club-navy-800/50 bg-pitch-gradient text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-3 py-1.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-1.5 text-xs font-medium">
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-club-sky-300" />
          <span>
            Prochaine séance :{" "}
            <span className="font-bold">{next.dayLabel}</span> à{" "}
            <span className="font-bold">{next.timeLabel}</span>
            {next.isToday ? (
              <span className="ml-1.5 rounded-full bg-club-green-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-club-green-300">
                Aujourd&apos;hui
              </span>
            ) : null}
          </span>
        </p>
        <p
          className="font-mono text-xs font-bold tracking-wider text-club-sky-300"
          aria-label="Temps restant avant la séance"
        >
          ⏳ {formatCountdown(remaining)}
        </p>
      </div>
    </section>
  );
}
