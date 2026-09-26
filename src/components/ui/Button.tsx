"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-club-sky-600 text-white shadow-lg shadow-club-sky-600/20 hover:-translate-y-0.5 hover:bg-club-sky-500 active:translate-y-0 active:bg-club-sky-700",
  secondary:
    "border border-slate-200 bg-white text-club-navy-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 active:translate-y-0",
  success: "bg-club-green-600 text-white shadow-lg shadow-club-green-600/15 hover:-translate-y-0.5 hover:bg-club-green-500",
  danger: "bg-red-600 text-white shadow-lg shadow-red-600/15 hover:-translate-y-0.5 hover:bg-red-500",
  ghost: "text-club-navy-700 hover:bg-slate-100",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-club-sky-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  },
);
