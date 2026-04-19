import type { Request, RequestHandler } from 'express';
import type { ApiKey } from '@prisma/client';
import { redis } from '../config/redis';
import { UnauthorizedError, RateLimitError, ForbiddenError } from '../utils/errors';
import { findActiveByToken, recordApiUsage, touchLastUsed } from '../services/apiKeyService';

declare module 'express-serve-static-core' {
  interface Request {
    apiKey?: ApiKey;
  }
}

const extractToken = (req: Request): string | null => {
  const header = req.header('x-api-key');
  if (header && header.trim().length > 0) return header.trim();
  const auth = req.header('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const t = auth.slice(7).trim();
    if (t.startsWith('nk_')) return t;
  }
  return null;
};

export const requireApiKey: RequestHandler = async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw new UnauthorizedError('Missing API key');

  const key = await findActiveByToken(token);
  if (!key) throw new UnauthorizedError('Invalid API key');

  req.apiKey = key;
  // Best-effort lastUsedAt update; failure is non-fatal.
  touchLastUsed(key.id).catch(() => undefined);
  next();
};

export const requireScope = (scope: string): RequestHandler => {
  return (req, _res, next) => {
    const key = req.apiKey;
    if (!key) throw new UnauthorizedError('Missing API key');
    // Empty scopes array = no permissions. Use '*' to grant all scopes.
    if (!key.scopes.includes('*') && !key.scopes.includes(scope)) {
      throw new ForbiddenError(`API key is missing required scope: ${scope}`);
    }
    next();
  };
};

// Per-key Redis token-bucket-lite using incr + pexpire, like the global
// limiter but keyed by apiKey.id with the key's own `rateLimitPerMin`.
export const apiKeyRateLimit: RequestHandler = async (req, res, next) => {
  const key = req.apiKey;
  if (!key) throw new UnauthorizedError('Missing API key');

  const bucket = `rl:apiKey:${key.id}`;
  const count = await redis.incr(bucket);
  if (count === 1) {
    await redis.pexpire(bucket, 60_000);
  }
  res.setHeader('X-RateLimit-Limit', String(key.rateLimitPerMin));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, key.rateLimitPerMin - count)));
  if (count > key.rateLimitPerMin) {
    throw new RateLimitError();
  }
  next();
};

// Wrap a public route with response-time metering into ApiUsage.
export const meterApiUsage: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const key = req.apiKey;
    if (!key) return;
    recordApiUsage({
      apiKeyId: key.id,
      endpoint: `${req.method} ${req.baseUrl ?? ''}${req.route?.path ?? req.path}`,
      statusCode: res.statusCode,
      latencyMs: Date.now() - start,
    }).catch(() => undefined);
  });
  next();
};
