import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth";
import { getNavItemsForRole } from "@/lib/permissions";
import { ROLE_LABELS } from "@/types";

import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { NavIcon } from "@/components/layout/NavIcon";
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
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-club-navy-700 transition-colors hover:bg-club-sky-50 hover:text-club-sky-700"
            >
              <NavIcon name={item.icon} className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <UserMenu
            fullName={user.fullName}
            roleLabel={ROLE_LABELS[user.role]}
          />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <MobileNav items={navItems} />
            <Logo href="/dashboard" compact />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-bold text-club-navy-900">{title}</h1>
            {description ? (
              <p className="text-xs text-slate-500">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">{action}</div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
          <h1 className="text-lg font-bold text-club-navy-900">{title}</h1>
          {description ? (
            <p className="text-xs text-slate-500">{description}</p>
          ) : null}
        </div>

        <main className="mx-auto max-w-6xl p-4 pb-24 sm:p-6">{children}</main>
      </div>
    </div>
  );
}