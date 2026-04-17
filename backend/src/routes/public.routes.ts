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

// All /v1/public/* endpoints are gated by an API key, per-key rate limited,
// and usage-metered into ApiUsage.
publicRouter.use('/v1/public', requireApiKey, apiKeyRateLimit, meterApiUsage);

publicRouter.post(
  '/v1/public/calories',
  requireScope('calories:read'),
  validate(publicAnalyzeSchema),
  publicCaloriesHandler,
);
