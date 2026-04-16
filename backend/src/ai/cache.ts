import { redis } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../config/logger';

const KEY_PREFIX = 'ai';

export const aiCacheKey = (provider: string, model: string, hash: string): string =>
  `${KEY_PREFIX}:${provider}:${model}:${hash}`;

export const getCached = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn({ err, key }, 'ai cache get failed');
    return null;
  }
};

export const setCached = async (key: string, value: unknown, ttlSeconds = env.AI_CACHE_TTL_SECONDS): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'ai cache set failed');
  }
};
