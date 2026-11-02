/** Date helpers using local calendar days as 'YYYY-MM-DD' keys, so scheduling never drifts with time zones. */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(k: DateKey, n: number): DateKey {
  const d = parseDateKey(k);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

const utcDay = (k: DateKey) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Whole calendar days from a to b (b - a). */
export function diffDays(a: DateKey, b: DateKey): number {
  return Math.round((utcDay(b) - utcDay(a)) / 86_400_000);
}

export function isWeekend(k: DateKey): boolean {
  const day = parseDateKey(k).getDay();
  return day === 0 || day === 6;
}
