import type { RequestHandler } from 'express';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { RateLimitError } from '../utils/errors';

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
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - count)));
    if (count > max) {
      throw new RateLimitError();
    }
    next();
  };
};
