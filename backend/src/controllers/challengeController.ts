import type { RequestHandler } from 'express';
import type { ChallengeCategory, ChallengeStatus } from '@prisma/client';
import { UnauthorizedError } from '../utils/errors';
import {
  abandonChallenge,
  checkIn,
  createUserChallenge,
  listPresets,
  listUserChallenges,
} from '../services/challengeService';

export const getPresets: RequestHandler = async (req, res) => {
  const { category, durationDays } = req.query as {
    category?: ChallengeCategory;
    durationDays?: string;
  };
  const challenges = await listPresets({
    category,
    durationDays: durationDays ? Number(durationDays) : undefined,
  });
  res.json({ challenges });
};

export const getUserChallenges: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { status } = req.query as { status?: ChallengeStatus };
  const challenges = await listUserChallenges(req.user.id, status);
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
