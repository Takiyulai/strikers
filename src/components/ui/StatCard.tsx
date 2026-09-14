import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "sky",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "sky" | "green" | "navy" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    sky: "bg-club-sky-50 text-club-sky-700",
    green: "bg-club-green-50 text-club-green-700",
    navy: "bg-club-navy-50 text-club-navy-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              tones[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-xl font-bold text-club-navy-900">{value}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}
