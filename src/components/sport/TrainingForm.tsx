"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTraining } from "@/lib/actions/sport";
import { todayISO } from "@/lib/dates";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function TrainingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createTraining({
      title,
      sessionDate,
      startTime,
      location,
      notes,
    });

    setLoading(false);
    if (result.ok) {
      setTitle("");
      setNotes("");
      setLocation("");
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Titre"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ex : Entraînement tactique"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          required
        />
        <Input
          label="Heure (optionnel)"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <Input
        label="Lieu"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ex : Terrain municipal"
      />

      <Input
        label="Note (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Consignes, thème de la séance…"
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Créer la séance
      </Button>
    </form>
  );
}