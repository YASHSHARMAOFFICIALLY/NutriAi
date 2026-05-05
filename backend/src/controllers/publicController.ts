import type { RequestHandler } from 'express';
import { z } from 'zod';
import { analyzeFoodPublic } from '../services/publicFoodService';
import { trackPageVisit } from '../services/siteVisitService';
import { safeHttpsUrlSchema } from '../utils/schemas';

export const publicAnalyzeSchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    imageUrl: safeHttpsUrlSchema.optional(),
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

export const pageVisitSchema = z.object({
  visitorId: z.string().trim().min(8).max(120).optional(),
  path: z.string().trim().min(1).max(500),
  referrer: z.string().trim().max(1000).nullable().optional(),
});

export const pageVisitHandler: RequestHandler = async (req, res) => {
  await trackPageVisit(req, req.body as z.infer<typeof pageVisitSchema>);
  res.status(204).send();
};
