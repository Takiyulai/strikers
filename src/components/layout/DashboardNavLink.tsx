"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { NavIcon } from "@/components/layout/NavIcon";

export function DashboardNavLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all",
        active
          ? "bg-white text-club-navy-950 shadow-lg shadow-black/10"
          : "text-white/60 hover:bg-white/[0.07] hover:text-white",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-club-sky-50 text-club-sky-600"
            : "bg-white/[0.05] text-white/45 group-hover:text-white/80",
        )}
      >
        <NavIcon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active ? <ChevronRight className="h-3.5 w-3.5 text-club-sky-500" /> : null}
    </Link>
  );
}
