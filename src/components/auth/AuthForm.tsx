"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createBrowserClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegister = mode === "register";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient();

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone: phone || null },
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? translateAuthError(err.message)
          : "Une erreur est survenue.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister ? (
        <>
          <Input
            label="Nom complet"
            name="full_name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ex : Ousmane Diallo"
          />
          <Input
            label="Téléphone (optionnel)"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex : 07 00 00 00 00"
          />
        </>
      ) : null}

      <Input
        label="Adresse e-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.com"
      />

      <Input
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Au moins 6 caractères"
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        {isRegister ? "Créer mon compte" : "Se connecter"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {isRegister ? (
          <>
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-club-sky-600">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-club-sky-600">
              S&apos;inscrire
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (message.includes("already registered")) {
    return "Cette adresse e-mail est déjà utilisée.";
  }
  if (message.includes("Password should be")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  return message;
}