"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateProfileRole } from "@/lib/actions/sport";
import { USER_ROLES } from "@/lib/constants";
import { ROLE_LABELS, ROLE_BADGE_CLASSES } from "@/types";

import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { getInitials } from "@/lib/format";

import type { UserRole } from "@/types/database";

export interface RoleRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export function RoleManager({
  rows,
  currentUserId,
}: {
  rows: RoleRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function handleChange(profileId: string, role: UserRole) {
    setError(null);
    setSavedId(null);
    setPendingId(profileId);

    const result = await updateProfileRole(profileId, role);

    setPendingId(null);
    if (result.ok) {
      setSavedId(profileId);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {rows.map((row) => {
        const isSelf = row.id === currentUserId;
        return (
          <div
            key={row.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-club-navy-900 text-xs font-bold text-white">
                {getInitials(row.full_name || row.email || "?")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-club-navy-900">
                  {row.full_name || "Sans nom"}
                  {isSelf ? (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      (vous)
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-slate-500">{row.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                tone="neutral"
                className={ROLE_BADGE_CLASSES[row.role]}
              >
                {ROLE_LABELS[row.role]}
              </Badge>
              <div className="w-44">
                <Select
                  aria-label={`Rôle de ${row.full_name}`}
                  value={row.role}
                  disabled={isSelf || pendingId === row.id}
                  onChange={(e) =>
                    handleChange(row.id, e.target.value as UserRole)
                  }
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </option>
                  ))}
                </Select>
              </div>
              {savedId === row.id ? (
                <span className="text-xs font-medium text-club-green-600">
                  Enregistré ✓
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}