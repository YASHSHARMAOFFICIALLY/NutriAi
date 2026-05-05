import type { RequestHandler } from 'express';
import { z } from 'zod';
import { requireUser } from '../utils/requestUser';
import {
  abandonChallenge,
  checkIn,
  createUserChallenge,
  listPresets,
  listUserChallenges,
} from '../services/challengeService';

export const presetsQuerySchema = z.object({
  category: z.enum(['SUGAR', 'PROTEIN', 'HYDRATION', 'CALORIES', 'STEPS', 'HABIT']).optional(),
  durationDays: z.coerce.number().int().positive().max(365).optional(),
});

export const userChallengesQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ABANDONED']).optional(),
});

export const getPresets: RequestHandler = async (req, res) => {
  const query = req.query as unknown as z.infer<typeof presetsQuerySchema>;
  const challenges = await listPresets(query);
  res.json({ challenges });
};

export const getUserChallenges: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const query = req.query as unknown as z.infer<typeof userChallengesQuerySchema>;
  const challenges = await listUserChallenges(user.id, query.status);
  res.json({ challenges });
};

export const startChallenge: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const { challengeId, title, description, durationDays } = req.body as {
    challengeId?: string;
    title: string;
    description?: string;
    durationDays: number;
  };
  const uc = await createUserChallenge(user.id, {
    challengeId,
    title,
    description,
    durationDays,
  });
  res.status(201).json({ challenge: uc });
};

export const checkInToday: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const uc = await checkIn(user.id, req.params.id);
  res.json({ challenge: uc });
};

export const abandon: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const uc = await abandonChallenge(user.id, req.params.id);
  res.json({ challenge: uc });
};
