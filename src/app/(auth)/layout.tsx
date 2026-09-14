import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-6 sm:px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link
            href="/"
            aria-label="Retour à l'accueil"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-club-sky-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-card sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}