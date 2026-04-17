import type { RequestHandler } from 'express';
import { z } from 'zod';
import { analyzeFoodPublic } from '../services/publicFoodService';

export const publicAnalyzeSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((v) => Boolean(v.text || v.imageUrl), {
    message: 'Provide text or imageUrl',
  });

export type PublicAnalyzeBody = z.infer<typeof publicAnalyzeSchema>;

export const publicCaloriesHandler: RequestHandler = async (req, res) => {
  const body = req.body as PublicAnalyzeBody;
  const result = await analyzeFoodPublic({
    text: body.text,
    imageUrl: body.imageUrl,
  });
  res.json(result);
};
