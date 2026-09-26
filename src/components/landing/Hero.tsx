/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-club-navy-950 pt-24 sm:min-h-[760px] sm:pt-28">
      <div className="absolute inset-0" aria-hidden>
        <img src="/images/str.jpeg" alt="" className="h-full w-full object-cover object-[58%_center] opacity-85" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-club-navy-950 via-transparent to-club-navy-950/30" />
        <div className="surface-grid absolute inset-0 opacity-20 [mask-image:linear-gradient(to_right,black,transparent_65%)]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-5 pb-32 pt-16 text-center sm:px-8 sm:pb-36 sm:pt-24 lg:min-h-[650px] lg:px-10 lg:pt-16">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-club-green-300/30 bg-club-green-400/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-club-green-200 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-club-green-400" />
            Saison 2026 · Le collectif d&apos;abord
          </span>

          <h1 className="mt-7 text-balance text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white sm:text-7xl lg:text-[5.5rem]">
            Plus qu&apos;un club.
            <span className="mt-2 block bg-gradient-to-r from-club-sky-300 via-white to-club-green-300 bg-clip-text text-transparent">Une famille.</span>
          </h1>

          <p className="mt-7 max-w-xl text-balance text-base leading-7 text-white/70 sm:text-lg">
            Striker FC rassemble des joueurs qui avancent avec discipline, solidarité et ambition — sur le terrain comme en dehors.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-club-sky-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-club-sky-400">
              Rejoindre l&apos;équipe
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#club" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/15">
              <PlayCircle className="h-4 w-4 text-club-sky-300" />
              Découvrir le club
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/60">
            {["Gestion transparente", "Suivi sportif centralisé", "Vie du club simplifiée"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-club-green-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-club-navy-950 to-transparent" />
    </section>
  );
}
