import type { RequestHandler } from 'express';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { RateLimitError } from '../utils/errors';
import { logger } from '../config/logger';
import { recordRateLimitBypass } from '../services/runtimeMetrics';

interface Options {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
  keyFn?: (req: Parameters<RequestHandler>[0]) => string;
}

export const rateLimit = (opts: Options = {}): RequestHandler => {
  const windowMs = opts.windowMs ?? env.RATE_LIMIT_WINDOW_MS;
  const max = opts.max ?? env.RATE_LIMIT_MAX;
  const prefix = opts.keyPrefix ?? 'rl:global';

  return async (req, res, next) => {
    const identifier = opts.keyFn ? opts.keyFn(req) : req.ip ?? 'unknown';
    const key = `${prefix}:${identifier}`;
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, windowMs);
      }
      const ttlMs = count === 1 ? windowMs : await redis.pttl(key);
      const resetSec = Math.ceil(Date.now() / 1000 + Math.max(0, ttlMs) / 1000);
      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));
      res.setHeader('X-RateLimit-Reset', String(resetSec));
      if (count > max) {
        throw new RateLimitError();
      }
    } catch (err) {
      if (err instanceof RateLimitError || !env.RATE_LIMIT_FAIL_OPEN) throw err;
      recordRateLimitBypass();
      logger.warn({ err, keyPrefix: prefix }, 'rate limit bypassed after redis failure');
      res.setHeader('X-RateLimit-Policy', 'fail-open');
    }
    next();
  };
};
