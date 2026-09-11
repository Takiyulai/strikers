import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { RoleManager, type RoleRow } from "@/components/dashboard/RoleManager";
import { EmptyState } from "@/components/ui/EmptyState";

import type { UserRole } from "@/types/database";

export const metadata: Metadata = { title: "Administration" };

export default async function AdministrationPage() {
  const user = await getSessionUser();
  if (!user) return null;
  if (!hasPermission(user.role, "roles.manage")) redirect("/dashboard");

  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .order("full_name");

  const rows: RoleRow[] = (data ?? []).map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role as UserRole,
    is_active: profile.is_active,
  }));

  return (
    <DashboardShell
      title="Administration"
      description="Attribution des rôles et permissions des membres."
    >
      {rows.length === 0 ? (
        <EmptyState
          title="Aucun membre inscrit"
          description="Les comptes créés apparaîtront ici."
        />
      ) : (
        <RoleManager rows={rows} currentUserId={user.id} />
      )}
    </DashboardShell>
  );
}