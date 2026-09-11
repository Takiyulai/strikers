"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createMatch } from "@/lib/actions/sport";
import { MATCH_TYPES, MATCH_TYPE_LABELS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { MatchType } from "@/types/database";

export function MatchForm() {
  const router = useRouter();
  const [opponent, setOpponent] = useState("");
  const [isHome, setIsHome] = useState(true);
  const [matchDate, setMatchDate] = useState(todayISO());
  const [matchTime, setMatchTime] = useState("");
  const [location, setLocation] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("AMICAL");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createMatch({
      opponent,
      isHome,
      matchDate,
      matchTime,
      location,
      matchType,
      notes,
    });

    setLoading(false);
    if (result.ok) {
      setOpponent("");
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
        label="Équipe adverse"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        placeholder="Ex : Olympique FC"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsHome(true)}
          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
            isHome
              ? "border-club-sky-500 bg-club-sky-50 text-club-sky-700"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          Domicile
        </button>
        <button
          type="button"
          onClick={() => setIsHome(false)}
          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
            !isHome
              ? "border-club-sky-500 bg-club-sky-50 text-club-sky-700"
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          Extérieur
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={matchDate}
          onChange={(e) => setMatchDate(e.target.value)}
          required
        />
        <Input
          label="Heure"
          type="time"
          value={matchTime}
          onChange={(e) => setMatchTime(e.target.value)}
        />
      </div>

      <Select
        label="Type de match"
        value={matchType}
        onChange={(e) => setMatchType(e.target.value as MatchType)}
      >
        {MATCH_TYPES.map((type) => (
          <option key={type} value={type}>
            {MATCH_TYPE_LABELS[type]}
          </option>
        ))}
      </Select>

      <Input
        label="Lieu"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ex : Stade municipal"
      />

      <Input
        label="Informations complémentaires"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Créer le match
      </Button>
    </form>
  );
}