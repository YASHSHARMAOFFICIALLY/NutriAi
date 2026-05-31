import type { ChallengeCategory, ChallengeStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { BadRequestError, NotFoundError, ForbiddenError, RateLimitError } from '../utils/errors';
import { isUserPro } from './aiPolicy';

const FREE_ACTIVE_CHALLENGE_LIMIT = 1;

export interface CreateUserChallengeInput {
  challengeId?: string;
  title: string;
  description?: string | null;
  durationDays: number;
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export const listPresets = async (filters: { category?: ChallengeCategory; durationDays?: number }) => {
  return prisma.challenge.findMany({
    where: {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.durationDays ? { durationDays: filters.durationDays } : {}),
    },
    orderBy: [{ durationDays: 'asc' }, { category: 'asc' }],
  });
};

export const listUserChallenges = async (userId: string, status?: ChallengeStatus) => {
  return prisma.userChallenge.findMany({
    where: { userId, ...(status ? { status } : {}) },
    include: { challenge: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const createUserChallenge = async (userId: string, input: CreateUserChallengeInput) => {
  // Validate the preset exists if a challengeId was given.
  if (input.challengeId) {
    const preset = await prisma.challenge.findUnique({ where: { id: input.challengeId } });
    if (!preset) throw new NotFoundError('Challenge preset not found');
  }

  // Prevent starting the same preset twice while still active.
  if (input.challengeId) {
    const existing = await prisma.userChallenge.findFirst({
      where: { userId, challengeId: input.challengeId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestError('You already have this challenge active.');
  }

  // Free users: limited active challenges.
  const userPro = await isUserPro(userId);
  if (!userPro) {
    const activeCount = await prisma.userChallenge.count({
      where: { userId, status: 'ACTIVE' },
    });
    if (activeCount >= FREE_ACTIVE_CHALLENGE_LIMIT) {
      throw new RateLimitError(
        `Free plan allows ${FREE_ACTIVE_CHALLENGE_LIMIT} active challenge. Upgrade to Pro for unlimited.`,
      );
    }
  }

  return prisma.userChallenge.create({
    data: {
      userId,
      challengeId: input.challengeId ?? null,
      title: input.title,
      description: input.description ?? null,
      durationDays: input.durationDays,
    },
    include: { challenge: true },
  });
};

export const checkIn = async (userId: string, userChallengeId: string) => {
  const uc = await prisma.userChallenge.findUnique({ where: { id: userChallengeId } });
  if (!uc) throw new NotFoundError('User challenge not found');
  if (uc.userId !== userId) throw new ForbiddenError();
  if (uc.status !== 'ACTIVE') throw new BadRequestError('This challenge is no longer active.');

  const today = isoToday();
  const lastDate = uc.lastCheckInDate?.toISOString().slice(0, 10);
  if (lastDate === today) throw new BadRequestError('Already checked in today.');

  const newDays = uc.daysCheckedIn + 1;
  const completed = newDays >= uc.durationDays;

  return prisma.userChallenge.update({
    where: { id: userChallengeId },
    data: {
      daysCheckedIn: newDays,
      lastCheckInDate: new Date(),
      status: completed ? 'COMPLETED' : 'ACTIVE',
    },
    include: { challenge: true },
  });
};

export const abandonChallenge = async (userId: string, userChallengeId: string) => {
  const uc = await prisma.userChallenge.findUnique({ where: { id: userChallengeId } });
  if (!uc) throw new NotFoundError('User challenge not found');
  if (uc.userId !== userId) throw new ForbiddenError();
  if (uc.status !== 'ACTIVE') throw new BadRequestError('Challenge is not active.');

  return prisma.userChallenge.update({
    where: { id: userChallengeId },
    data: { status: 'ABANDONED' },
    include: { challenge: true },
  });
};
