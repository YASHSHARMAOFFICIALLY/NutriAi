import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createTelegramLinkHandler,
  telegramStatusHandler,
  telegramWebhookHandler,
  unlinkTelegramHandler,
} from '../controllers/telegramController';

export const telegramRouter = Router();
export const telegramWebhookRouter = Router();

telegramWebhookRouter.post('/telegram/webhook', telegramWebhookHandler);
telegramRouter.get('/telegram/status', requireAuth, telegramStatusHandler);
telegramRouter.post('/telegram/link-token', requireAuth, createTelegramLinkHandler);
telegramRouter.delete('/telegram/unlink', requireAuth, unlinkTelegramHandler);
