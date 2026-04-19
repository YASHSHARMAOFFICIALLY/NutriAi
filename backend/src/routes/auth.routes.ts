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
import {
  forgotPassword,
  login,
  register,
  resendVerify,
  resetPassword,
  verifyEmail,
} from '../controllers/emailAuthController';
import { isProd } from '../config/env';

export const authRouter = Router();

// Tighter rate limit on auth endpoints to mitigate brute force against refresh.
const authLimit = rateLimit({ keyPrefix: 'rl:auth', windowMs: 60_000, max: 30 });

// Stricter limit on password-based endpoints (login/register/reset).
const passwordLimit = rateLimit({ keyPrefix: 'rl:auth:pw', windowMs: 15 * 60_000, max: 20 });

authRouter.get('/google', authLimit, googleStart);
authRouter.get('/google/callback', authLimit, googleCallback);

authRouter.post('/refresh', authLimit, refresh);
authRouter.post('/logout', authLimit, logout);
authRouter.get('/me', requireAuth, me);

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(200);

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(1).max(80).optional(),
});
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});
const verifySchema = z.object({ token: z.string().min(10).max(200) });
const emailOnlySchema = z.object({ email: emailSchema });
const resetSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordSchema,
});

authRouter.post('/register', passwordLimit, validate(registerSchema), register);
authRouter.post('/login', passwordLimit, validate(loginSchema), login);
authRouter.post('/verify-email', authLimit, validate(verifySchema), verifyEmail);
authRouter.post('/resend-verification', passwordLimit, validate(emailOnlySchema), resendVerify);
authRouter.post('/forgot-password', passwordLimit, validate(emailOnlySchema), forgotPassword);
authRouter.post('/reset-password', passwordLimit, validate(resetSchema), resetPassword);

if (!isProd) {
  const devLoginSchema = z.object({ email: z.string().email() });
  authRouter.post('/dev-login', authLimit, validate(devLoginSchema), devLogin);
}
