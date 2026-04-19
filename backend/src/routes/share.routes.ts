import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  acceptHandler,
  dateQuerySchema,
  inviteHandler,
  inviteSchema,
  outgoingHandler,
  pendingHandler,
  revokeHandler,
  sharedDailySummaryHandler,
  sharedMealsHandler,
  sharedStreakHandler,
  viewableHandler,
} from '../controllers/shareController';

export const shareRouter = Router();

// Owner actions
shareRouter.post('/shares/invite', requireAuth, validate(inviteSchema), inviteHandler);
shareRouter.get('/shares/outgoing', requireAuth, outgoingHandler);

// Viewer actions
shareRouter.get('/shares/viewable', requireAuth, viewableHandler);
shareRouter.get('/shares/pending', requireAuth, pendingHandler);
shareRouter.post('/shares/:id/accept', requireAuth, acceptHandler);

// Either side
shareRouter.delete('/shares/:id', requireAuth, revokeHandler);

// Read-through (viewer fetches owner data)
shareRouter.get(
  '/shares/:ownerId/meals',
  requireAuth,
  validate(dateQuerySchema, 'query'),
  sharedMealsHandler,
);
shareRouter.get(
  '/shares/:ownerId/daily-summary',
  requireAuth,
  validate(dateQuerySchema, 'query'),
  sharedDailySummaryHandler,
);
shareRouter.get('/shares/:ownerId/streak', requireAuth, sharedStreakHandler);
