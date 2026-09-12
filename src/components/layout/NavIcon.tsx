"use client";

import {
  CreditCard,
  Dumbbell,
  HandCoins,
  LayoutDashboard,
  Package,
  Receipt,
  Shield,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  Receipt,
  HandCoins,
  Dumbbell,
  Trophy,
  Package,
  Shield,
};

export function NavIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}