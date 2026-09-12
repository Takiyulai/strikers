import type { ReactNode } from "react";

/**
 * Layout d'authentification volontairement minimal : formulaire centré,
 * sans panneau marketing ni pied de page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}