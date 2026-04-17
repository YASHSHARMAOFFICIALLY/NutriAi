import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  recommendMealsHandler,
  recommendQuerySchema,
} from '../controllers/recommendationController';

export const recommendationRouter = Router();

recommendationRouter.get(
  '/recommendations/meals',
  requireAuth,
  validate(recommendQuerySchema, 'query'),
  recommendMealsHandler,
);
