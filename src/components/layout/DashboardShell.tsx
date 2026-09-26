import Link from "next/link";
import { redirect } from "next/navigation";
import { Home } from "lucide-react";

import { getSessionUser } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/permissions";
import { ROLE_LABELS } from "@/types";

import { Logo } from "@/components/layout/Logo";
import { DashboardNavLink } from "@/components/layout/DashboardNavLink";
import { MobileNav } from "@/components/layout/MobileNav";
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
    <div className="min-h-screen bg-[#f5f7fa] bg-dashboard-glow">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-club-navy-950 text-white lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-white/[0.06] px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-club-sky-400 to-club-sky-600 text-base font-black text-white shadow-lg shadow-club-sky-500/20">
            S
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black uppercase tracking-[0.14em] text-white">Striker FC</span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-white/35">Espace club</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/25">Navigation</p>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/45 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05]"><Home className="h-4 w-4" /></span>
            Site public
          </Link>
          <div className="my-3 border-t border-white/[0.06]" />
          {navItems.map((item) => (
            <DashboardNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <UserMenu
            fullName={user.fullName}
            roleLabel={ROLE_LABELS[user.role]}
          />
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30">
          <NextTrainingBanner />
        </div>

        <div className="sticky top-10 z-20">
          <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200/70 bg-white/85 px-4 py-3 backdrop-blur-xl sm:px-7">
            <div className="flex items-center gap-2 lg:hidden">
              <MobileNav
                items={navItems}
                fullName={user.fullName}
                roleLabel={ROLE_LABELS[user.role]}
              />
              <Logo href="/dashboard" compact />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-extrabold tracking-tight text-club-navy-950">{title}</h1>
              {description ? (
                <p className="mt-0.5 text-xs text-slate-500">{description}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">{action}</div>
          </header>
        </div>

        <div className="border-b border-slate-200/60 bg-white/70 px-4 py-4 lg:hidden">
          <h1 className="text-xl font-extrabold tracking-tight text-club-navy-950">{title}</h1>
          {description ? (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          ) : null}
        </div>

        <main className="mx-auto max-w-7xl p-4 pb-20 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
