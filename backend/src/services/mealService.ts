import type { MealType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';

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

const round = (n: number) => Math.round(n * 10) / 10;

const sumTotals = (items: MealItemInput[]) =>
  items.reduce(
    (acc, it) => ({
      calories: round(acc.calories + it.calories),
      protein: round(acc.protein + it.protein),
      carbs: round(acc.carbs + it.carbs),
      fat: round(acc.fat + it.fat),
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
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
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
      calories: round(cal),
      protein: round(pro),
      carbs: round(car),
      fat: round(fat),
      count: row._count._all,
    };
    totals = {
      calories: round(totals.calories + cal),
      protein: round(totals.protein + pro),
      carbs: round(totals.carbs + car),
      fat: round(totals.fat + fat),
    };
    mealCount += row._count._all;
  }

  return {
    date: start.toISOString().slice(0, 10),
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
