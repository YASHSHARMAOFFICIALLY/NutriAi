import { prisma } from '../config/prisma';
import { logger } from '../config/logger';
import type { AIUsage } from './provider';
import { recordAiUsageMetric } from '../services/runtimeMetrics';

export interface UsageRecord {
  userId: string | null;
  endpoint: string;
  provider: string;
  model: string;
  usage: AIUsage;
  cached: boolean;
  latencyMs: number;
}

export const recordTokenUsage = async (rec: UsageRecord): Promise<void> => {
  recordAiUsageMetric({
    endpoint: rec.endpoint,
    provider: rec.provider,
    model: rec.model,
    cached: rec.cached,
    latencyMs: rec.latencyMs,
    costUsd: rec.usage.costUsd,
    totalTokens: rec.usage.totalTokens,
  });

  logger.info(
    {
      tag: 'ai_usage',
      userId: rec.userId,
      endpoint: rec.endpoint,
      provider: rec.provider,
      model: rec.model,
      promptTokens: rec.usage.promptTokens,
      completionTokens: rec.usage.completionTokens,
      totalTokens: rec.usage.totalTokens,
      costUsd: rec.usage.costUsd,
      cached: rec.cached,
      latencyMs: rec.latencyMs,
    },
    'ai_usage',
  );

  try {
    await prisma.tokenUsage.create({
      data: {
        userId: rec.userId,
        endpoint: rec.endpoint,
        provider: rec.provider,
        model: rec.model,
        promptTokens: rec.usage.promptTokens,
        completionTokens: rec.usage.completionTokens,
        totalTokens: rec.usage.totalTokens,
        costUsd: rec.usage.costUsd,
        cached: rec.cached,
        latencyMs: rec.latencyMs,
      },
    });
  } catch (err) {
    // Metering must never break the request path.
    logger.error({ err }, 'failed to persist token usage');
  }
};
