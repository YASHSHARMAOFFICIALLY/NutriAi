import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  abandon,
  checkInToday,
  getPresets,
  getUserChallenges,
  presetsQuerySchema,
  startChallenge,
  userChallengesQuerySchema,
} from '../controllers/challengeController';

export const challengeRouter = Router();

// Public: preset list (no auth needed — used on marketing / unauthenticated views too).
challengeRouter.get('/', validate(presetsQuerySchema, 'query'), getPresets);

// Authenticated: user's challenges.
challengeRouter.get('/me', requireAuth, validate(userChallengesQuerySchema, 'query'), getUserChallenges);

const startSchema = z.object({
  challengeId: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().nullable(),
  durationDays: z.number().int().min(1).max(365),
});

challengeRouter.post('/me', requireAuth, validate(startSchema), startChallenge);
challengeRouter.post('/me/:id/check-in', requireAuth, checkInToday);
challengeRouter.delete('/me/:id', requireAuth, abandon);
