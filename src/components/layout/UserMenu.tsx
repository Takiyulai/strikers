"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { createBrowserClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/format";

export function UserMenu({
  fullName,
  roleLabel,
}: {
  fullName: string;
  roleLabel: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.05] p-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-club-sky-500 text-[11px] font-extrabold text-white shadow-lg shadow-club-sky-500/15">
        {getInitials(fullName || "?")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-white">
          {fullName || "Utilisateur"}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-wider text-white/35">
          {roleLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-red-400"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
