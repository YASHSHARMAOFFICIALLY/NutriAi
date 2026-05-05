// Tier-1 DB lookup: find a previously-analysed FoodItem that closely matches
// the incoming text, skipping the AI entirely.
//
// Strategy:
//   1. Normalize both the stored name and the incoming text (lowercase, trim).
//   2. Look for an exact normalized match first (fastest + most reliable).
//   3. Fall back to a Postgres ILIKE prefix search for the longest token.
//
// We only return a hit when the stored item had high confidence (≥ 0.85)
// so we don't propagate low-quality past guesses.

import { prisma } from '../config/prisma';
import { canonicalizeText } from './canonicalize';
import { logger } from '../config/logger';
import type { FoodAnalysisResult, FoodItemResult } from './provider';
import { scaleToTenth } from '../utils/number';

const MIN_CONFIDENCE = 0.85;

interface DbResult {
  result: FoodAnalysisResult;
  source: 'db';
}

function parseGramsFromText(text: string): number {
  const m = text.match(/(\d+(\.\d+)?)\s*g\b/i);
  return m ? parseFloat(m[1]) : 100;
}

function stripQuantity(text: string): string {
  return text
    .replace(/\d+(\.\d+)?\s*(g|ml|oz|lb|kg|cup|tbsp|tsp|piece|slice)\b/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export async function lookupDb(text: string): Promise<DbResult | null> {
  // Multi-food queries are not suitable for a single-item DB hit.
  if (/[,+]|\band\b|\bwith\b|\bplus\b/i.test(text)) return null;

  const foodOnly = canonicalizeText(stripQuantity(text));
  const grams = parseGramsFromText(text);

  try {
    // Try exact name match first.
    let item = await prisma.foodItem.findFirst({
      where: { name: { equals: foodOnly, mode: 'insensitive' } },
      orderBy: { confidence: 'desc' },
    });

    // Fall back to prefix search on the longest word.
    if (!item) {
      const longestWord = foodOnly
        .split(' ')
        .reduce((a, b) => (b.length > a.length ? b : a), '');
      if (longestWord.length >= 4) {
        item = await prisma.foodItem.findFirst({
          where: { name: { contains: longestWord, mode: 'insensitive' } },
          orderBy: { confidence: 'desc' },
        });
      }
    }

    if (!item || (item.confidence ?? 0) < MIN_CONFIDENCE) return null;

    // Stored values are typically for the item's own quantity.
    // We re-scale to the quantity in the current request.
    // If stored item has a quantity we can parse, scale proportionally.
    const storedGrams = parseGramsFromText(item.quantity ?? '100g');
    const scale = grams / (storedGrams || 100);

    const result: FoodItemResult = {
      name: item.name,
      quantity: `${grams}g`,
      calories: scaleToTenth(item.calories, scale),
      protein: scaleToTenth(item.protein, scale),
      carbs: scaleToTenth(item.carbs, scale),
      fat: scaleToTenth(item.fat, scale),
      confidence: item.confidence ?? 0,
    };

    const totals = {
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    };

    logger.debug({ itemId: item.id, name: item.name }, 'DB lookup hit');

    return { source: 'db', result: { items: [result], totals, confidence: result.confidence! } };
  } catch (err) {
    logger.warn({ err }, 'DB lookup failed; falling through');
    return null;
  }
}
