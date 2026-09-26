import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Connexion — Striker FC" };

export default function LoginPage() {
  return (
    <div className="space-y-7">
      <div>
        <span className="eyebrow">Espace membre</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-club-navy-950">Heureux de vous revoir.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Connectez-vous pour accéder à votre espace Striker FC.</p>
      </div>
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
