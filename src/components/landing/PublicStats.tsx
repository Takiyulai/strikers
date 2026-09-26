import { CalendarClock, Target, TrendingUp, Users } from "lucide-react";

import { formatDate } from "@/lib/dates";
import type { PublicStats as Stats } from "@/types";

export function PublicStats({ stats }: { stats: Stats }) {
  const items = [
    { icon: Users, label: "Joueurs actifs", value: String(stats.activePlayers), hint: "Un effectif uni", tone: "text-club-sky-300 bg-club-sky-400/10" },
    {
      icon: CalendarClock,
      label: "Prochaine séance",
      value: stats.nextTraining?.dayLabel ?? "À venir",
      hint: stats.nextTraining
        ? `${stats.nextTraining.timeLabel}${stats.nextTraining.isToday ? " · aujourd'hui" : ` · dans ${stats.nextTraining.daysAway} jour${stats.nextTraining.daysAway > 1 ? "s" : ""}`}`
        : "Calendrier en préparation",
      tone: "text-club-green-300 bg-club-green-400/10",
    },
    { icon: Target, label: "Prochain match", value: stats.nextMatch?.opponent ?? "À planifier", hint: stats.nextMatch ? formatDate(stats.nextMatch.match_date) : "La prochaine affiche arrive", tone: "text-amber-300 bg-amber-400/10" },
    {
      icon: TrendingUp,
      label: stats.playerOfMonth ? `Joueur du mois · ${stats.playerOfMonth.monthLabel}` : "Joueur du mois",
      value: stats.playerOfMonth?.fullName ?? "À révéler",
      hint: stats.playerOfMonth?.highlights.length ? stats.playerOfMonth.highlights.join(" · ") : "Chaque effort compte",
      tone: "text-violet-300 bg-violet-400/10",
    },
  ];

  return (
    <section id="club" className="relative z-10 -mt-20 px-4 sm:px-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-club-navy-900/95 shadow-2xl shadow-club-navy-950/30 backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={item.label} className="relative flex min-h-44 flex-col justify-between p-6 sm:p-7 lg:border-r lg:border-white/[0.08] lg:last:border-r-0">
            {index < items.length - 1 ? <div className="absolute bottom-0 left-6 right-6 h-px bg-white/[0.08] sm:hidden" /> : null}
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <div className="mt-7">
              <p className="truncate text-xl font-black tracking-tight text-white sm:text-2xl">{item.value}</p>
              <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">{item.label}</p>
              <p className="mt-1 text-xs text-white/35">{item.hint}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
