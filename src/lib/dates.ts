import {
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

/** Décrit une semaine ISO (lundi → dimanche) prête à être enregistrée. */
export interface WeekInfo {
  year: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  label: string;
}

export function getWeekInfo(date: Date = new Date()): WeekInfo {
  const start = startOfISOWeek(date);
  const end = endOfISOWeek(date);
  const year = getISOWeekYear(date);
  const weekNumber = getISOWeek(date);

  return {
    year,
    weekNumber,
    weekStart: format(start, "yyyy-MM-dd"),
    weekEnd: format(end, "yyyy-MM-dd"),
    label: `Semaine ${weekNumber} · ${year}`,
  };
}

export function formatDate(
  value: string | Date,
  pattern = "dd MMM yyyy",
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, pattern, { locale: fr });
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, "dd MMM yyyy 'à' HH:mm");
}

export function isTrainingDay(date: Date, days: readonly number[]): boolean {
  return days.includes(date.getDay());
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}