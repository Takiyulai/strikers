/** Formate un montant en FCFA. */
export function formatFcfa(amount: number | null | undefined): string {
  const value = amount ?? 0;
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export function formatNumber(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("fr-FR");
}

/** Initiales d'un nom complet, pour les avatars. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Taux d'assiduité en pourcentage. */
export function attendanceRate(attended: number, recorded: number): number {
  if (recorded <= 0) return 0;
  return Math.round((attended / recorded) * 100);
}