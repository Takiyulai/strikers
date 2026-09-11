import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Connexion — Striker FC",
};

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-club-navy-900">Bon retour !</h1>
        <p className="mt-1 text-sm text-slate-500">
          Connectez-vous pour accéder à l&apos;espace de gestion de
          l&apos;équipe.
        </p>
      </div>
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}