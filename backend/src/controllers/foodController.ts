import type { RequestHandler } from 'express';
import { z } from 'zod';
import { analyzeFood } from '../services/foodService';

export const analyzeFoodSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((v) => Boolean(v.text || v.imageUrl), {
    message: 'Provide text or imageUrl',
  });

export type AnalyzeFoodBody = z.infer<typeof analyzeFoodSchema>;

export const analyzeFoodHandler: RequestHandler = async (req, res) => {
  const body = req.body as AnalyzeFoodBody;
  const result = await analyzeFood({
    userId: req.user?.id ?? null,
    input: { text: body.text, imageUrl: body.imageUrl },
  });

  res.json({
    queryId: result.queryId,
    items: result.data.items,
    totals: result.data.totals,
    confidence: result.data.confidence,
    meta: {
      provider: result.provider,
      model: result.model,
      cached: result.cached,
      latencyMs: result.latencyMs,
    },
  });
};
