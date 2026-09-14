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
    <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 p-1.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-club-sky-600 text-[11px] font-bold text-white">
        {getInitials(fullName || "?")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-club-navy-900">
          {fullName || "Utilisateur"}
        </p>
        <p className="truncate text-[10px] font-medium text-slate-500">
          {roleLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white hover:text-red-600"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
