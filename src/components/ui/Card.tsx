import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/70 bg-white shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
      <div>
        <h3 className="text-base font-extrabold tracking-tight text-club-navy-950">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-slate-100 p-3.5", className)} {...props} />
  );
}
