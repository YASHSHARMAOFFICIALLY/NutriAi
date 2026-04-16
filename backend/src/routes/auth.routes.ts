import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import {
  devLogin,
  googleCallback,
  googleStart,
  logout,
  me,
  refresh,
} from '../controllers/authController';
import { isProd } from '../config/env';

export const authRouter = Router();

// Tighter rate limit on auth endpoints to mitigate brute force against refresh.
const authLimit = rateLimit({ keyPrefix: 'rl:auth', windowMs: 60_000, max: 30 });

authRouter.get('/google', authLimit, googleStart);
authRouter.get('/google/callback', authLimit, googleCallback);

authRouter.post('/refresh', authLimit, refresh);
authRouter.post('/logout', authLimit, logout);
authRouter.get('/me', requireAuth, me);

if (!isProd) {
  const devLoginSchema = z.object({ email: z.string().email() });
  authRouter.post('/dev-login', authLimit, validate(devLoginSchema), devLogin);
}
