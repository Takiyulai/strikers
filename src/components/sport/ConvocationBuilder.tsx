"use client";

import { useMemo, useState, useTransition } from "react";
import { Download } from "lucide-react";

import { saveConvocation } from "@/lib/actions/sport";
import { cn } from "@/lib/cn";
import { downloadNodeAsPng } from "@/lib/png";

import { Button } from "@/components/ui/Button";
import { ConvocationCard } from "@/components/sport/ConvocationCard";

import type { ConvocationRole } from "@/types/database";
import type { PlayerWithProfile } from "@/types";

type Row = {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
  role: ConvocationRole;
};

const NEXT_ROLE: Record<ConvocationRole, ConvocationRole> = {
  NON_CONVOQUE: "TITULAIRE",
  TITULAIRE: "REMPLACANT",
  REMPLACANT: "ABSENT",
  ABSENT: "NON_CONVOQUE",
};

const ROLE_LABEL: Record<ConvocationRole, string> = {
  TITULAIRE: "Titulaire",
  REMPLACANT: "Remplaçant",
  ABSENT: "Absent",
  NON_CONVOQUE: "—",
};

const ROLE_CLASS: Record<ConvocationRole, string> = {
  TITULAIRE: "bg-club-green-600 text-white",
  REMPLACANT: "bg-club-sky-600 text-white",
  ABSENT: "bg-amber-500 text-white",
  NON_CONVOQUE: "bg-slate-100 text-slate-500",
};

export function ConvocationBuilder({
  matchId,
  opponent,
  matchDate,
  matchTime,
  location,
  players,
  initial,
}: {
  matchId: string;
  opponent: string;
  matchDate: string;
  matchTime: string | null;
  location: string | null;
  players: PlayerWithProfile[];
  initial: { player_id: string; role: ConvocationRole }[];
}) {
  const initialRoles = useMemo(() => {
    const map = new Map<string, ConvocationRole>();
    initial.forEach((entry) => map.set(entry.player_id, entry.role));
    return map;
  }, [initial]);

  const [rows, setRows] = useState<Row[]>(
    players.map((player) => ({
      playerId: player.id,
      fullName: player.full_name,
      jerseyNumber: player.jersey_number,
      role: initialRoles.get(player.id) ?? "NON_CONVOQUE",
    })),
  );
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cardNode, setCardNode] = useState<HTMLDivElement | null>(null);
  const [isPending, startTransition] = useTransition();

  function cycle(playerId: string) {
    setSaved(false);
    setRows((prev) =>
      prev.map((row) =>
        row.playerId === playerId ? { ...row, role: NEXT_ROLE[row.role] } : row,
      ),
    );
  }

  function handleSave() {
    const entries = rows
      .filter((row) => row.role !== "NON_CONVOQUE")
      .map((row) => ({ playerId: row.playerId, role: row.role }));

    startTransition(async () => {
      const result = await saveConvocation(matchId, entries);
      if (result.ok) setSaved(true);
    });
  }

  async function handleDownload() {
    if (!cardNode) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(
        cardNode,
        `convocation-striker-fc-${opponent
          .replace(/\s+/g, "-")
          .toLowerCase()}.png`,
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} loading={isPending}>
          Enregistrer la convocation
        </Button>
        <Button
          variant="secondary"
          onClick={handleDownload}
          loading={downloading}
        >
          <Download className="h-4 w-4" />
          Télécharger le visuel PNG
        </Button>
        {saved ? (
          <span className="self-center text-sm font-medium text-club-green-600">
            Convoqués enregistrés ✓
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <button
            key={row.playerId}
            type="button"
            onClick={() => cycle(row.playerId)}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left hover:bg-slate-50"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {row.jerseyNumber ?? "–"}
              </span>
              <span className="text-sm font-medium text-club-navy-900">
                {row.fullName}
              </span>
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                ROLE_CLASS[row.role],
              )}
            >
              {ROLE_LABEL[row.role]}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        Touchez un joueur pour changer son statut : Titulaire → Remplaçant →
        Absent → Non convoqué.
      </p>

      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <ConvocationCard
          ref={setCardNode}
          opponent={opponent}
          matchDate={matchDate}
          matchTime={matchTime}
          location={location}
          rows={rows.filter((r) => r.role !== "NON_CONVOQUE")}
        />
      </div>
    </div>
  );
}