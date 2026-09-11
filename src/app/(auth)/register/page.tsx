import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Inscription — Striker FC",
};

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-club-navy-900">
          Rejoindre Striker FC
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Créez votre compte joueur. Un membre du staff pourra ensuite
          ajuster votre rôle si nécessaire.
        </p>
      </div>
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}