"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, type, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  const resolvedType = isPassword && visible ? "text" : type;

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-bold text-club-navy-700"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            "w-full rounded-xl border bg-slate-50/70 px-3.5 py-3 pr-10 text-sm text-club-navy-900 placeholder:text-slate-400 transition-all",
            "focus:bg-white focus:outline-none focus:ring-2 focus:ring-club-sky-500/20",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-club-sky-500",
            !isPassword && "pr-3.5",
            className,
          )}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-club-navy-700"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {!error && hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
