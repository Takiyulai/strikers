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
 * Bandeau de rappel de la prochaine séance, ancré dans le header sticky :
 * reste visible pendant le défilement, avec minuteur.
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
      <section className="h-10 border-b border-white/10 bg-club-navy-900 text-white">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-7">
          <p className="text-xs font-medium text-white/60">
            Prochaine séance : chargement…
          </p>
        </div>
      </section>
    );
  }

  const next = getNextTraining(new Date(now));
  const remaining = Math.max(next.date.getTime() - now, 0);

  return (
    <section className="h-10 border-b border-white/10 bg-club-navy-900 text-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-7">
        <p className="flex min-w-0 items-center gap-2 truncate text-xs font-medium text-white/65">
          <CalendarClock className="h-4 w-4 shrink-0 text-club-sky-300" />
          <span className="truncate">
            Prochaine séance :{" "}
            <span className="font-bold text-white">{next.dayLabel}</span> à{" "}
            <span className="font-bold text-white">{next.timeLabel}</span>
            {next.isToday ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-club-green-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-club-green-300">
                Aujourd&apos;hui
              </span>
            ) : null}
          </span>
        </p>
        <p
          className="shrink-0 font-mono text-xs font-bold tracking-wider text-club-sky-300"
          aria-label="Temps restant avant la séance"
        >
          {formatCountdown(remaining)}
        </p>
      </div>
    </section>
  );
}
