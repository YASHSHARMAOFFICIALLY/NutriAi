import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createWeightHandler,
  createWeightSchema,
  deleteWeightHandler,
  listWeightHandler,
  listWeightQuerySchema,
} from '../controllers/weightController';

export const weightRouter = Router();

weightRouter.post('/weight', requireAuth, validate(createWeightSchema), createWeightHandler);
weightRouter.get('/weight', requireAuth, validate(listWeightQuerySchema, 'query'), listWeightHandler);
weightRouter.delete('/weight/:id', requireAuth, deleteWeightHandler);
