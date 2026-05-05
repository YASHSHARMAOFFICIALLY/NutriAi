import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../utils/requestUser';
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
  const user = requireUser(req);
  const q = req.query as unknown as RangeQuery;
  const result = await dailyAnalytics(user.id, { from: q.from, to: q.to });
  res.json(result);
};

export const macroAnalyticsHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const q = req.query as unknown as RangeQuery;
  const result = await macroAnalytics(user.id, { from: q.from, to: q.to });
  res.json(result);
};

export const streakAnalyticsHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const result = await streakAnalytics(user.id);
  res.json(result);
};
