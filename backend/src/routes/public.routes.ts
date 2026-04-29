import { Router } from 'express';
import { validate } from '../middleware/validate';
import {
  apiKeyRateLimit,
  meterApiUsage,
  requireApiKey,
  requireScope,
} from '../middleware/apiKey';
import {
  publicAnalyzeSchema,
  publicCaloriesHandler,
} from '../controllers/publicController';

export const publicRouter = Router();

// Public no-account teaser used by SEO landing pages. It is still protected by
// the app-level rate limiter and AI budget guard.
publicRouter.post(
  '/public/estimate',
  validate(publicAnalyzeSchema),
  publicCaloriesHandler,
);

// All /v1/public/* endpoints are gated by an API key, per-key rate limited,
// and usage-metered into ApiUsage.
publicRouter.use('/v1/public', requireApiKey, apiKeyRateLimit, meterApiUsage);

publicRouter.post(
  '/v1/public/calories',
  requireScope('calories:read'),
  validate(publicAnalyzeSchema),
  publicCaloriesHandler,
);
