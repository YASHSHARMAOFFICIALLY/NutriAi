import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import { rangeQuerySchema } from './analyticsController';
import {
  acceptFamilyInvite,
  createFamilyInvite,
  getFamilyDailyAnalytics,
  getFamilyMacroAnalytics,
  getFamilyOverview,
  getFamilyStreakAnalytics,
  removeFamilyMember,
  revokeFamilyInvite,
} from '../services/familyService';

export const createFamilyInviteSchema = z.object({
  email: z.string().email().max(254),
});

export const inviteTokenParamsSchema = z.object({
  token: z.string().min(20).max(200),
});

export const familyInviteParamsSchema = z.object({
  inviteId: z.string().uuid(),
});

export const familyMemberParamsSchema = z.object({
  memberId: z.string().uuid(),
});

export type CreateFamilyInviteBody = z.infer<typeof createFamilyInviteSchema>;
export type FamilyMemberParams = z.infer<typeof familyMemberParamsSchema>;

export const familyOverviewHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const result = await getFamilyOverview(req.user.id);
  res.json(result);
};

export const createFamilyInviteHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as CreateFamilyInviteBody;
  const result = await createFamilyInvite(req.user.id, null, body.email);
  res.status(201).json(result);
};

export const acceptFamilyInviteHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { token } = req.params as z.infer<typeof inviteTokenParamsSchema>;
  const result = await acceptFamilyInvite(req.user.id, req.user.email, token);
  res.json(result);
};

export const revokeFamilyInviteHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { inviteId } = req.params as z.infer<typeof familyInviteParamsSchema>;
  await revokeFamilyInvite(req.user.id, inviteId);
  res.status(204).send();
};

export const removeFamilyMemberHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { memberId } = req.params as FamilyMemberParams;
  await removeFamilyMember(req.user.id, memberId);
  res.status(204).send();
};

export const familyDailyAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { memberId } = req.params as FamilyMemberParams;
  const q = req.query as unknown as z.infer<typeof rangeQuerySchema>;
  const result = await getFamilyDailyAnalytics(req.user.id, memberId, { from: q.from, to: q.to });
  res.json(result);
};

export const familyMacroAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { memberId } = req.params as FamilyMemberParams;
  const q = req.query as unknown as z.infer<typeof rangeQuerySchema>;
  const result = await getFamilyMacroAnalytics(req.user.id, memberId, { from: q.from, to: q.to });
  res.json(result);
};

export const familyStreakAnalyticsHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { memberId } = req.params as FamilyMemberParams;
  const result = await getFamilyStreakAnalytics(req.user.id, memberId);
  res.json(result);
};
