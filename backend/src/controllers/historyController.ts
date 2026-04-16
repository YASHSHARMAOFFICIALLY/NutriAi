import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import { listHistory } from '../services/historyService';

export const historyQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  minCalories: z.coerce.number().nonnegative().optional(),
  maxCalories: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const listHistoryHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const q = req.query as unknown as HistoryQuery;

  const result = await listHistory(
    req.user.id,
    { from: q.from, to: q.to, minCalories: q.minCalories, maxCalories: q.maxCalories },
    { page: q.page, pageSize: q.pageSize },
  );

  res.json(result);
};
