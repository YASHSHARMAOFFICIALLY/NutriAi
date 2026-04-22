import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { getAiGuardState } from '../ai/guard';
import { getRuntimeMetrics } from '../services/runtimeMetrics';

type Check = { ok: boolean; latencyMs: number; detail?: string };

const timed = async (fn: () => Promise<unknown>): Promise<Check> => {
  const started = Date.now();
  let timeout: NodeJS.Timeout | null = null;
  try {
    await Promise.race([
      fn(),
      new Promise((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error('readiness check timed out')),
          env.READINESS_CHECK_TIMEOUT_MS,
        );
      }),
    ]);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : 'unknown error',
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const aiConfig = (): Check => {
  const started = Date.now();
  if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
    return { ok: false, latencyMs: Date.now() - started, detail: 'OPENAI_API_KEY is not set' };
  }
  if (env.AI_PROVIDER === 'gemini') {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: 'Gemini provider is stubbed until @google/generative-ai is implemented',
    };
  }
  return { ok: true, latencyMs: Date.now() - started, detail: env.AI_PROVIDER };
};

export const healthHandler: RequestHandler = (_req, res) => {
  res.json({ ok: true, service: 'nutriai-backend', env: env.NODE_ENV });
};

export const readinessHandler: RequestHandler = async (_req, res) => {
  const [database, cache] = await Promise.all([
    timed(() => prisma.$queryRaw`SELECT 1`),
    timed(() => redis.ping()),
  ]);
  const ai = aiConfig();
  const storage = {
    ok: Boolean(env.AWS_S3_BUCKET),
    latencyMs: 0,
    detail: env.AWS_S3_BUCKET ? 'configured' : 'AWS_S3_BUCKET is not set',
  };

  const ok = database.ok && cache.ok && ai.ok;
  res.status(ok ? 200 : 503).json({
    ok,
    service: 'nutriai-backend',
    checks: { database, cache, ai, storage },
    aiGuard: getAiGuardState(),
  });
};

export const metricsHandler: RequestHandler = (_req, res) => {
  res.json(getRuntimeMetrics());
};
