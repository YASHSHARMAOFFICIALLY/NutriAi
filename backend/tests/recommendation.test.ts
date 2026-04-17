import { describe, expect, it } from 'vitest';
import { __internal } from '../src/services/recommendationService';
import { recommendQuerySchema } from '../src/controllers/recommendationController';

const { normalizeName, signatureFor, scoreCandidate } = __internal;

describe('normalizeName', () => {
  it('lowercases and strips parentheticals', () => {
    expect(normalizeName('Grilled Chicken (150g)')).toBe('grilled chicken');
  });

  it('strips quantity tokens', () => {
    expect(normalizeName('200g white rice')).toBe('white rice');
    expect(normalizeName('1 slice whole wheat bread')).toBe('whole wheat bread');
  });

  it('collapses whitespace', () => {
    expect(normalizeName('  broccoli   ')).toBe('broccoli');
  });
});

describe('signatureFor', () => {
  it('is order-insensitive', () => {
    const a = signatureFor('LUNCH', ['grilled chicken', 'white rice']);
    const b = signatureFor('LUNCH', ['white rice', 'grilled chicken']);
    expect(a).toBe(b);
  });

  it('differs by mealType', () => {
    const a = signatureFor('BREAKFAST', ['oatmeal', 'banana']);
    const b = signatureFor('LUNCH', ['oatmeal', 'banana']);
    expect(a).not.toBe(b);
  });
});

describe('scoreCandidate', () => {
  const baseRemaining = { calories: 1000, protein: 40, carbs: 120, fat: 40 };

  it('rewards meals that fit the calorie budget', () => {
    const fit = scoreCandidate({
      candidate: {
        totals: { calories: 800, protein: 30, carbs: 90, fat: 25 },
        frequency: 2,
        daysSinceLast: 2,
      },
      remaining: baseRemaining,
    });
    const over = scoreCandidate({
      candidate: {
        totals: { calories: 2000, protein: 30, carbs: 90, fat: 25 },
        frequency: 2,
        daysSinceLast: 2,
      },
      remaining: baseRemaining,
    });
    expect(fit.score).toBeGreaterThan(over.score);
  });

  it('rewards frequently-eaten meals', () => {
    const common = scoreCandidate({
      candidate: {
        totals: { calories: 500, protein: 20, carbs: 50, fat: 15 },
        frequency: 9,
        daysSinceLast: 2,
      },
      remaining: baseRemaining,
    });
    const rare = scoreCandidate({
      candidate: {
        totals: { calories: 500, protein: 20, carbs: 50, fat: 15 },
        frequency: 1,
        daysSinceLast: 2,
      },
      remaining: baseRemaining,
    });
    expect(common.score).toBeGreaterThan(rare.score);
  });

  it('rewards meals not eaten for several days (recency)', () => {
    const due = scoreCandidate({
      candidate: {
        totals: { calories: 500, protein: 20, carbs: 50, fat: 15 },
        frequency: 3,
        daysSinceLast: 7,
      },
      remaining: baseRemaining,
    });
    const recent = scoreCandidate({
      candidate: {
        totals: { calories: 500, protein: 20, carbs: 50, fat: 15 },
        frequency: 3,
        daysSinceLast: 0,
      },
      remaining: baseRemaining,
    });
    expect(due.score).toBeGreaterThan(recent.score);
  });

  it('does not require a profile to score', () => {
    const r = scoreCandidate({
      candidate: {
        totals: { calories: 500, protein: 20, carbs: 50, fat: 15 },
        frequency: 2,
        daysSinceLast: 2,
      },
      remaining: { calories: null, protein: null, carbs: null, fat: null },
    });
    expect(r.score).toBeGreaterThan(0);
  });
});

describe('recommendQuerySchema', () => {
  it('defaults limit to 5', () => {
    const parsed = recommendQuerySchema.parse({});
    expect(parsed.limit).toBe(5);
  });

  it('coerces numeric query strings', () => {
    const parsed = recommendQuerySchema.parse({ limit: '10', remainingCalories: '500' });
    expect(parsed.limit).toBe(10);
    expect(parsed.remainingCalories).toBe(500);
  });

  it('rejects invalid mealType', () => {
    expect(() => recommendQuerySchema.parse({ mealType: 'BRUNCH' })).toThrow();
  });

  it('rejects limit over 50', () => {
    expect(() => recommendQuerySchema.parse({ limit: 100 })).toThrow();
  });
});
