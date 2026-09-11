import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-pitch-gradient p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-hero-overlay" aria-hidden />
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-black text-club-navy-900">
              S
            </span>
            <span className="text-lg font-black uppercase tracking-wide">
              Striker FC
            </span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-black leading-tight">
            La discipline forge
            <br />
            les champions.
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Centralisez la gestion de l&apos;équipe : joueurs, cotisations,
            entraînements, matchs et matériel, dans un seul espace.
          </p>
        </div>
        <p className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Striker FC — Tous droits réservés.
        </p>
      </div>

      <div className="flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}