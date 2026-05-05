import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../utils/requestUser';
import { createMeal, dailySummary, deleteMeal, listMealsForDate } from '../services/mealService';

const MealTypeSchema = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']);

const MealItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().max(100).nullable().optional(),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

export const createMealSchema = z
  .object({
    mealType: MealTypeSchema,
    loggedAt: z.coerce.date().optional(),
    notes: z.string().max(2000).nullable().optional(),
    foodQueryId: z.string().uuid().nullable().optional(),
    items: z.array(MealItemSchema).max(30).default([]),
  })
  .refine((v) => Boolean(v.foodQueryId) || v.items.length > 0, {
    message: 'Provide items or a foodQueryId',
  });

export type CreateMealBody = z.infer<typeof createMealSchema>;

export const mealDateQuerySchema = z.object({
  date: z.coerce.date(),
});

export const createMealHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const body = req.body as CreateMealBody;
  const meal = await createMeal({
    userId: user.id,
    mealType: body.mealType,
    loggedAt: body.loggedAt ?? new Date(),
    notes: body.notes ?? null,
    foodQueryId: body.foodQueryId ?? null,
    items: body.items,
  });
  res.status(201).json({ meal });
};

export const listMealsHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const { date } = req.query as unknown as z.infer<typeof mealDateQuerySchema>;
  const meals = await listMealsForDate(user.id, date);
  res.json({ date: date.toISOString().slice(0, 10), meals });
};

export const dailySummaryHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const { date } = req.query as unknown as z.infer<typeof mealDateQuerySchema>;
  const summary = await dailySummary(user.id, date);
  res.json(summary);
};

export const deleteMealHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  await deleteMeal(user.id, req.params.id);
  res.status(204).end();
};
