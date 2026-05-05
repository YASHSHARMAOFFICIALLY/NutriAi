import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { requireUser } from '../utils/requestUser';
import { env, isProd } from '../config/env';
import {
  createTelegramLink,
  getTelegramStatus,
  unlinkTelegramAccount,
} from '../services/telegramAccountService';
import { handleTelegramUpdate, type TelegramUpdate } from '../services/telegramService';

export const telegramStatusHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const status = await getTelegramStatus(user.id);
  res.json(status);
};

export const createTelegramLinkHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  const link = await createTelegramLink(user.id);
  res.status(201).json(link);
};

export const unlinkTelegramHandler: RequestHandler = async (req, res) => {
  const user = requireUser(req);
  await unlinkTelegramAccount(user.id);
  res.status(204).end();
};

export const telegramWebhookHandler: RequestHandler = async (req, res) => {
  if (isProd && !env.TELEGRAM_WEBHOOK_SECRET) {
    throw new UnauthorizedError('Telegram webhook secret is required in production');
  }

  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const header = req.header('x-telegram-bot-api-secret-token');
    if (header !== env.TELEGRAM_WEBHOOK_SECRET) {
      throw new UnauthorizedError('Invalid Telegram webhook secret');
    }
  }

  await handleTelegramUpdate(req.body as TelegramUpdate);
  res.json({ ok: true });
};
