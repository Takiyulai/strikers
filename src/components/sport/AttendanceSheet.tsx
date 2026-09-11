"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { saveAttendance } from "@/lib/actions/sport";
import { cn } from "@/lib/cn";

import { Button } from "@/components/ui/Button";

import type { PlayerWithProfile } from "@/types";

export function AttendanceSheet({
  sessionId,
  players,
  initialPresent,
}: {
  sessionId: string;
  players: PlayerWithProfile[];
  initialPresent: string[];
}) {
  const [present, setPresent] = useState<Set<string>>(
    new Set(initialPresent),
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(playerId: string) {
    setSaved(false);
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  async function handleSave() {
    setLoading(true);
    const result = await saveAttendance(sessionId, Array.from(present));
    setLoading(false);
    if (result.ok) setSaved(true);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {players.map((player) => {
          const isPresent = present.has(player.id);
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => toggle(player.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                isPresent
                  ? "border-club-green-200 bg-club-green-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  isPresent
                    ? "bg-club-green-600 text-white"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {isPresent ? <Check className="h-3.5 w-3.5" /> : null}
              </span>
              <span className="truncate text-sm font-medium text-club-navy-900">
                {player.full_name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={loading}>
          Enregistrer les présences
        </Button>
        {saved ? (
          <span className="text-sm font-medium text-club-green-600">
            Présences enregistrées ✓
          </span>
        ) : null}
      </div>
    </div>
  );
}
