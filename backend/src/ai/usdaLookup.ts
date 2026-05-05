// USDA FoodData Central — free public API, no key required for basic search.
// Docs: https://fdc.nal.usda.gov/api-guide.html
// We use the /foods/search endpoint and pull SR Legacy / Foundation foods
// because they have reliable per-100g nutrient data.

import { logger } from '../config/logger';
import type { FoodAnalysisResult, FoodItemResult } from './provider';
import { scaleToTenth } from '../utils/number';

const BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY'; // DEMO_KEY gives 30 req/hr anonymous — swap for real key via USDA_API_KEY env
const CONFIDENCE_THRESHOLD = 0.72;

interface UsdaNutrient {
  nutrientId: number;
  value: number;
}

interface UsdaFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: UsdaNutrient[];
  score?: number;
}

interface UsdaSearchResponse {
  foods: UsdaFood[];
  totalHits: number;
}

// USDA nutrient IDs we care about.
const NID = {
  calories: 1008,
  protein:  1003,
  carbs:    1005,
  fat:      1004,
} as const;

function extractNutrient(nutrients: UsdaNutrient[], id: number): number {
  return nutrients.find((n) => n.nutrientId === id)?.value ?? 0;
}

// How many grams to assume when no quantity is given.
// A "serving" default of 100g keeps the per-100g USDA values as-is.
const DEFAULT_GRAMS = 100;

function parseGrams(quantity: string | null | undefined): number {
  if (!quantity) return DEFAULT_GRAMS;
  const m = quantity.match(/(\d+(\.\d+)?)\s*g/i);
  return m ? parseFloat(m[1]) : DEFAULT_GRAMS;
}

// Extract the first noun phrase from an input like "grilled chicken breast 150g"
// so we can send a clean search query to USDA.
function extractFoodName(text: string): string {
  return text
    .replace(/\d+(\.\d+)?\s*(g|ml|oz|lb|kg|cup|tbsp|tsp|piece|slice|medium|large|small)\b/gi, '')
    .replace(/\b(grilled|baked|fried|boiled|steamed|raw|cooked|chopped|diced|sliced)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function extractQuantity(text: string): string | null {
  const m = text.match(/(\d+(\.\d+)?)\s*(g|ml|oz|lb|kg)\b/i);
  return m ? m[0] : null;
}

interface UsdaResult {
  result: FoodAnalysisResult;
  source: 'usda';
}

// Returns null if USDA can't find the food or confidence is too low.
// Only works for simple single-food queries ("chicken breast 150g").
// Multi-food / complex descriptions fall through to AI.
export async function lookupUsda(text: string): Promise<UsdaResult | null> {
  // Heuristic: if the input contains commas, "and", "with", or "+" it's probably
  // a mixed meal — skip USDA and go straight to AI.
  if (/[,+]|\band\b|\bwith\b|\bplus\b/i.test(text)) return null;

  const foodName = extractFoodName(text);
  if (!foodName) return null;
  const quantity = extractQuantity(text);
  const grams = parseGrams(quantity);

  const url = new URL(`${BASE}/foods/search`);
  url.searchParams.set('api_key', process.env.USDA_API_KEY ?? USDA_API_KEY);
  url.searchParams.set('query', foodName);
  url.searchParams.set('dataType', 'Foundation,SR Legacy');
  url.searchParams.set('pageSize', '3');
  url.searchParams.set('nutrients', [NID.calories, NID.protein, NID.carbs, NID.fat].join(','));

  let food: UsdaFood | null = null;
  try {
    const resp = await fetch(url.toString(), { signal: AbortSignal.timeout(4000) });
    if (!resp.ok) {
      logger.debug({ status: resp.status }, 'USDA API non-200; falling through to AI');
      return null;
    }
    const json = (await resp.json()) as UsdaSearchResponse;
    food = json.foods?.[0] ?? null;
  } catch (err) {
    logger.debug({ err }, 'USDA lookup failed; falling through to AI');
    return null;
  }

  if (!food) return null;

  // USDA scores measure keyword relevance; low score → low confidence.
  const score = food.score ?? 100;
  const confidence = Math.min(score / 1000, 1); // rough normalisation
  if (confidence < CONFIDENCE_THRESHOLD) return null;

  // USDA nutrient values are per 100g. Scale to requested grams.
  const scale = grams / 100;

  const item: FoodItemResult = {
    name: food.description,
    quantity: quantity ?? `${DEFAULT_GRAMS}g`,
    calories: scaleToTenth(extractNutrient(food.foodNutrients, NID.calories), scale),
    protein: scaleToTenth(extractNutrient(food.foodNutrients, NID.protein), scale),
    carbs: scaleToTenth(extractNutrient(food.foodNutrients, NID.carbs), scale),
    fat: scaleToTenth(extractNutrient(food.foodNutrients, NID.fat), scale),
    confidence,
  };

  const totals = {
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
  };

  logger.debug({ fdcId: food.fdcId, name: food.description, confidence }, 'USDA hit');

  return {
    source: 'usda',
    result: { items: [item], totals, confidence },
  };
}
