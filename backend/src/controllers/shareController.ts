import type { RequestHandler } from 'express';
import { z } from 'zod';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import {
  acceptInvite,
  assertCanView,
  createInvite,
  listOutgoing,
  listPendingForViewer,
  listViewable,
  revokeShare,
} from '../services/shareService';
import { sendFamilyInviteEmail } from '../services/emailService';
import { dailySummary, listMealsForDate } from '../services/mealService';
import { streakAnalytics } from '../services/analyticsService';
import { logger } from '../config/logger';

export const inviteSchema = z.object({
  email: z.string().email().max(200),
});

export const dateQuerySchema = z.object({
  date: z.coerce.date(),
});

export const inviteHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { email } = req.body as z.infer<typeof inviteSchema>;
  const { share, viewer } = await createInvite(req.user.id, email);

  // Email is best-effort — don't fail the invite if email provider is down.
  const inviterName = req.user.email.split('@')[0] ?? 'A NutriAI user';
  sendFamilyInviteEmail(viewer.email, inviterName).catch((err) => {
    logger.error({ err, shareId: share.id }, 'failed to send family invite email');
  });

  res.status(201).json({ share });
};

export const acceptHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const share = await acceptInvite(req.user.id, req.params.id);
  res.json({ share });
};

export const revokeHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const share = await revokeShare(req.user.id, req.params.id);
  res.json({ share });
};

export const viewableHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const shares = await listViewable(req.user.id);
  res.json({ shares });
};

export const pendingHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const shares = await listPendingForViewer(req.user.id);
  res.json({ shares });
};

export const outgoingHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const shares = await listOutgoing(req.user.id);
  res.json({ shares });
};

// Read-through: viewer fetches owner's meals for a date.
export const sharedMealsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const ownerId = req.params.ownerId;
  if (!ownerId) throw new BadRequestError('ownerId required');
  await assertCanView(req.user.id, ownerId);
  const { date } = req.query as unknown as z.infer<typeof dateQuerySchema>;
  const meals = await listMealsForDate(ownerId, date);
  res.json({ date: date.toISOString().slice(0, 10), meals });
};

export const sharedDailySummaryHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const ownerId = req.params.ownerId;
  if (!ownerId) throw new BadRequestError('ownerId required');
  await assertCanView(req.user.id, ownerId);
  const { date } = req.query as unknown as z.infer<typeof dateQuerySchema>;
  const summary = await dailySummary(ownerId, date);
  res.json(summary);
};

export const sharedStreakHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const ownerId = req.params.ownerId;
  if (!ownerId) throw new BadRequestError('ownerId required');
  await assertCanView(req.user.id, ownerId);
  const streak = await streakAnalytics(ownerId);
  res.json(streak);
};
