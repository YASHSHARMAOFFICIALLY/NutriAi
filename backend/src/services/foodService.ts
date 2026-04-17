import { prisma } from '../config/prisma';
import { sha256Hex } from '../utils/hash';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { getAIProvider } from '../ai';
import { canonicalize, canonicalizeText } from '../ai/canonicalize';
import { aiCacheKey, getCached, setCached } from '../ai/cache';
import { recordTokenUsage } from '../ai/usage';
import { getAssetForUser, getAssetReadUrl } from './uploadService';
import type { AICallResult, FoodAnalysisInput, FoodAnalysisResult } from '../ai/provider';
import type { FoodInputType } from '@prisma/client';

interface AnalyzeArgs {
  userId: string | null;
  input: FoodAnalysisInput;
}

interface CachedEnvelope {
  data: FoodAnalysisResult;
  model: string;
}

const ENDPOINT = 'food.analyze';

export const analyzeFood = async ({ userId, input }: AnalyzeArgs): Promise<AICallResult<FoodAnalysisResult> & { queryId: string }> => {
  if (!input.text && !input.imageUrl && !input.assetId) {
    throw new BadRequestError('Provide text, imageUrl, or assetId');
  }

  // If an assetId is supplied, resolve it to a short-lived signed URL and
  // hash by the immutable S3 key so equivalent uploads dedupe cleanly.
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

  const provider = getAIProvider();
  const canonicalInput = {
    text: input.text ? canonicalizeText(input.text) : null,
    // Use the stable asset reference (not the expiring signed URL) in the hash.
    imageUrl: assetHashPart ?? input.imageUrl ?? null,
  };
  const hash = sha256Hex(canonicalize(canonicalInput));
  const started = Date.now();

  // For text inputs the model is deterministic; for vision we use a different model.
  // We cache per (provider, model, hash). Since model is derived from input type,
  // checking with the input-type-appropriate model is fine.
  const expectedModelHint = resolvedImageUrl ? 'vision' : 'text';
  const cacheKey = aiCacheKey(provider.name, expectedModelHint, hash);
  const cached = await getCached<CachedEnvelope>(cacheKey);

  let result: FoodAnalysisResult;
  let model: string;
  let cachedFlag = false;
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

  if (cached) {
    result = cached.data;
    model = cached.model;
    cachedFlag = true;
  } else {
    const call = await provider.analyzeFood({
      text: input.text,
      imageUrl: resolvedImageUrl,
    });
    result = call.data;
    model = call.model;
    usage = call.usage;
    await setCached(cacheKey, { data: result, model });
  }

  const latencyMs = Date.now() - started;

  await recordTokenUsage({
    userId,
    endpoint: ENDPOINT,
    provider: provider.name,
    model,
    usage,
    cached: cachedFlag,
    latencyMs,
  });

  const inputType: FoodInputType = resolvedImageUrl ? 'IMAGE' : 'TEXT';

  const stored = await prisma.foodQuery.create({
    data: {
      userId,
      assetId: assetRecordId,
      inputType,
      inputText: input.text ?? null,
      // Persist the caller-provided URL; the signed URL derived from an asset
      // would be short-lived and of no value in history.
      imageUrl: input.imageUrl ?? null,
      inputHash: hash,
      totalCalories: result.totals.calories,
      totalProtein: result.totals.protein,
      totalCarbs: result.totals.carbs,
      totalFat: result.totals.fat,
      confidence: result.confidence,
      provider: provider.name,
      model,
      cached: cachedFlag,
      items: {
        create: result.items.map((it) => ({
          name: it.name,
          quantity: it.quantity ?? null,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
          confidence: it.confidence ?? null,
        })),
      },
    },
  });

  return {
    data: result,
    provider: provider.name,
    model,
    cached: cachedFlag,
    latencyMs,
    usage,
    queryId: stored.id,
  };
};
