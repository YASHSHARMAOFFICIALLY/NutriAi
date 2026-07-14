export function todayKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function dateKeyToLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayLabel(key: string): string {
  return dateKeyToLocalDate(key).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
