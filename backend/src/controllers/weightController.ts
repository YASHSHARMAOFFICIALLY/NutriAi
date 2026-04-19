import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import {
  createEntry,
  deleteEntry,
  firstEntry,
  latestEntry,
  listEntries,
} from '../services/weightService';

export const createWeightSchema = z.object({
  weightKg: z.number().min(20).max(500),
  recordedAt: z.coerce.date().optional(),
  note: z.string().max(200).nullable().optional(),
});

export const listWeightQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
});

export const createWeightHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as z.infer<typeof createWeightSchema>;
  const recordedAt = body.recordedAt ?? new Date();
  if (recordedAt.getTime() > Date.now() + 60_000) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'recordedAt cannot be in the future' } });
    return;
  }
  const entry = await createEntry(req.user.id, body.weightKg, recordedAt, body.note ?? null);
  res.status(201).json({ entry });
};

export const listWeightHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const q = req.query as unknown as z.infer<typeof listWeightQuerySchema>;
  const [entries, latest, first] = await Promise.all([
    listEntries(req.user.id, { from: q.from, to: q.to, limit: q.limit }),
    latestEntry(req.user.id),
    firstEntry(req.user.id),
  ]);
  const delta =
    latest && first && latest.id !== first.id
      ? Number((latest.weightKg - first.weightKg).toFixed(2))
      : 0;
  res.json({ entries, latest, first, deltaKg: delta });
};

export const deleteWeightHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  await deleteEntry(req.user.id, req.params.id);
  res.status(204).end();
};
