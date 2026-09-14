"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Home, Menu, X } from "lucide-react";

import type { NavItem } from "@/lib/permissions";

import { NavIcon } from "@/components/layout/NavIcon";
import { UserMenu } from "@/components/layout/UserMenu";

export function MobileNav({
  items,
  fullName,
  roleLabel,
}: {
  items: NavItem[];
  fullName: string;
  roleLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-club-navy-700"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-club-navy-950/60"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-club-navy-900 text-white shadow-xl">
                <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-club-sky-500 text-xs font-black text-white">
                      S
                    </span>
                    <span className="text-sm font-black uppercase tracking-wide">
                      Striker FC
                    </span>
                  </div>
                  <button
                    type="button"
                    aria-label="Fermer le menu"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Home className="h-4 w-4" />
                    Page d&apos;accueil
                  </Link>
                  <div className="my-1.5 border-t border-white/10" />
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <NavIcon name={item.icon} className="h-4 w-4 text-white/50" />
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-white/10 p-2.5">
                  <UserMenu fullName={fullName} roleLabel={roleLabel} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
