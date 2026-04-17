import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  confirmHandler,
  confirmSchema,
  presignHandler,
  presignSchema,
} from '../controllers/uploadController';

export const uploadRouter = Router();

uploadRouter.post('/uploads/presign', requireAuth, validate(presignSchema), presignHandler);
uploadRouter.post('/uploads/confirm', requireAuth, validate(confirmSchema), confirmHandler);
