import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { MealType } from '@prisma/client';
import { UnauthorizedError } from '../utils/errors';
import { recommendMeals } from '../services/recommendationService';

const MealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

export const recommendQuerySchema = z.object({
  mealType: MealTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(50).default(5),
  remainingCalories: z.coerce.number().nonnegative().optional(),
  remainingProtein: z.coerce.number().nonnegative().optional(),
  remainingCarbs: z.coerce.number().nonnegative().optional(),
  remainingFat: z.coerce.number().nonnegative().optional(),
});

export type RecommendQuery = z.infer<typeof recommendQuerySchema>;

export const recommendMealsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const q = req.query as unknown as RecommendQuery;

  // If the client supplied any remaining-* overrides we build a complete
  // override (with nulls where not supplied). Otherwise we let the service
  // compute it from today's meals + profile targets.
  const anyOverride =
    q.remainingCalories != null ||
    q.remainingProtein != null ||
    q.remainingCarbs != null ||
    q.remainingFat != null;

  const remainingOverride = anyOverride
    ? {
        calories: q.remainingCalories ?? null,
        protein: q.remainingProtein ?? null,
        carbs: q.remainingCarbs ?? null,
        fat: q.remainingFat ?? null,
      }
    : undefined;

  const result = await recommendMeals({
    userId: req.user.id,
    mealType: q.mealType as MealType | undefined,
    limit: q.limit,
    remainingOverride,
  });

  res.json(result);
};
