import { describe, expect, it } from 'vitest';
import { stubProvider } from '../src/ai/stubProvider';

const approxEqual = (a: number, b: number, tol = 0.2) => Math.abs(a - b) <= tol;

describe('stubProvider.analyzeFood', () => {
  it('returns a deterministic response for the same text', async () => {
    const a = await stubProvider.analyzeFood({ text: 'chicken and rice' });
    const b = await stubProvider.analyzeFood({ text: 'chicken and rice' });
    expect(a.data).toEqual(b.data);
  });

  it('totals equal the sum of items (within rounding)', async () => {
    const res = await stubProvider.analyzeFood({ text: 'salad' });
    const summed = res.data.items.reduce(
      (acc, it) => ({
        calories: acc.calories + it.calories,
        protein: acc.protein + it.protein,
        carbs: acc.carbs + it.carbs,
        fat: acc.fat + it.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    expect(approxEqual(res.data.totals.calories, summed.calories)).toBe(true);
    expect(approxEqual(res.data.totals.protein, summed.protein)).toBe(true);
    expect(approxEqual(res.data.totals.carbs, summed.carbs)).toBe(true);
    expect(approxEqual(res.data.totals.fat, summed.fat)).toBe(true);
  });

  it('reports zero-cost usage (no external call)', async () => {
    const res = await stubProvider.analyzeFood({ text: 'apple' });
    expect(res.usage.totalTokens).toBe(0);
    expect(res.usage.costUsd).toBe(0);
  });
});
