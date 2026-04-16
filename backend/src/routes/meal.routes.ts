import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createMealHandler,
  createMealSchema,
  dailySummaryHandler,
  deleteMealHandler,
  listMealsHandler,
  mealDateQuerySchema,
} from '../controllers/mealController';

export const mealRouter = Router();

mealRouter.post('/meals', requireAuth, validate(createMealSchema), createMealHandler);
mealRouter.get('/meals', requireAuth, validate(mealDateQuerySchema, 'query'), listMealsHandler);
mealRouter.get(
  '/meals/daily-summary',
  requireAuth,
  validate(mealDateQuerySchema, 'query'),
  dailySummaryHandler,
);
mealRouter.delete('/meals/:id', requireAuth, deleteMealHandler);
