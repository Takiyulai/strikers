"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createEquipment } from "@/lib/actions/sport";
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_STATUSES,
  EQUIPMENT_STATUS_LABELS,
} from "@/lib/constants";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type {
  EquipmentCategory,
  EquipmentStatus,
} from "@/types/database";

export function EquipmentForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("BALLONS");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<EquipmentStatus>("BON");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createEquipment({
      name,
      category,
      quantity: Number(quantity),
      status,
      notes,
    });

    setLoading(false);
    if (result.ok) {
      setName("");
      setQuantity("1");
      setNotes("");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du matériel"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex : Ballons de match"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
        >
          {EQUIPMENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {EQUIPMENT_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </Select>
        <Input
          label="Quantité"
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <Select
        label="État"
        value={status}
        onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
      >
        {EQUIPMENT_STATUSES.map((st) => (
          <option key={st} value={st}>
            {EQUIPMENT_STATUS_LABELS[st]}
          </option>
        ))}
      </Select>

      <Input
        label="Observations (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Ajouter le matériel
      </Button>
    </form>
  );
}