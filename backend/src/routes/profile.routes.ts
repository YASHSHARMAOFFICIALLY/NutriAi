import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  deleteProfileHandler,
  getProfileHandler,
  upsertProfileHandler,
  upsertProfileSchema,
} from '../controllers/profileController';

export const profileRouter = Router();

profileRouter.get('/profile', requireAuth, getProfileHandler);
profileRouter.put('/profile', requireAuth, validate(upsertProfileSchema), upsertProfileHandler);
profileRouter.delete('/profile', requireAuth, deleteProfileHandler);
