import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Connexion — Striker FC" };

export default function LoginPage() {
  return (
    <div className="space-y-5 text-center">
      <div className="space-y-1.5">
        <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-gradient text-base font-black text-white shadow-md">
          S
        </span>
        <h1 className="text-xl font-black text-club-navy-900">Connexion</h1>
        <p className="text-xs text-slate-500">
          Accédez à votre espace Striker FC.
        </p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
      <p className="text-center text-sm text-slate-500">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="font-semibold text-club-sky-600 hover:text-club-sky-700"
        >
          Inscrivez-vous
        </Link>
      </p>
      <p className="text-center text-xs text-slate-400">
        <Link href="/mot-de-passe-oublie" className="hover:text-slate-600">
          Mot de passe oublié ?
        </Link>
      </p>
    </div>
  );
}