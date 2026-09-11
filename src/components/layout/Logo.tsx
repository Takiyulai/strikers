import Link from "next/link";

import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pitch-gradient text-lg font-black text-white shadow-card">
        S
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm font-black uppercase tracking-wide text-club-navy-900">
            Striker FC
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-club-sky-600">
            Football Club
          </span>
        </span>
      ) : null}
    </Link>
  );
}