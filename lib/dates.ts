import { format, parseISO, startOfDay } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

export function todayKey() {
  return format(new Date(), DATE_FORMAT);
}

export function dateKeyToUtcDate(dateKey: string) {
  return startOfDay(parseISO(dateKey));
}

export function toDateKey(date: Date) {
  return format(date, DATE_FORMAT);
}
