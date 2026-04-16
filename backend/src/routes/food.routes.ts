import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { analyzeFoodHandler, analyzeFoodSchema } from '../controllers/foodController';

export const foodRouter = Router();

// AI endpoints are expensive; apply a tighter per-user rate limit on top of the global one.
const aiLimit = rateLimit({
  keyPrefix: 'rl:ai',
  windowMs: 60_000,
  max: 20,
  keyFn: (req) => req.user?.id ?? req.ip ?? 'unknown',
});

foodRouter.post('/analyze-food', requireAuth, aiLimit, validate(analyzeFoodSchema), analyzeFoodHandler);
