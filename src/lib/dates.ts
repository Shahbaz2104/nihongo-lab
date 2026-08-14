export interface DayStatRow {
  date: string;
  reviews: number;
  learned: number;
}

/** Local-timezone day key (YYYY-MM-DD), matching DayStat.date. */
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Consecutive-day streak ending today (or yesterday if today has no activity). */
export function computeStreak(history: DayStatRow[], now = new Date()): number {
  const active = new Set(history.filter((h) => h.reviews > 0).map((h) => h.date));
  if (active.size === 0) return 0;
  const cursor = addDays(startOfDay(now), active.has(dayKey(now)) ? 0 : -1);
  let streak = 0;
  while (active.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
