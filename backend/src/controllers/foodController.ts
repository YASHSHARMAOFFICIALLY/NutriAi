import type { RequestHandler } from 'express';
import { z } from 'zod';
import { analyzeFood } from '../services/foodService';
import { safeHttpsUrlSchema } from '../utils/schemas';

export const analyzeFoodSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: safeHttpsUrlSchema.optional(),
    assetId: z.string().uuid().optional(),
  })
  .refine((v) => Boolean(v.text || v.imageUrl || v.assetId), {
    message: 'Provide text, imageUrl, or assetId',
  });

export type AnalyzeFoodBody = z.infer<typeof analyzeFoodSchema>;

export const analyzeFoodHandler: RequestHandler = async (req, res) => {
  const body = req.body as AnalyzeFoodBody;
  const result = await analyzeFood({
    userId: req.user?.id ?? null,
    input: { text: body.text, imageUrl: body.imageUrl, assetId: body.assetId },
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
