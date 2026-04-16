import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { historyQuerySchema, listHistoryHandler } from '../controllers/historyController';

export const historyRouter = Router();

historyRouter.get('/history', requireAuth, validate(historyQuerySchema, 'query'), listHistoryHandler);
