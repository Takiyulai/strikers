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
    <div className="flex items-center gap-2 rounded-lg bg-white/10 p-1.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-club-sky-500 text-[10px] font-bold text-white">
        {getInitials(fullName || "?")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white">
          {fullName || "Utilisateur"}
        </p>
        <p className="truncate text-[10px] font-medium text-white/50">
          {roleLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Se déconnecter"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
