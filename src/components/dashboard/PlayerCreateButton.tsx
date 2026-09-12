"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createPlayer } from "@/lib/actions/sport";
import {
  PLAYER_POSITIONS,
  POSITION_LABELS,
} from "@/lib/constants";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { PlayerPosition } from "@/types/database";

/**
 * Création d'un joueur par la direction : le compte est généré avec un mot
 * de passe temporaire affiché une seule fois — le joueur n'a pas besoin de
 * s'inscrire lui-même.
 */
export function PlayerCreateButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    jerseyNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createPlayer({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      position: (form.position || null) as PlayerPosition | null,
      jerseyNumber: form.jerseyNumber ? Number(form.jerseyNumber) : null,
    });
    setLoading(false);
    if (result.ok) {
      setCredentials({ email: result.email, tempPassword: result.tempPassword });
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  function handleClose() {
    setOpen(false);
    setCredentials(null);
    setError(null);
    setForm({ fullName: "", email: "", phone: "", position: "", jerseyNumber: "" });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <UserPlus className="h-4 w-4" />
        Ajouter un joueur
      </Button>

      {/* Modale rendue via un portail : elle est passée dans le header du
          shell (backdrop-blur), qui confine sinon ses descendants `fixed`. */}
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-club-navy-950/50"
            onClick={handleClose}
            aria-hidden
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            {credentials ? (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-club-navy-900">
                  Joueur créé ✓
                </h3>
                <p className="text-sm text-slate-600">
                  Communiquez ces identifiants au joueur. Il pourra choisir un
                  nouveau mot de passe via « Mot de passe oublié ? » sur la page
                  de connexion.
                </p>
                <div className="rounded-xl bg-club-green-50 p-4 text-sm">
                  <p>
                    <span className="font-semibold">E-mail :</span>{" "}
                    {credentials.email}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Mot de passe temporaire :
                    </span>{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 font-mono font-bold text-club-navy-900">
                      {credentials.tempPassword}
                    </code>
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Ce mot de passe ne sera plus affiché.
                </p>
                <Button onClick={handleClose} className="w-full">
                  Terminé
                </Button>
              </div>
            ) : (
              <>
                <h3 className="mb-4 text-base font-bold text-club-navy-900">
                  Nouveau joueur
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nom complet"
                    required
                    value={form.fullName}
                    onChange={(e) =>
                      setForm({ ...form, fullName: e.target.value })
                    }
                    placeholder="Ex : Diallo Mamadou"
                  />
                  <Input
                    label="E-mail"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="joueur@exemple.com"
                    hint="Sert d'identifiant de connexion."
                  />
                  <Input
                    label="Téléphone (optionnel)"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Poste"
                      value={form.position}
                      onChange={(e) =>
                        setForm({ ...form, position: e.target.value })
                      }
                    >
                      <option value="">Non défini</option>
                      {PLAYER_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {POSITION_LABELS[pos]}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="N° de maillot"
                      type="number"
                      min={0}
                      max={99}
                      value={form.jerseyNumber}
                      onChange={(e) =>
                        setForm({ ...form, jerseyNumber: e.target.value })
                      }
                    />
                  </div>

                  {error ? (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={handleClose}>
                      Annuler
                    </Button>
                    <Button type="submit" loading={loading}>
                      Créer le joueur
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}