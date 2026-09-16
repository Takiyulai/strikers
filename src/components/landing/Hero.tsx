/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-club-navy-950">
      <div className="absolute inset-0" aria-hidden>
        <img
          src="/images/str.jpeg"
          className="h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-club-navy-950 via-club-navy-950/10 to-club-navy-950/70" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:py-32">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur sm:text-xs">
          Saison en cours
        </span>

        <h1 className="text-4xl font-black uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
          Striker{" "}
          <span className="bg-gradient-to-r from-club-sky-300 to-club-green-300 bg-clip-text text-transparent">
            FC
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-base text-white/85 sm:text-lg">
          La discipline forge les champions. Un collectif soudé, une ambition
          commune : progresser ensemble, match après match.
        </p>

        <div className="mt-9">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-xl bg-club-sky-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-club-sky-400"
          >
            Rejoindre l&apos;équipe
          </Link>
        </div>
      </div>
    </section>
  );
}
