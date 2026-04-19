import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError, BadRequestError } from '../utils/errors';
import {
  abandonChallenge,
  checkIn,
  createUserChallenge,
  listPresets,
  listUserChallenges,
} from '../services/challengeService';

const presetsQuerySchema = z.object({
  category: z.enum(['SUGAR', 'PROTEIN', 'HYDRATION', 'CALORIES', 'STEPS', 'HABIT']).optional(),
  durationDays: z.coerce.number().int().positive().max(365).optional(),
});

const userChallengesQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
});

export const getPresets: RequestHandler = async (req, res) => {
  const parsed = presetsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new BadRequestError('Invalid query parameters', parsed.error.flatten());
  const challenges = await listPresets(parsed.data);
  res.json({ challenges });
};

export const getUserChallenges: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const parsed = userChallengesQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new BadRequestError('Invalid query parameters', parsed.error.flatten());
  const challenges = await listUserChallenges(req.user.id, parsed.data.status);
  res.json({ challenges });
};

export const startChallenge: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { challengeId, title, description, durationDays } = req.body as {
    challengeId?: string;
    title: string;
    description?: string;
    durationDays: number;
  };
  const uc = await createUserChallenge(req.user.id, {
    challengeId,
    title,
    description,
    durationDays,
  });
  res.status(201).json({ challenge: uc });
};

export const checkInToday: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const uc = await checkIn(req.user.id, req.params.id);
  res.json({ challenge: uc });
};

export const abandon: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const uc = await abandonChallenge(req.user.id, req.params.id);
  res.json({ challenge: uc });
};
