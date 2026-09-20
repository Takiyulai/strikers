import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/permissions";
import { ROLE_LABELS } from "@/types";

import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavIcon } from "@/components/layout/NavIcon";
import { NextTrainingBanner } from "@/components/layout/NextTrainingBanner";
import { UserMenu } from "@/components/layout/UserMenu";

export async function DashboardShell({
  children,
  title,
  description,
  action,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const navItems = getNavItemsForRole(user.role);

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Sidebar desktop — fond navy pour contraster avec le contenu blanc */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col bg-club-navy-900 text-white lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-club-sky-500 text-sm font-black text-white">
            S
          </span>
          <span className="text-sm font-black uppercase tracking-wide text-white">
            Striker FC
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Page d&apos;accueil
          </Link>
          <div className="my-1.5 border-t border-white/10" />
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <NavIcon name={item.icon} className="h-4 w-4 text-white/50" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-2.5">
          <UserMenu
            fullName={user.fullName}
            roleLabel={ROLE_LABELS[user.role]}
          />
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:pl-56 pt-12">
        {/* Bandeau de rappel en haut de page, au-dessus du header sticky. */}
        <NextTrainingBanner />

        {/* Barre du haut collée sous le bandeau de rappel. */}
        <div className="sticky top-0 z-20">
          <header className="flex h-12 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-3 backdrop-blur-md sm:h-14 sm:px-5">
            <div className="flex items-center gap-2 lg:hidden">
              <MobileNav
                items={navItems}
                fullName={user.fullName}
                roleLabel={ROLE_LABELS[user.role]}
              />
              <Logo href="/dashboard" compact />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-base font-bold text-club-navy-900">{title}</h1>
              {description ? (
                <p className="text-[11px] text-slate-500">{description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">{action}</div>
          </header>
        </div>

        <div className="border-b border-slate-200/60 bg-white px-3 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Page d'accueil"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <h1 className="text-base font-bold text-club-navy-900">{title}</h1>
          </div>
          {description ? (
            <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
          ) : null}
        </div>

        <main className="mx-auto max-w-6xl p-3 pb-20 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
