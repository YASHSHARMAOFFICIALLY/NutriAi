import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  dailyAnalyticsHandler,
  macroAnalyticsHandler,
  rangeQuerySchema,
  streakAnalyticsHandler,
} from '../controllers/analyticsController';

export const analyticsRouter = Router();

analyticsRouter.get(
  '/analytics/daily',
  requireAuth,
  validate(rangeQuerySchema, 'query'),
  dailyAnalyticsHandler,
);
analyticsRouter.get(
  '/analytics/macros',
  requireAuth,
  validate(rangeQuerySchema, 'query'),
  macroAnalyticsHandler,
);
analyticsRouter.get('/analytics/streak', requireAuth, streakAnalyticsHandler);
