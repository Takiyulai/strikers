"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClockAlert, Trash2 } from "lucide-react";

import {
  cancelLateMarking,
  markLate,
  settleLateFine,
} from "@/lib/actions/late";
import { cn } from "@/lib/cn";
import { LATE_AMOUNT } from "@/lib/constants";
import { formatFcfa } from "@/lib/format";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

interface PlayerOption {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  hasLate: boolean;
  lateId: string | null;
}

interface LateRow {
  id: string;
  week_id: string;
  player_id: string;
  amount: number;
  status: "EN_RETARD" | "PAYE";
  note: string | null;
  noted_at: string;
  cleared_at: string | null;
  player_name: string;
  player_jersey: number | null;
  noted_by_name: string | null;
  cleared_by_name: string | null;
}

interface Props {
  players: PlayerOption[];
  lateArrivals: LateRow[];
  canSettle: boolean;
  canMark: boolean;
}

const defaultNoteOptions = [
  "Plus de 15 min de retard",
  "Retard récurrent",
  "Absence prévenue tardivement",
];

export function LateArrivalsManager({
  players,
  lateArrivals,
  canSettle,
  canMark,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState(defaultNoteOptions[0]);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const playerMap = new Map(players.map((player) => [player.playerId, player]));

  const filtered = players.filter((player) =>
    player.fullName.toLowerCase().includes(filter.toLowerCase()),
  );

  const late = lateArrivals.filter((row) => row.status === "EN_RETARD");
  const paid = lateArrivals.filter((row) => row.status === "PAYE");

  const selected = selectedId ? playerMap.get(selectedId) ?? null : null;

  function handleMark(playerId: string) {
    if (!canMark) return;
    setError(null);
    startTransition(async () => {
      const result = await markLate(playerId, note);
      if (result.ok) {
        setSelectedId(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleCancel(weekId: string, playerId: string) {
    if (!canMark) return;
    setError(null);
    startTransition(async () => {
      const result = await cancelLateMarking(weekId, playerId);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  function handleSettle(weekId: string, playerId: string) {
    if (!canSettle) return;
    setError(null);
    startTransition(async () => {
      const result = await settleLateFine(weekId, playerId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {canMark ? (
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card">
          <h3 className="section-title">Marquer un joueur retardataire</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Sélectionnez un joueur, indiquez le motif. Une amende de{" "}
            <span className="font-semibold text-club-navy-900">
              {formatFcfa(LATE_AMOUNT)}
            </span>{" "}
            sera ajoutée à sa dette jusqu&apos;au règlement.
          </p>

          <Input
            label="Motif du retard"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : 20 minutes de retard"
            className="mt-3"
          />

          <div className="mt-2 flex flex-wrap gap-1.5">
            {defaultNoteOptions.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNote(preset)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  note === preset
                    ? "border-club-sky-500 bg-club-sky-50 text-club-sky-700"
                    : "border-slate-200 bg-white text-slate-500",
                )}
              >
                {preset}
              </button>
            ))}
          </div>

          <Input
            placeholder="Rechercher un joueur…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-3"
          />

          <div className="mt-2 max-h-64 space-y-1.5 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-1.5">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-400">
                Aucun joueur ne correspond.
              </p>
            ) : (
              filtered.map((player) => {
                const alreadyLate = player.hasLate;
                const isSelected = selectedId === player.playerId;
                return (
                  <button
                    key={player.playerId}
                    type="button"
                    onClick={() => setSelectedId(player.playerId)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-club-sky-100 text-club-sky-900"
                        : "bg-white text-club-navy-900 hover:bg-slate-50",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-club-navy-900 text-[11px] font-bold text-white">
                        {player.jerseyNumber ?? "–"}
                      </span>
                      <span className="truncate font-medium">
                        {player.fullName}
                      </span>
                    </span>
                    {alreadyLate ? (
                      <Badge tone="amber">Déjà marqué</Badge>
                    ) : isSelected ? (
                      <Badge tone="sky">Sélectionné</Badge>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {selected ? (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-club-sky-50 px-3 py-2">
              <p className="text-xs text-club-sky-900">
                Marquer{" "}
                <span className="font-bold">
                  {selected.jerseyNumber
                    ? `${selected.jerseyNumber}. `
                    : ""}
                  {selected.fullName}
                </span>{" "}
                comme retardataire ?
              </p>
              <Button size="sm" onClick={() => handleMark(selected.playerId)}>
                Confirmer ({formatFcfa(LATE_AMOUNT)})
              </Button>
            </div>
          ) : null}

          {error ? (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Retards en cours ({late.length})</h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Total dû : {formatFcfa(late.reduce((sum, row) => sum + row.amount, 0))}
          </span>
        </div>

        {late.length === 0 ? (
          <EmptyState
            title="Aucun retard cette semaine"
            description="Les joueurs marqués ici apparaîtront avec leur amende."
          />
        ) : (
          <ul className="mt-3 space-y-1.5">
            {late.map((row) => {
              return (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-club-navy-900">
                      <ClockAlert className="h-3.5 w-3.5 text-amber-600" />
                      {row.player_jersey ? `${row.player_jersey}. ` : ""}
                      {row.player_name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-600">
                      {row.note ?? "Retard"}{" "}
                      {row.noted_by_name
                        ? `· noté par ${row.noted_by_name}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      {formatFcfa(row.amount)}
                    </span>
                    {canSettle ? (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleSettle(row.week_id, row.player_id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Réglé
                      </Button>
                    ) : null}
                    {canMark ? (
                      <button
                        type="button"
                        aria-label="Annuler le marquage"
                        onClick={() =>
                          handleCancel(row.week_id, row.player_id)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {paid.length > 0 ? (
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card">
          <h3 className="section-title">Réglés cette semaine ({paid.length})</h3>
          <ul className="mt-3 space-y-1.5">
            {paid.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-club-green-200 bg-club-green-50/60 px-3 py-2"
              >
                <p className="flex items-center gap-1.5 text-sm font-medium text-club-navy-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-club-green-600" />
                  {row.player_jersey ? `${row.player_jersey}. ` : ""}
                  {row.player_name}
                </p>
                <span className="text-[11px] text-slate-500">
                  {row.cleared_by_name
                    ? `Remis par ${row.cleared_by_name}`
                    : "Remis"}
                  {" · "}
                  {formatFcfa(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}