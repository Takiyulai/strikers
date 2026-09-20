"use client";

import { useState } from "react";
import Link from "next/link";

import { createBrowserClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reinitialisation`,
      },
    );

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="space-y-5 text-center">
      <div className="space-y-1.5">
        <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-gradient text-base font-black text-white shadow-md">
          S
        </span>
        <h1 className="text-xl font-black text-club-navy-900">
          Mot de passe oublié
        </h1>
        <p className="text-xs text-slate-500">
          Recevez un lien de réinitialisation par e-mail.
        </p>
      </div>

      {sent ? (
        <p className="rounded-lg bg-club-green-50 px-3 py-2 text-xs text-club-green-800">
          Un email a été envoyé à <span className="font-semibold">{email}</span>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <Input
            label="Adresse e-mail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="vous@strikerfc.com"
          />
          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Envoi…" : "Recevoir le lien"}
          </Button>
        </form>
      )}

      <p className="text-center text-xs text-slate-400">
        <Link href="/login" className="hover:text-slate-600">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}