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
    sky: "bg-club-sky-50 text-club-sky-600 ring-club-sky-100",
    green: "bg-club-green-50 text-club-green-600 ring-club-green-100",
    navy: "bg-club-navy-50 text-club-navy-700 ring-club-navy-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    red: "bg-red-50 text-red-600 ring-red-100",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition-transform group-hover:scale-105",
              tones[tone],
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-club-navy-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
