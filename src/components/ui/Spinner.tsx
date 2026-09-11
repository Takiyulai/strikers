export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-club-sky-500 border-t-transparent" />
      <span className="text-sm">{label ?? "Chargement…"}</span>
    </div>
  );
}