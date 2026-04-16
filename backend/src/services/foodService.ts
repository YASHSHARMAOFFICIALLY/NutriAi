import { prisma } from '../config/prisma';
import { sha256Hex } from '../utils/hash';
import { BadRequestError } from '../utils/errors';
import { getAIProvider } from '../ai';
import { canonicalize, canonicalizeText } from '../ai/canonicalize';
import { aiCacheKey, getCached, setCached } from '../ai/cache';
import { recordTokenUsage } from '../ai/usage';
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
  if (!input.text && !input.imageUrl) {
    throw new BadRequestError('Provide text or imageUrl');
  }

  const provider = getAIProvider();
  const canonicalInput = {
    text: input.text ? canonicalizeText(input.text) : null,
    imageUrl: input.imageUrl ?? null,
  };
  const hash = sha256Hex(canonicalize(canonicalInput));
  const started = Date.now();

  // For text inputs the model is deterministic; for vision we use a different model.
  // We cache per (provider, model, hash). Since model is derived from input type,
  // checking with the input-type-appropriate model is fine.
  const expectedModelHint = input.imageUrl ? 'vision' : 'text';
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
    const call = await provider.analyzeFood(input);
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

  const inputType: FoodInputType = input.imageUrl ? 'IMAGE' : 'TEXT';

  const stored = await prisma.foodQuery.create({
    data: {
      userId,
      inputType,
      inputText: input.text ?? null,
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
