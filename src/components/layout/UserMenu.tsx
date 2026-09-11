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
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-club-sky-600 text-xs font-bold text-white">
        {getInitials(fullName || "?")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-club-navy-900">
          {fullName || "Utilisateur"}
        </p>
        <p className="truncate text-xs text-slate-500">{roleLabel}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-red-600"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}