"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createExpense } from "@/lib/actions/finances";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import type { ExpenseCategory } from "@/types/database";

export function ExpenseForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [motif, setMotif] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("AUTRE");
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createExpense({
      title,
      motif,
      amount: Number(amount),
      category,
      expenseDate,
    });

    setLoading(false);
    if (result.ok) {
      setTitle("");
      setMotif("");
      setAmount("");
      setCategory("AUTRE");
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
        placeholder="Ex : Location du terrain"
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Montant (FCFA)"
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1500"
          required
        />
        <Select
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {EXPENSE_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Date"
        type="date"
        value={expenseDate}
        onChange={(e) => setExpenseDate(e.target.value)}
        required
      />

      <Input
        label="Motif (optionnel)"
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Précisions sur la dépense"
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full">
        Enregistrer la dépense
      </Button>
    </form>
  );
}