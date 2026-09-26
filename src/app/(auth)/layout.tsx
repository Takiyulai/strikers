import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 py-12 sm:px-8">
      <div className="absolute left-5 top-5 sm:left-8 sm:top-8">
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm transition-all hover:border-club-sky-200 hover:text-club-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Retour au site</span>
        </Link>
      </div>
      <div className="w-full max-w-md animate-fade-in rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card sm:p-9">
        {children}
      </div>
    </div>
  );
}
