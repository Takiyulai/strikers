"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { deletePlayer, updatePlayer } from "@/lib/actions/sport";
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
  canDelete = false,
}: {
  playerId: string;
  fullName: string;
  position: PlayerPosition | null;
  jerseyNumber: number | null;
  status: PlayerStatus;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName,
    position: position ?? "",
    jerseyNumber: jerseyNumber?.toString() ?? "",
    status,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    const result = await updatePlayer({
      playerId,
      fullName: form.fullName,
      position: (form.position || null) as PlayerPosition | null,
      jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
      status: form.status,
    });
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Supprimer définitivement ${fullName} et son compte ? Cette action est irréversible.`,
      )
    )
      return;
    setLoading(true);
    setError(null);
    const result = await deletePlayer(playerId);
    setLoading(false);
    if (result.ok) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error);
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
          <Input
            label="Nom complet"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

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
            {PLAYER_STATUSES.map((statut) => (
              <option key={statut} value={statut}>
                {PLAYER_STATUS_LABELS[statut]}
              </option>
            ))}
          </Select>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {canDelete ? (
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={loading}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          ) : null}
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