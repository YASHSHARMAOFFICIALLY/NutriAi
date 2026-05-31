import { prisma } from '../config/prisma';
import { AppError, BadRequestError, ForbiddenError, RateLimitError } from '../utils/errors';
import { startOfUtcDay } from '../utils/date';
import { countWords } from '../utils/text';
import { isPro, getUserPlan } from './paymentService';

// ── Tier helpers ──────────────────────────────────────────────────────────────

export const isUserPro = async (userId: string): Promise<boolean> => {
  const plan = await getUserPlan(userId);
  return isPro(plan);
};

// ── Free-tier limits (Pro users bypass these) ─────────────────────────────────

const FREE_TEXT_ANALYSIS_DAILY_LIMIT = 5;
const FREE_CHAT_DAILY_LIMIT = 3;

export const assertFoodTextAllowed = (text: string, maxWords: number): void => {
  const words = countWords(text);
  if (words > maxWords) {
    throw new BadRequestError(`Food text is limited to ${maxWords} words`, {
      maxWords,
      words,
    });
  }
};

export const assertDailyTextAnalysisAllowed = async (
  userId: string,
  userIsPro: boolean,
  now: Date = new Date(),
): Promise<void> => {
  if (userIsPro) return;

  const usedToday = await prisma.foodQuery.count({
    where: {
      userId,
      inputType: 'TEXT',
      createdAt: { gte: startOfUtcDay(now) },
    },
  });

  if (usedToday >= FREE_TEXT_ANALYSIS_DAILY_LIMIT) {
    throw new RateLimitError(
      `Free plan allows ${FREE_TEXT_ANALYSIS_DAILY_LIMIT} text analyses per day. Upgrade to Pro for unlimited.`,
    );
  }
};

export const assertImageAnalysisAllowed = async (
  userId: string,
  userIsPro: boolean,
  dailyImageLimit: number,
  now: Date = new Date(),
): Promise<void> => {
  if (!userIsPro) {
    throw new ForbiddenError(
      'Image analysis is a Pro feature. Upgrade to Pro to scan food photos.',
    );
  }

  // Pro users still have a per-day safety cap from admin settings.
  const usedToday = await prisma.foodQuery.count({
    where: {
      userId,
      inputType: 'IMAGE',
      createdAt: { gte: startOfUtcDay(now) },
    },
  });

  if (usedToday >= dailyImageLimit) {
    throw new RateLimitError(
      `Daily image analysis limit reached. You can analyze ${dailyImageLimit} photos per day.`,
    );
  }
};

export const getChatDailyLimit = (userIsPro: boolean, adminLimit: number): number => {
  return userIsPro ? adminLimit : FREE_CHAT_DAILY_LIMIT;
};

export const assertDailyAiBudgetAllowed = async (
  dailyBudgetUsd: number,
  now: Date = new Date(),
): Promise<void> => {
  const aggregate = await prisma.tokenUsage.aggregate({
    _sum: { costUsd: true },
    where: {
      createdAt: { gte: startOfUtcDay(now) },
      costUsd: { gt: 0 },
    },
  });

  const spentToday = aggregate._sum.costUsd ?? 0;
  if (spentToday >= dailyBudgetUsd) {
    throw new AppError(
      503,
      'AI_BUDGET_EXHAUSTED',
      `AI is temporarily unavailable because today's budget of $${dailyBudgetUsd.toFixed(2)} has been used.`,
      { dailyBudgetUsd, spentToday: Number(spentToday.toFixed(4)) },
    );
  }
};
