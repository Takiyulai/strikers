import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
  ref,
) {
  const selectId = id ?? props.name;

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-club-navy-700"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-club-navy-900",
          "focus:outline-none focus:ring-2 focus:ring-club-sky-500/30",
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 focus:border-club-sky-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
});