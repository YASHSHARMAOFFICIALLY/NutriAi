import type { MealType } from '@prisma/client';
import { prisma } from '../config/prisma';
import { getProfileOrNull } from './profileService';
import { dayWindow } from './mealService';
import { roundToTenth } from '../utils/number';

const LOOKBACK_DAYS = 45;
const MAX_CANDIDATES = 200;

export interface RemainingBudget {
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

export interface MealRecommendation {
  signature: string;
  sampleMealId: string;
  mealType: MealType;
  items: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number }>;
  totals: { calories: number; protein: number; carbs: number; fat: number };
  score: number;
  frequency: number;
  lastLoggedAt: string;
  reasons: string[];
}

// Normalize an item name so near-duplicates cluster together.
const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/\d+\s*(g|kg|oz|ml|cup|cups|tbsp|tsp|slice|slices)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// A stable signature so meals with the same set of items (regardless of
// order, quantities, or minor wording) are grouped together.
const signatureFor = (mealType: MealType, itemNames: string[]): string => {
  const norm = itemNames
    .map(normalizeName)
    .filter((s) => s.length > 0)
    .sort();
  return `${mealType}:${norm.join('|')}`;
};

const containsAny = (haystack: string, needles: string[]): string | null => {
  const lower = haystack.toLowerCase();
  for (const n of needles) {
    const needle = n.toLowerCase().trim();
    if (needle && lower.includes(needle)) return needle;
  }
  return null;
};

interface ScoreInputs {
  candidate: {
    totals: { calories: number; protein: number; carbs: number; fat: number };
    frequency: number;
    daysSinceLast: number;
  };
  remaining: RemainingBudget;
}

// Score in [0, 1]. Composed of:
// - calorie fit: higher when the meal fits in the remaining calorie budget
// - protein fit: higher when it helps close the protein gap
// - frequency boost: sqrt-flattened so a single favorite doesn't monopolize
// - recency boost: higher when the meal hasn't been eaten in a few days
const scoreCandidate = ({ candidate, remaining }: ScoreInputs): { score: number; reasons: string[] } => {
  const reasons: string[] = [];
  let score = 0;

  // Calorie fit (weight: 0.4)
  if (remaining.calories != null && remaining.calories > 0) {
    const ratio = candidate.totals.calories / remaining.calories;
    const fit = ratio <= 1 ? ratio : Math.max(0, 1 - (ratio - 1));
    score += 0.4 * fit;
    if (fit > 0.5) reasons.push('fits remaining calorie budget');
  } else {
    score += 0.2; // neutral signal when no target is set
  }

  // Protein fit (weight: 0.25)
  if (remaining.protein != null && remaining.protein > 0 && candidate.totals.protein > 0) {
    const ratio = candidate.totals.protein / remaining.protein;
    const fit = ratio <= 1 ? ratio : Math.max(0, 1 - (ratio - 1));
    score += 0.25 * fit;
    if (fit > 0.5) reasons.push('helps close protein gap');
  }

  // Frequency boost (weight: 0.2): sqrt flattening caps dominance.
  const freqBoost = Math.min(1, Math.sqrt(candidate.frequency) / 4);
  score += 0.2 * freqBoost;
  if (candidate.frequency >= 3) reasons.push('you eat this often');

  // Recency boost (weight: 0.15): small dip right after, peak around day 5+.
  const recencyBoost = Math.min(1, candidate.daysSinceLast / 7);
  score += 0.15 * recencyBoost;
  if (candidate.daysSinceLast >= 5) reasons.push('been a while since you had this');

  return { score: Math.round(score * 1000) / 1000, reasons };
};

export const remainingBudgetForToday = async (userId: string, now = new Date()): Promise<RemainingBudget> => {
  const profile = await getProfileOrNull(userId);
  if (!profile) return { calories: null, protein: null, carbs: null, fat: null };

  const { start, end } = dayWindow(now);
  const agg = await prisma.meal.aggregate({
    where: { userId, loggedAt: { gte: start, lt: end } },
    _sum: {
      totalCalories: true,
      totalProtein: true,
      totalCarbs: true,
      totalFat: true,
    },
  });

  const calTarget = profile.effectiveCalorieTarget;
  const protTarget = profile.effectiveProteinTargetG;
  const carbTarget = profile.effectiveCarbsTargetG;
  const fatTarget = profile.effectiveFatTargetG;

  return {
    calories: calTarget != null ? Math.max(0, calTarget - (agg._sum.totalCalories ?? 0)) : null,
    protein: protTarget != null ? Math.max(0, protTarget - (agg._sum.totalProtein ?? 0)) : null,
    carbs: carbTarget != null ? Math.max(0, carbTarget - (agg._sum.totalCarbs ?? 0)) : null,
    fat: fatTarget != null ? Math.max(0, fatTarget - (agg._sum.totalFat ?? 0)) : null,
  };
};

interface RecommendArgs {
  userId: string;
  mealType?: MealType;
  remainingOverride?: RemainingBudget;
  limit?: number;
  now?: Date;
}

export const recommendMeals = async ({
  userId,
  mealType,
  remainingOverride,
  limit = 5,
  now = new Date(),
}: RecommendArgs): Promise<{
  remaining: RemainingBudget;
  recommendations: MealRecommendation[];
}> => {
  const profile = await getProfileOrNull(userId);
  const allergies = profile?.allergies ?? [];
  // Dietary prefs are free-form; treated as *include* hints right now
  // (kept for the scoring pass so we can extend easily).
  void profile?.dietaryPrefs;

  const lookbackStart = new Date(now);
  lookbackStart.setUTCDate(lookbackStart.getUTCDate() - LOOKBACK_DAYS);

  const meals = await prisma.meal.findMany({
    where: {
      userId,
      loggedAt: { gte: lookbackStart },
      ...(mealType ? { mealType } : {}),
    },
    orderBy: { loggedAt: 'desc' },
    take: MAX_CANDIDATES,
    include: { items: { select: { name: true, calories: true, protein: true, carbs: true, fat: true } } },
  });

  interface Bucket {
    signature: string;
    mealType: MealType;
    sampleMealId: string;
    items: MealRecommendation['items'];
    totals: MealRecommendation['totals'];
    frequency: number;
    lastLoggedAt: Date;
  }
  const buckets = new Map<string, Bucket>();

  for (const m of meals) {
    const itemNames = m.items.map((it) => it.name);
    const sig = signatureFor(m.mealType, itemNames);
    if (!sig.includes(':')) continue;

    // Skip meals that contain any allergen substring.
    const allergen = containsAny(itemNames.join(' '), allergies);
    if (allergen) continue;

    const existing = buckets.get(sig);
    if (existing) {
      existing.frequency += 1;
      if (m.loggedAt > existing.lastLoggedAt) existing.lastLoggedAt = m.loggedAt;
    } else {
      buckets.set(sig, {
        signature: sig,
        mealType: m.mealType,
        sampleMealId: m.id,
        items: m.items.map((it) => ({
          name: it.name,
          calories: roundToTenth(it.calories),
          protein: roundToTenth(it.protein),
          carbs: roundToTenth(it.carbs),
          fat: roundToTenth(it.fat),
        })),
        totals: {
          calories: roundToTenth(m.totalCalories),
          protein: roundToTenth(m.totalProtein),
          carbs: roundToTenth(m.totalCarbs),
          fat: roundToTenth(m.totalFat),
        },
        frequency: 1,
        lastLoggedAt: m.loggedAt,
      });
    }
  }

  const remaining = remainingOverride ?? (await remainingBudgetForToday(userId, now));

  const scored: MealRecommendation[] = [];
  for (const b of buckets.values()) {
    const daysSinceLast = Math.max(
      0,
      Math.floor((now.getTime() - b.lastLoggedAt.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const { score, reasons } = scoreCandidate({
      candidate: { totals: b.totals, frequency: b.frequency, daysSinceLast },
      remaining,
    });
    scored.push({
      signature: b.signature,
      sampleMealId: b.sampleMealId,
      mealType: b.mealType,
      items: b.items,
      totals: b.totals,
      score,
      frequency: b.frequency,
      lastLoggedAt: b.lastLoggedAt.toISOString(),
      reasons,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  return {
    remaining,
    recommendations: scored.slice(0, limit),
  };
};

// Exported for tests.
export const __internal = { normalizeName, signatureFor, scoreCandidate };
