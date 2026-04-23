import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { rangeQuerySchema } from '../controllers/analyticsController';
import {
  acceptFamilyInviteHandler,
  createFamilyInviteHandler,
  createFamilyInviteSchema,
  familyDailyAnalyticsHandler,
  familyInviteParamsSchema,
  familyMacroAnalyticsHandler,
  familyMemberParamsSchema,
  familyOverviewHandler,
  familyStreakAnalyticsHandler,
  inviteTokenParamsSchema,
  removeFamilyMemberHandler,
  revokeFamilyInviteHandler,
} from '../controllers/familyController';

export const familyRouter = Router();

familyRouter.get('/family', requireAuth, familyOverviewHandler);
familyRouter.post('/family/invites', requireAuth, validate(createFamilyInviteSchema), createFamilyInviteHandler);
familyRouter.post(
  '/family/invites/:token/accept',
  requireAuth,
  validate(inviteTokenParamsSchema, 'params'),
  acceptFamilyInviteHandler,
);
familyRouter.delete(
  '/family/invites/:inviteId',
  requireAuth,
  validate(familyInviteParamsSchema, 'params'),
  revokeFamilyInviteHandler,
);
familyRouter.delete(
  '/family/members/:memberId',
  requireAuth,
  validate(familyMemberParamsSchema, 'params'),
  removeFamilyMemberHandler,
);
familyRouter.get(
  '/family/members/:memberId/analytics/daily',
  requireAuth,
  validate(familyMemberParamsSchema, 'params'),
  validate(rangeQuerySchema, 'query'),
  familyDailyAnalyticsHandler,
);
familyRouter.get(
  '/family/members/:memberId/analytics/macros',
  requireAuth,
  validate(familyMemberParamsSchema, 'params'),
  validate(rangeQuerySchema, 'query'),
  familyMacroAnalyticsHandler,
);
familyRouter.get(
  '/family/members/:memberId/analytics/streak',
  requireAuth,
  validate(familyMemberParamsSchema, 'params'),
  familyStreakAnalyticsHandler,
);
