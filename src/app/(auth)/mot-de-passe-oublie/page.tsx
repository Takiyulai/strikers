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
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-club-navy-900">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Entrez votre adresse e-mail : vous recevrez un lien de
          réinitialisation.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-club-green-50 px-4 py-3 text-sm text-club-green-700">
            Si un compte existe pour {email}, un e-mail avec un lien de
            réinitialisation vient d&apos;être envoyé. Pensez à vérifier vos
            spams.
          </p>
          <Link href="/login" className="btn-primary w-full">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Adresse e-mail"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Envoyer le lien
          </Button>

          <p className="text-center text-sm text-slate-500">
            <Link
              href="/login"
              className="font-semibold text-club-sky-600 hover:underline"
            >
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}