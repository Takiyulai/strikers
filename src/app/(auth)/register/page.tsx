import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/AuthForm";
import { Spinner } from "@/components/ui/Spinner";

export const metadata: Metadata = {
  title: "Inscription — Striker FC",
};

export default function RegisterPage() {
  return (
    <div className="space-y-5 text-center">
      <div className="space-y-1.5">
        <span className="mx-auto mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-gradient text-base font-black text-white shadow-md">
          S
        </span>
        <h1 className="text-xl font-black text-club-navy-900">Inscription</h1>
        <p className="text-xs text-slate-500">
          Créez votre compte joueur. Un membre du staff ajustera ensuite
          votre rôle si nécessaire.
        </p>
      </div>
      <Suspense fallback={<Spinner />}>
        <AuthForm mode="register" />
      </Suspense>
      <p className="text-center text-sm text-slate-500">
        Déjà inscrit ?{" "}
        <Link
          href="/login"
          className="font-semibold text-club-sky-600 hover:text-club-sky-700"
        >
          Connectez-vous
        </Link>
      </p>
    </div>
  );
}