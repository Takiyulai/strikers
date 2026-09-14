import type { ReactNode } from "react";

/**
 * Layout d'authentification minimal : formulaire centré, sans panneau
 * marketing. Padding réduit pour maximiser l'espace utile sur mobile.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-6 sm:px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200/60 bg-white p-5 shadow-card sm:p-6">
        {children}
      </div>
    </div>
  );
}
