"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { updatePlayer } from "@/lib/actions/sport";
import {
  PLAYER_POSITIONS,
  PLAYER_STATUSES,
  PLAYER_STATUS_LABELS,
  POSITION_LABELS,
} from "@/lib/constants";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { PlayerPosition, PlayerStatus } from "@/types/database";

export function PlayerRowActions({
  playerId,
  fullName,
  position,
  jerseyNumber,
  status,
}: {
  playerId: string;
  fullName: string;
  position: PlayerPosition | null;
  jerseyNumber: number | null;
  status: PlayerStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    position: position ?? "",
    jerseyNumber: jerseyNumber?.toString() ?? "",
    status,
  });
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const result = await updatePlayer({
      playerId,
      position: (form.position || null) as PlayerPosition | null,
      jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
      status: form.status,
    });
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        Modifier
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-club-navy-950/50"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-base font-bold text-club-navy-900">
          Modifier {fullName}
        </h3>
        <div className="space-y-4">
          <Select
            label="Poste"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
          >
            <option value="">Non défini</option>
            {PLAYER_POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {POSITION_LABELS[pos]}
              </option>
            ))}
          </Select>

          <Input
            label="Numéro de maillot"
            type="number"
            min={0}
            max={99}
            value={form.jerseyNumber}
            onChange={(e) =>
              setForm({ ...form, jerseyNumber: e.target.value })
            }
          />

          <Select
            label="Statut"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as PlayerStatus })
            }
          >
            {PLAYER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {PLAYER_STATUS_LABELS[st]}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} loading={loading}>
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}