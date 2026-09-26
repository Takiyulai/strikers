import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Inscription — Striker FC",
};

export default function RegisterPage() {
  return (
    <div className="space-y-7">
      <div>
        <span className="eyebrow">Rejoindre le collectif</span>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.035em] text-club-navy-950">Créez votre espace.</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Inscrivez-vous comme joueur. Le staff pourra ensuite ajuster votre rôle si nécessaire.</p>
      </div>
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
