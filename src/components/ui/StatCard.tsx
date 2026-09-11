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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              tones[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-bold text-club-navy-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}