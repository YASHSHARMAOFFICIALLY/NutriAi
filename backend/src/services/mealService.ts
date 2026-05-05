import type { MealType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';
import { addUtcDays, startOfUtcDay, utcDateKey } from '../utils/date';
import { roundToTenth } from '../utils/number';

export interface MealItemInput {
  name: string;
  quantity?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface CreateMealInput {
  userId: string;
  mealType: MealType;
  loggedAt: Date;
  notes?: string | null;
  foodQueryId?: string | null;
  items: MealItemInput[];
}

const sumTotals = (items: MealItemInput[]) =>
  items.reduce(
    (acc, it) => ({
      calories: roundToTenth(acc.calories + it.calories),
      protein: roundToTenth(acc.protein + it.protein),
      carbs: roundToTenth(acc.carbs + it.carbs),
      fat: roundToTenth(acc.fat + it.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

export const createMeal = async (input: CreateMealInput) => {
  let items = input.items;

  if (input.foodQueryId) {
    const fq = await prisma.foodQuery.findFirst({
      where: { id: input.foodQueryId, userId: input.userId },
      include: { items: true },
    });
    if (!fq) throw new NotFoundError('FoodQuery not found');
    if (items.length === 0) {
      items = fq.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
      }));
    }
  }

  const totals = sumTotals(items);

  return prisma.meal.create({
    data: {
      userId: input.userId,
      mealType: input.mealType,
      loggedAt: input.loggedAt,
      notes: input.notes ?? null,
      foodQueryId: input.foodQueryId ?? null,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      items: {
        create: items.map((it) => ({
          name: it.name,
          quantity: it.quantity ?? null,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
        })),
      },
    },
    include: { items: true },
  });
};

// Inclusive start of day (00:00) and exclusive next-day start in the given date's UTC.
export const dayWindow = (date: Date): { start: Date; end: Date } => {
  const start = startOfUtcDay(date);
  return { start, end: addUtcDays(start, 1) };
};

export const listMealsForDate = async (userId: string, date: Date) => {
  const { start, end } = dayWindow(date);
  return prisma.meal.findMany({
    where: { userId, loggedAt: { gte: start, lt: end } },
    orderBy: { loggedAt: 'asc' },
    include: { items: true },
  });
};

export interface DailySummary {
  date: string; // YYYY-MM-DD (UTC)
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  byMealType: Record<MealType, { calories: number; protein: number; carbs: number; fat: number; count: number }>;
  mealCount: number;
}

export const dailySummary = async (userId: string, date: Date): Promise<DailySummary> => {
  const { start, end } = dayWindow(date);

  const group = await prisma.meal.groupBy({
    by: ['mealType'],
    where: { userId, loggedAt: { gte: start, lt: end } },
    _sum: { totalCalories: true, totalProtein: true, totalCarbs: true, totalFat: true },
    _count: { _all: true },
  });

  const allTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const byMealType = allTypes.reduce(
    (acc, t) => {
      acc[t] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
      return acc;
    },
    {} as DailySummary['byMealType'],
  );

  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  let mealCount = 0;

  for (const row of group) {
    const cal = row._sum.totalCalories ?? 0;
    const pro = row._sum.totalProtein ?? 0;
    const car = row._sum.totalCarbs ?? 0;
    const fat = row._sum.totalFat ?? 0;
    byMealType[row.mealType] = {
      calories: roundToTenth(cal),
      protein: roundToTenth(pro),
      carbs: roundToTenth(car),
      fat: roundToTenth(fat),
      count: row._count._all,
    };
    totals = {
      calories: roundToTenth(totals.calories + cal),
      protein: roundToTenth(totals.protein + pro),
      carbs: roundToTenth(totals.carbs + car),
      fat: roundToTenth(totals.fat + fat),
    };
    mealCount += row._count._all;
  }

  return {
    date: utcDateKey(start),
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalCarbs: totals.carbs,
    totalFat: totals.fat,
    totals,
    byMealType,
    mealCount,
  };
};

export const deleteMeal = async (userId: string, mealId: string) => {
  const meal = await prisma.meal.findFirst({ where: { id: mealId, userId } });
  if (!meal) throw new NotFoundError('Meal not found');
  await prisma.meal.delete({ where: { id: mealId } });
};
