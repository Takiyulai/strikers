"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createBrowserClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export default function ReinitialisationPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setHasSession(Boolean(user));
      setChecking(false);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return <Spinner label="Vérification du lien…" />;
  }

  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <div className="space-y-1.5">
          <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-gradient text-base font-black text-white shadow-md">
            S
          </span>
          <h1 className="text-xl font-black text-club-navy-900">
            Lien expiré
          </h1>
          <p className="text-xs text-slate-500">
            Demandez un nouveau lien pour réinitialiser votre mot de passe.
          </p>
        </div>
        <Link href="/mot-de-passe-oublie" className="btn-primary w-full">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <div className="space-y-1.5">
        <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-gradient text-base font-black text-white shadow-md">
          S
        </span>
        <h1 className="text-xl font-black text-club-navy-900">
          Nouveau mot de passe
        </h1>
        <p className="text-xs text-slate-500">
          Choisissez un mot de passe d&apos;au moins 6 caractères.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        <Input
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Au moins 6 caractères"
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Répétez le mot de passe"
        />

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" loading={loading} className="w-full">
          Enregistrer le mot de passe
        </Button>
      </form>
    </div>
  );
}