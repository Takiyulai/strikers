"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-club-navy-700"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Tiroir rendu via un portail dans <body> : le header utilise
          backdrop-blur, qui confine ses descendants `fixed` au header. */}
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-club-navy-950/50"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
                <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
                  <span className="text-sm font-black uppercase tracking-wide text-club-navy-900">
                    Striker FC
                  </span>
                  <button
                    type="button"
                    aria-label="Fermer le menu"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-club-navy-700 hover:bg-club-sky-50"
                    >
                      <NavIcon name={item.icon} className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-slate-100 p-3">
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