import { prisma } from '../config/prisma';
import { getProfileOrNull } from './profileService';
import { dayWindow } from './mealService';
import { addUtcDays, utcDateKey } from '../utils/date';
import { roundToTenth } from '../utils/number';

const pctOfTarget = (actual: number, target: number | null | undefined): number | null => {
  if (!target || target <= 0) return null;
  return roundToTenth((actual / target) * 100);
};

export interface DailyPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCount: number;
  calorieTargetPct: number | null;
}

export interface DailyAnalytics {
  from: string;
  to: string;
  days: DailyPoint[];
  averages: { calories: number; protein: number; carbs: number; fat: number };
  targets: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

// Inclusive [from, to] window over UTC dates. `to` defaults to today UTC.
const resolveRange = (
  from: Date | undefined,
  to: Date | undefined,
  defaultDays: number,
): { start: Date; endExclusive: Date } => {
  const end = to ? dayWindow(to).end : dayWindow(new Date()).end;
  const start = from
    ? dayWindow(from).start
    : dayWindow(addUtcDays(new Date(end.getTime() - 1), -(defaultDays - 1))).start;
  return { start, endExclusive: end };
};

export const dailyAnalytics = async (
  userId: string,
  opts: { from?: Date; to?: Date } = {},
): Promise<DailyAnalytics> => {
  const { start, endExclusive } = resolveRange(opts.from, opts.to, 7);
  const profile = await getProfileOrNull(userId);

  const rows = await prisma.meal.findMany({
    where: { userId, loggedAt: { gte: start, lt: endExclusive } },
    select: {
      loggedAt: true,
      totalCalories: true,
      totalProtein: true,
      totalCarbs: true,
      totalFat: true,
    },
  });

  // Bucket by UTC day.
  const buckets = new Map<string, DailyPoint>();
  for (
    let cursor = new Date(start);
    cursor < endExclusive;
    cursor = addUtcDays(cursor, 1)
  ) {
    buckets.set(utcDateKey(cursor), {
      date: utcDateKey(cursor),
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealCount: 0,
      calorieTargetPct: null,
    });
  }

  for (const r of rows) {
    const key = utcDateKey(r.loggedAt);
    const b = buckets.get(key);
    if (!b) continue;
    b.calories = roundToTenth(b.calories + r.totalCalories);
    b.protein = roundToTenth(b.protein + r.totalProtein);
    b.carbs = roundToTenth(b.carbs + r.totalCarbs);
    b.fat = roundToTenth(b.fat + r.totalFat);
    b.mealCount += 1;
  }

  const calorieTarget = profile?.effectiveCalorieTarget ?? null;
  const proteinTarget = profile?.effectiveProteinTargetG ?? null;
  const carbsTarget = profile?.effectiveCarbsTargetG ?? null;
  const fatTarget = profile?.effectiveFatTargetG ?? null;

  const days = Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
  for (const d of days) {
    d.calorieTargetPct = pctOfTarget(d.calories, calorieTarget);
  }

  const count = days.length || 1;
  const averages = days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fat: acc.fat + d.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    from: utcDateKey(start),
    to: utcDateKey(addUtcDays(endExclusive, -1)),
    days,
    averages: {
      calories: roundToTenth(averages.calories / count),
      protein: roundToTenth(averages.protein / count),
      carbs: roundToTenth(averages.carbs / count),
      fat: roundToTenth(averages.fat / count),
    },
    targets: {
      calories: calorieTarget,
      protein: proteinTarget,
      carbs: carbsTarget,
      fat: fatTarget,
    },
  };
};

export interface MacroAnalytics {
  from: string;
  to: string;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  // Share of kcal contributed by each macro (based on 4/4/9 kcal per gram).
  energyShare: { protein: number; carbs: number; fat: number };
  targetAdherence: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export const macroAnalytics = async (
  userId: string,
  opts: { from?: Date; to?: Date } = {},
): Promise<MacroAnalytics> => {
  const { start, endExclusive } = resolveRange(opts.from, opts.to, 7);
  const profile = await getProfileOrNull(userId);

  const agg = await prisma.meal.aggregate({
    where: { userId, loggedAt: { gte: start, lt: endExclusive } },
    _sum: {
      totalCalories: true,
      totalProtein: true,
      totalCarbs: true,
      totalFat: true,
    },
  });

  const calories = roundToTenth(agg._sum.totalCalories ?? 0);
  const protein = roundToTenth(agg._sum.totalProtein ?? 0);
  const carbs = roundToTenth(agg._sum.totalCarbs ?? 0);
  const fat = roundToTenth(agg._sum.totalFat ?? 0);

  const proteinKcal = protein * 4;
  const carbsKcal = carbs * 4;
  const fatKcal = fat * 9;
  const macroKcalTotal = proteinKcal + carbsKcal + fatKcal;
  const share = (k: number) => (macroKcalTotal > 0 ? roundToTenth((k / macroKcalTotal) * 100) : 0);

  // Days in range for per-day target comparison.
  const ms = endExclusive.getTime() - start.getTime();
  const days = Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
  const perDay = (v: number) => v / days;

  return {
    from: utcDateKey(start),
    to: utcDateKey(addUtcDays(endExclusive, -1)),
    totals: { calories, protein, carbs, fat },
    energyShare: {
      protein: share(proteinKcal),
      carbs: share(carbsKcal),
      fat: share(fatKcal),
    },
    targetAdherence: {
      calories: pctOfTarget(perDay(calories), profile?.effectiveCalorieTarget ?? null),
      protein: pctOfTarget(perDay(protein), profile?.effectiveProteinTargetG ?? null),
      carbs: pctOfTarget(perDay(carbs), profile?.effectiveCarbsTargetG ?? null),
      fat: pctOfTarget(perDay(fat), profile?.effectiveFatTargetG ?? null),
    },
  };
};

export interface StreakResult {
  today: string;
  loggingStreak: number; // consecutive days ending today (or yesterday) with at least 1 meal
  calorieTargetStreak: number | null; // same, but requires calories within [80%, 120%] of target
  lastLoggedDate: string | null;
}

const WITHIN_TARGET_LOW = 0.8;
const WITHIN_TARGET_HIGH = 1.2;

export const streakAnalytics = async (userId: string, now = new Date()): Promise<StreakResult> => {
  const profile = await getProfileOrNull(userId);
  const target = profile?.effectiveCalorieTarget ?? null;

  // Look back up to 400 days — sufficient for streak computation without
  // scanning the whole table.
  const { end: todayEnd } = dayWindow(now);
  const start = addUtcDays(todayEnd, -400);

  const rows = await prisma.meal.findMany({
    where: { userId, loggedAt: { gte: start, lt: todayEnd } },
    select: { loggedAt: true, totalCalories: true },
    orderBy: { loggedAt: 'desc' },
  });

  // Per-day totals.
  const perDay = new Map<string, number>();
  for (const r of rows) {
    const key = utcDateKey(r.loggedAt);
    perDay.set(key, (perDay.get(key) ?? 0) + r.totalCalories);
  }

  const todayKey = utcDateKey(addUtcDays(todayEnd, -1));
  // Streak anchor: today if logged, else yesterday (so a streak doesn't break
  // just because the user hasn't eaten yet today).
  let cursor = perDay.has(todayKey) ? addUtcDays(todayEnd, -1) : addUtcDays(todayEnd, -2);
  let loggingStreak = 0;
  while (perDay.has(utcDateKey(cursor))) {
    loggingStreak += 1;
    cursor = addUtcDays(cursor, -1);
  }

  let calorieTargetStreak: number | null = null;
  if (target && target > 0) {
    const low = target * WITHIN_TARGET_LOW;
    const high = target * WITHIN_TARGET_HIGH;
    let c = perDay.has(todayKey) ? addUtcDays(todayEnd, -1) : addUtcDays(todayEnd, -2);
    calorieTargetStreak = 0;
    while (perDay.has(utcDateKey(c))) {
      const v = perDay.get(utcDateKey(c)) ?? 0;
      if (v >= low && v <= high) {
        calorieTargetStreak += 1;
        c = addUtcDays(c, -1);
      } else {
        break;
      }
    }
  }

  const lastLoggedDate = rows.length > 0 ? utcDateKey(rows[0]!.loggedAt) : null;

  return {
    today: utcDateKey(addUtcDays(todayEnd, -1)),
    loggingStreak,
    calorieTargetStreak,
    lastLoggedDate,
  };
};
