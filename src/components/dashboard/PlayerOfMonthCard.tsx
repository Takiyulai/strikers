import { Trophy } from "lucide-react";

import type { PlayerOfMonth } from "@/types";

/** Carte « joueur du mois » : score explicite, on comprend l'exploit réalisé. */
export function PlayerOfMonthCard({ player }: { player: PlayerOfMonth }) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600">
            <Trophy className="h-4 w-4" />
            Joueur du mois · {player.monthLabel}
          </p>
          <p className="mt-1 truncate text-2xl font-black text-club-navy-900">
            {player.fullName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {player.highlights.join(" · ")}
          </p>
        </div>
        <span className="shrink-0 text-right">
          <span className="block text-2xl font-black text-amber-600">
            {player.score}
          </span>
          <span className="block text-[11px] uppercase tracking-wide text-slate-400">
            points
          </span>
        </span>
      </div>
      <p className="mt-3 border-t border-amber-100 pt-2 text-xs text-slate-400">
        Score = présences ×2 + cotisations payées ×3 − semaines de retard ×2 +
        buts ×5 + passes décisives ×3 + clean sheets ×4
      </p>
    </section>
  );
}