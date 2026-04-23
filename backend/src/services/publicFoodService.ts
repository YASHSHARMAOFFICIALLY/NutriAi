import { sha256Hex } from '../utils/hash';
import { BadRequestError } from '../utils/errors';
import { getAIProvider } from '../ai';
import { canonicalize, canonicalizeText } from '../ai/canonicalize';
import { aiCacheKey, getCached, setCached } from '../ai/cache';
import { recordTokenUsage } from '../ai/usage';
import { guardedAiCall } from '../ai/guard';
import type { FoodAnalysisResult } from '../ai/provider';
import { assertDailyAiBudgetAllowed, assertFoodTextAllowed } from './aiPolicy';
import { getAiSettings } from './appSettingsService';

interface PublicAnalyzeArgs {
  text?: string;
  imageUrl?: string;
}

interface CachedEnvelope {
  data: FoodAnalysisResult;
  model: string;
}

const ENDPOINT = 'public.calories';

// Public-API food analysis: reuses the same provider + cache + metering path
// as the authenticated endpoint, but never persists a FoodQuery row. B2B
// callers get a stateless response; internal usage is metered via ApiUsage
// (see meterApiUsage middleware).
export const analyzeFoodPublic = async ({ text, imageUrl }: PublicAnalyzeArgs) => {
  const aiSettings = await getAiSettings();
  if (!text && !imageUrl) {
    throw new BadRequestError('Provide text or imageUrl');
  }
  if (text) {
    assertFoodTextAllowed(text, aiSettings.aiFoodTextMaxWords);
  }

  const provider = getAIProvider();
  const canonicalInput = {
    text: text ? canonicalizeText(text) : null,
    imageUrl: imageUrl ?? null,
  };
  const hash = sha256Hex(canonicalize(canonicalInput));
  const started = Date.now();

  const cacheKey = aiCacheKey(provider.name, ENDPOINT, hash);
  const cached = await getCached<CachedEnvelope>(cacheKey);

  let data: FoodAnalysisResult;
  let model: string;
  let cachedFlag = false;
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

  if (cached) {
    data = cached.data;
    model = cached.model;
    cachedFlag = true;
  } else {
    await assertDailyAiBudgetAllowed(aiSettings.aiDailyBudgetUsd);
    const call = await guardedAiCall(() => provider.analyzeFood({ text, imageUrl }));
    data = call.data;
    model = call.model;
    usage = call.usage;
    await setCached(cacheKey, { data, model });
  }

  const latencyMs = Date.now() - started;

  await recordTokenUsage({
    userId: null,
    endpoint: ENDPOINT,
    provider: provider.name,
    model,
    usage,
    cached: cachedFlag,
    latencyMs,
  });

  return {
    items: data.items,
    totals: data.totals,
    confidence: data.confidence,
    meta: {
      provider: provider.name,
      model,
      cached: cachedFlag,
      latencyMs,
    },
  };
};
