import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Horaire fixe des entraînements de Striker FC.
 * 0 = dimanche, 3 = mercredi, 6 = samedi (cf. Date#getDay).
 */
export interface TrainingSlot {
  dayIndex: 0 | 3 | 6;
  label: string;
  /** HH:mm sur 24 h. */
  time: string;
}

export const WEEKLY_TRAINING_SLOTS: TrainingSlot[] = [
  { dayIndex: 3, label: "Mercredi", time: "17:00" },
  { dayIndex: 6, label: "Samedi", time: "16:30" },
  { dayIndex: 0, label: "Dimanche", time: "16:30" },
];

export interface NextTraining {
  slot: TrainingSlot;
  date: Date;
  /** ex. : « Mercredi 17 septembre » */
  dayLabel: string;
  /** ex. : « 17h00 » */
  timeLabel: string;
  isToday: boolean;
  daysAway: number;
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(":");
  return { hours: Number(hours), minutes: Number(minutes) };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Prochaine séance en fonction de l'horaire hebdomadaire fixe :
 * si le jour est un jour d'entraînement et que l'heure n'est pas passée,
 * la séance du jour est retenue.
 */
export function getNextTraining(from: Date = new Date()): NextTraining {
  let best: NextTraining | null = null;

  for (const slot of WEEKLY_TRAINING_SLOTS) {
    const date = new Date(from);
    date.setDate(from.getDate() + ((slot.dayIndex - from.getDay() + 7) % 7));

    const { hours, minutes } = parseTime(slot.time);
    date.setHours(hours, minutes, 0, 0);

    if (date.getTime() <= from.getTime()) {
      date.setDate(date.getDate() + 7);
    }

    const startOfDay = (value: Date) => {
      const copy = new Date(value);
      copy.setHours(0, 0, 0, 0);
      return copy.getTime();
    };

    if (!best || date.getTime() < best.date.getTime()) {
      best = {
        slot,
        date,
        dayLabel: capitalize(format(date, "EEEE d MMMM", { locale: fr })),
        timeLabel: slot.time.replace(":", "h"),
        isToday: date.toDateString() === from.toDateString(),
        daysAway: Math.round(
          (startOfDay(date) - startOfDay(from)) / 86_400_000,
        ),
      };
    }
  }

  return best as NextTraining;
}