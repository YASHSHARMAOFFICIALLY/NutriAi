import { prisma } from '../config/prisma';
import { streakAnalytics, dailyAnalytics } from './analyticsService';
import { dayWindow } from './mealService';

export interface WeeklyDigestData {
  totalMeals: number;
  avgCalories: number;
  macroSplit: { protein: number; carbs: number; fat: number };
  bestDayLabel: string;
  currentStreak: number;
}

type AtRiskUser = { id: string; email: string; name: string | null; streak: number };
type DigestUser = { id: string; email: string; name: string | null };

export const getUsersAtRisk = async (): Promise<AtRiskUser[]> => {
  const usersWithPref = await prisma.user.findMany({
    where: { profile: { notifyStreakRisk: true } },
    select: { id: true, email: true, name: true },
  });

  const today = new Date();
  const { start: todayStart } = dayWindow(today);

  const result: AtRiskUser[] = [];
  for (const u of usersWithPref) {
    const [streak, todayMealCount] = await Promise.all([
      streakAnalytics(u.id, today),
      prisma.meal.count({ where: { userId: u.id, loggedAt: { gte: todayStart } } }),
    ]);
    if (streak.loggingStreak >= 3 && todayMealCount === 0) {
      result.push({ id: u.id, email: u.email, name: u.name, streak: streak.loggingStreak });
    }
  }
  return result;
};

export const getUsersForWeeklyDigest = async (): Promise<DigestUser[]> => {
  const users = await prisma.user.findMany({
    where: { profile: { notifyWeeklyDigest: true } },
    select: { id: true, email: true, name: true },
  });
  return users;
};

export const buildWeeklyDigestData = async (userId: string): Promise<WeeklyDigestData> => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);

  const [analytics, streak] = await Promise.all([
    dailyAnalytics(userId, { from: sevenDaysAgo, to: now }),
    streakAnalytics(userId, now),
  ]);

  const totalMeals = analytics.days.reduce((sum, d) => sum + d.mealCount, 0);
  const avgCalories = Math.round(analytics.averages.calories);

  const totalP = analytics.days.reduce((s, d) => s + d.protein, 0);
  const totalC = analytics.days.reduce((s, d) => s + d.carbs, 0);
  const totalF = analytics.days.reduce((s, d) => s + d.fat, 0);
  const totalMacroKcal = totalP * 4 + totalC * 4 + totalF * 9;
  const pct = (kcal: number) =>
    totalMacroKcal > 0 ? Math.round((kcal / totalMacroKcal) * 100) : 0;

  const best = analytics.days.reduce(
    (best, d) => (d.mealCount > best.mealCount ? d : best),
    analytics.days[0] ?? { date: '', mealCount: 0, calories: 0 },
  );
  const dayName = best.date
    ? new Date(best.date + 'T12:00:00Z').toLocaleDateString('en-US', {
        weekday: 'long',
        timeZone: 'UTC',
      })
    : 'N/A';
  const bestDayLabel = best.mealCount > 0
    ? `${dayName} — ${best.mealCount} meal${best.mealCount > 1 ? 's' : ''}, ${Math.round(best.calories)} kcal`
    : 'No meals logged this week';

  return {
    totalMeals,
    avgCalories,
    macroSplit: {
      protein: pct(totalP * 4),
      carbs: pct(totalC * 4),
      fat: pct(totalF * 9),
    },
    bestDayLabel,
    currentStreak: streak.loggingStreak,
  };
};
