import Link from "next/link";
import { Home } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-3 py-6 sm:px-4">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-club-sky-600"
          >
            <Home className="h-3.5 w-3.5" />
            Accueil
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pitch-gradient text-xs font-black text-white">
              S
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-club-navy-900">
              Striker FC
            </span>
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200/60 bg-white p-5 shadow-card sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
