export const startOfUtcDay = (now: Date = new Date()): Date =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

export const addUtcDays = (date: Date, days: number): Date => {
  const out = new Date(date);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
};

export const utcDateKey = (date: Date): string => date.toISOString().slice(0, 10);
