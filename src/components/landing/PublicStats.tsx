import { CalendarClock, Target, TrendingUp, Users } from "lucide-react";

import { formatDate } from "@/lib/dates";

import type { PublicStats as Stats } from "@/types";

export function PublicStats({ stats }: { stats: Stats }) {
  const items = [
    {
      icon: Users,
      label: "Joueurs actifs",
      value: String(stats.activePlayers),
      hint: "L'effectif du moment",
    },
    {
      icon: CalendarClock,
      label: "Prochaine séance",
      value: stats.nextTraining?.dayLabel ?? "À venir",
      hint: stats.nextTraining
        ? `${stats.nextTraining.timeLabel}${
            stats.nextTraining.isToday
              ? " · aujourd'hui"
              : ` · dans ${stats.nextTraining.daysAway} jour${
                  stats.nextTraining.daysAway > 1 ? "s" : ""
                }`
          }`
        : undefined,
    },
    {
      icon: Target,
      label: "Prochain match",
      value: stats.nextMatch ? stats.nextMatch.opponent : "À planifier",
      hint: stats.nextMatch
        ? formatDate(stats.nextMatch.match_date)
        : undefined,
    },
    {
      icon: TrendingUp,
      label: stats.playerOfMonth
        ? `Joueur du mois · ${stats.playerOfMonth.monthLabel}`
        : "Joueur du mois",
      value: stats.playerOfMonth?.fullName ?? "—",
      hint: stats.playerOfMonth?.highlights.length
        ? stats.playerOfMonth.highlights.join(" · ")
        : "Présence, cotisation et impacts : chaque semaine compte.",
    },
  ];

  return (
    <section className="bg-club-navy-900 py-12 sm:py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-10 px-4 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center text-center"
          >
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-club-sky-500/15 text-club-sky-300">
              <item.icon className="h-5 w-5" />
            </span>
            <p className="text-xl font-black text-white sm:text-2xl">
              {item.value}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-club-sky-300">
              {item.label}
            </p>
            {item.hint ? (
              <p className="mt-1 text-xs text-white/45">{item.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
