import type { UserRole } from "@/types/database";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  PRESIDENT_HONNEUR: 100,
  PRESIDENT: 90,
  VICE_PRESIDENT: 80,
  TG: 70,
  ASSISTANT_TG: 65,
  COACH: 60,
  ARBITRE: 50,
  JOUEUR: 10,
};

export type Permission =
  | "team.manage"
  | "roles.manage"
  | "finance.view"
  | "finance.manage"
  | "contribution.view"
  | "contribution.create"
  | "sport.manage"
  | "players.manage"
  | "equipment.manage"
  | "attendance.mark_late";

const PERMISSIONS_BY_ROLE: Record<UserRole, Permission[]> = {
  PRESIDENT_HONNEUR: [
    "team.manage",
    "roles.manage",
    "finance.view",
    "contribution.view",
    "sport.manage",
    "players.manage",
    "equipment.manage",
  ],
  PRESIDENT: [
    "team.manage",
    "roles.manage",
    "finance.view",
    "finance.manage",
    "contribution.view",
    "contribution.create",
    "sport.manage",
    "players.manage",
    "equipment.manage",
  ],
  VICE_PRESIDENT: [
    "team.manage",
    "finance.view",
    "contribution.view",
    "finance.manage",
    "contribution.create",
    "sport.manage",
    "players.manage",
    "equipment.manage",
  ],
  TG: [
    "finance.view",
    "contribution.view",
    "finance.manage",
    "contribution.create",
  ],
  ASSISTANT_TG: [
    "attendance.mark_late",
    "finance.view",
    "contribution.view",
  ],
  COACH: ["sport.manage", "players.manage"],
  ARBITRE: ["sport.manage"],
  JOUEUR: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS_BY_ROLE[role]?.includes(permission) ?? false;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "LayoutDashboard" },
  {
    href: "/joueurs",
    label: "Joueurs",
    icon: "Users",
    permission: "players.manage",
  },
  {
    href: "/cotisations",
    label: "Cotisations",
    icon: "Wallet",
    permission: "finance.view",
  },
  {
    href: "/cotisations-exceptionnelles",
    label: "Cotis. spéciales",
    icon: "HandCoins",
    permission: "contribution.view",
  },
  {
    href: "/retards",
    label: "Retards",
    icon: "ClockAlert",
    permission: "attendance.mark_late",
  },
  {
    href: "/paiements",
    label: "Paiements",
    icon: "CreditCard",
    permission: "finance.view",
  },
  {
    href: "/depenses",
    label: "Dépenses",
    icon: "Receipt",
    permission: "finance.view",
  },
  {
    href: "/entrainements",
    label: "Entraînements",
    icon: "Dumbbell",
    permission: "sport.manage",
  },
  {
    href: "/matchs",
    label: "Matchs",
    icon: "Trophy",
    permission: "sport.manage",
  },
  {
    href: "/materiel",
    label: "Matériel",
    icon: "Package",
    permission: "equipment.manage",
  },
  {
    href: "/administration",
    label: "Administration",
    icon: "Shield",
    permission: "roles.manage",
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission),
  );
}