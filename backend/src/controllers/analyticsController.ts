import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import {
  dailyAnalytics,
  macroAnalytics,
  streakAnalytics,
} from '../services/analyticsService';

export const rangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type RangeQuery = z.infer<typeof rangeQuerySchema>;

export const dailyAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const q = req.query as unknown as RangeQuery;
  const result = await dailyAnalytics(req.user.id, { from: q.from, to: q.to });
  res.json(result);
};

export const macroAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const q = req.query as unknown as RangeQuery;
  const result = await macroAnalytics(req.user.id, { from: q.from, to: q.to });
  res.json(result);
};

export const streakAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const result = await streakAnalytics(req.user.id);
  res.json(result);
};
