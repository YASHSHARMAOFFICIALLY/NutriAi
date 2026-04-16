import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginate, toOffset, type Paginated, type PaginationParams } from '../utils/pagination';

export interface HistoryFilters {
  from?: Date;
  to?: Date;
  minCalories?: number;
  maxCalories?: number;
}

export interface HistoryEntry {
  id: string;
  createdAt: Date;
  inputType: 'TEXT' | 'IMAGE';
  inputText: string | null;
  imageUrl: string | null;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  confidence: number;
  provider: string;
  model: string;
  cached: boolean;
  items: Array<{
    name: string;
    quantity: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export const listHistory = async (
  userId: string,
  filters: HistoryFilters,
  pagination: PaginationParams,
): Promise<Paginated<HistoryEntry>> => {
  const where: Prisma.FoodQueryWhereInput = { userId };

  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = filters.from;
    if (filters.to) where.createdAt.lte = filters.to;
  }

  if (filters.minCalories !== undefined || filters.maxCalories !== undefined) {
    where.totalCalories = {};
    if (filters.minCalories !== undefined) where.totalCalories.gte = filters.minCalories;
    if (filters.maxCalories !== undefined) where.totalCalories.lte = filters.maxCalories;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.foodQuery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: toOffset(pagination),
      take: pagination.pageSize,
      include: {
        items: {
          select: {
            name: true,
            quantity: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
          },
        },
      },
    }),
    prisma.foodQuery.count({ where }),
  ]);

  const data: HistoryEntry[] = rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    inputType: r.inputType,
    inputText: r.inputText,
    imageUrl: r.imageUrl,
    totals: {
      calories: r.totalCalories,
      protein: r.totalProtein,
      carbs: r.totalCarbs,
      fat: r.totalFat,
    },
    confidence: r.confidence,
    provider: r.provider,
    model: r.model,
    cached: r.cached,
    items: r.items,
  }));

  return paginate(data, total, pagination);
};
