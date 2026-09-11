import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "sky"
  | "green"
  | "red"
  | "amber"
  | "navy"
  | "purple";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  sky: "bg-club-sky-100 text-club-sky-800",
  green: "bg-club-green-100 text-club-green-800",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  navy: "bg-club-navy-100 text-club-navy-800",
  purple: "bg-purple-100 text-purple-800",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
