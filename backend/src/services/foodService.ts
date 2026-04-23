import { prisma } from '../config/prisma';
import { sha256Hex } from '../utils/hash';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { getAIProvider } from '../ai';
import { canonicalize, canonicalizeText } from '../ai/canonicalize';
import { aiCacheKey, getCached, setCached } from '../ai/cache';
import { recordTokenUsage } from '../ai/usage';
import { getAssetForUser, getAssetReadUrl } from './uploadService';
import { lookupDb } from '../ai/dbLookup';
import { lookupUsda } from '../ai/usdaLookup';
import { guardedAiCall } from '../ai/guard';
import type { AICallResult, FoodAnalysisInput, FoodAnalysisResult } from '../ai/provider';
import type { FoodInputType } from '@prisma/client';
import {
  assertDailyAiBudgetAllowed,
  assertDailyImageAnalysisAllowed,
  assertFoodTextAllowed,
} from './aiPolicy';
import { getAiSettings } from './appSettingsService';

interface AnalyzeArgs {
  userId: string | null;
  input: FoodAnalysisInput;
}

interface CachedEnvelope {
  data: FoodAnalysisResult;
  model: string;
}

const ENDPOINT = 'food.analyze';

export const analyzeFood = async ({
  userId,
  input,
}: AnalyzeArgs): Promise<AICallResult<FoodAnalysisResult> & { queryId: string }> => {
  const aiSettings = await getAiSettings();
  if (!input.text && !input.imageUrl && !input.assetId) {
    throw new BadRequestError('Provide text, imageUrl, or assetId');
  }
  if (input.text) {
    assertFoodTextAllowed(input.text, aiSettings.aiFoodTextMaxWords);
  }

  // Resolve asset → signed URL + stable hash part.
  let resolvedImageUrl = input.imageUrl ?? undefined;
  let assetHashPart: string | null = null;
  let assetRecordId: string | null = null;
  if (input.assetId) {
    if (!userId) throw new UnauthorizedError();
    const asset = await getAssetForUser(userId, input.assetId);
    resolvedImageUrl = await getAssetReadUrl(asset);
    assetHashPart = `${asset.bucket}/${asset.key}`;
    assetRecordId = asset.id;
  }

  const started = Date.now();
  const canonicalInput = {
    text: input.text ? canonicalizeText(input.text) : null,
    imageUrl: assetHashPart ?? input.imageUrl ?? null,
  };
  const hash = sha256Hex(canonicalize(canonicalInput));
  const isImageQuery = !!resolvedImageUrl;
  const inputType: FoodInputType = isImageQuery ? 'IMAGE' : 'TEXT';
  if (isImageQuery && userId) {
    await assertDailyImageAnalysisAllowed(userId, aiSettings.aiImageDailyLimit);
  }

  // ── Tier 0: Redis cache (identical query, any source) ──────────────────────
  const provider = getAIProvider();
  const cacheKey = aiCacheKey(provider.name, ENDPOINT, hash);
  const cached = await getCached<CachedEnvelope>(cacheKey);

  if (cached) {
    const latencyMs = Date.now() - started;
    await recordTokenUsage({
      userId,
      endpoint: ENDPOINT,
      provider: 'cache',
      model: cached.model,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
      cached: true,
      latencyMs,
    });

    const stored = await prisma.foodQuery.create({
      data: {
        userId,
        assetId: assetRecordId,
        inputType,
        inputText: input.text ?? null,
        imageUrl: input.imageUrl ?? null,
        inputHash: hash,
        totalCalories: cached.data.totals.calories,
        totalProtein: cached.data.totals.protein,
        totalCarbs: cached.data.totals.carbs,
        totalFat: cached.data.totals.fat,
        confidence: cached.data.confidence,
        provider: 'cache',
        model: cached.model,
        cached: true,
        items: { create: cached.data.items.map(mapItem) },
      },
    });

    return {
      data: cached.data,
      provider: 'cache',
      model: cached.model,
      cached: true,
      latencyMs,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
      queryId: stored.id,
    };
  }

  // ── Tier 1: DB history lookup (text queries only) ──────────────────────────
  // Check if we've previously analysed a high-confidence match for this food.
  let result: FoodAnalysisResult | null = null;
  let resultProvider = provider.name;
  let resultModel = '';
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

  if (!isImageQuery && input.text) {
    const dbHit = await lookupDb(input.text);
    if (dbHit) {
      result = dbHit.result;
      resultProvider = 'db';
      resultModel = 'db-lookup-v1';
    }
  }

  // ── Tier 2: USDA FoodData Central (text queries only) ─────────────────────
  // Free public nutrition database — great for simple single-food queries.
  if (!result && !isImageQuery && input.text) {
    const usdaHit = await lookupUsda(input.text);
    if (usdaHit) {
      result = usdaHit.result;
      resultProvider = 'usda';
      resultModel = 'usda-fdc-v1';
    }
  }

  // ── Tier 3: AI provider (OpenAI / Gemini / stub) ───────────────────────────
  if (!result) {
    await assertDailyAiBudgetAllowed(aiSettings.aiDailyBudgetUsd);
    const call = await guardedAiCall(() => provider.analyzeFood({
      text: input.text,
      imageUrl: resolvedImageUrl,
    }));
    result = call.data;
    resultProvider = provider.name;
    resultModel = call.model;
    usage = call.usage;
  }

  // Cache the result (keyed to the AI provider so USDA/DB results don't
  // pollute AI-specific cache slots).
  await setCached(cacheKey, { data: result, model: resultModel });

  const latencyMs = Date.now() - started;

  await recordTokenUsage({
    userId,
    endpoint: ENDPOINT,
    provider: resultProvider,
    model: resultModel,
    usage,
    cached: false,
    latencyMs,
  });

  const stored = await prisma.foodQuery.create({
    data: {
      userId,
      assetId: assetRecordId,
      inputType,
      inputText: input.text ?? null,
      imageUrl: input.imageUrl ?? null,
      inputHash: hash,
      totalCalories: result.totals.calories,
      totalProtein: result.totals.protein,
      totalCarbs: result.totals.carbs,
      totalFat: result.totals.fat,
      confidence: result.confidence,
      provider: resultProvider,
      model: resultModel,
      cached: false,
      items: { create: result.items.map(mapItem) },
    },
  });

  return {
    data: result,
    provider: resultProvider,
    model: resultModel,
    cached: false,
    latencyMs,
    usage,
    queryId: stored.id,
  };
};

const mapItem = (it: FoodAnalysisResult['items'][number]) => ({
  name: it.name,
  quantity: it.quantity ?? null,
  calories: it.calories,
  protein: it.protein,
  carbs: it.carbs,
  fat: it.fat,
  confidence: it.confidence ?? null,
});
