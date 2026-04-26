import type { RequestHandler } from 'express';
import { env, isProd } from '../config/env';
import { UnauthorizedError } from '../utils/errors';

export const requireMetricsToken: RequestHandler = (req, _res, next) => {
  if (!env.METRICS_BEARER_TOKEN && !isProd) {
    next();
    return;
  }

  const header = req.header('authorization');
  const expected = `Bearer ${env.METRICS_BEARER_TOKEN}`;
  if (!header || header !== expected) {
    throw new UnauthorizedError('Invalid metrics token');
  }
  next();
};
