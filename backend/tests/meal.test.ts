import { describe, expect, it } from 'vitest';
import { dayWindow } from '../src/services/mealService';
import { createMealSchema } from '../src/controllers/mealController';

describe('dayWindow', () => {
  it('returns UTC midnight-to-midnight for a given date', () => {
    const w = dayWindow(new Date('2026-04-16T17:23:45Z'));
    expect(w.start.toISOString()).toBe('2026-04-16T00:00:00.000Z');
    expect(w.end.toISOString()).toBe('2026-04-17T00:00:00.000Z');
  });

  it('is exclusive on the end', () => {
    const w = dayWindow(new Date('2026-12-31T23:59:59Z'));
    expect(w.start.toISOString()).toBe('2026-12-31T00:00:00.000Z');
    expect(w.end.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });
});

describe('createMealSchema', () => {
  it('accepts items without foodQueryId', () => {
    const parsed = createMealSchema.parse({
      mealType: 'LUNCH',
      items: [{ name: 'apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 }],
    });
    expect(parsed.mealType).toBe('LUNCH');
    expect(parsed.items).toHaveLength(1);
  });

  it('accepts a foodQueryId with no items (snapshot path)', () => {
    const parsed = createMealSchema.parse({
      mealType: 'DINNER',
      foodQueryId: '00000000-0000-0000-0000-000000000001',
    });
    expect(parsed.foodQueryId).toBeTypeOf('string');
    expect(parsed.items).toEqual([]);
  });

  it('rejects when neither items nor foodQueryId is provided', () => {
    expect(() => createMealSchema.parse({ mealType: 'SNACK' })).toThrow();
  });

  it('rejects invalid mealType', () => {
    expect(() =>
      createMealSchema.parse({
        mealType: 'BRUNCH',
        items: [{ name: 'x', calories: 1, protein: 0, carbs: 0, fat: 0 }],
      }),
    ).toThrow();
  });

  it('rejects negative nutrition values', () => {
    expect(() =>
      createMealSchema.parse({
        mealType: 'BREAKFAST',
        items: [{ name: 'x', calories: -1, protein: 0, carbs: 0, fat: 0 }],
      }),
    ).toThrow();
  });

  it('caps item count at 30', () => {
    const items = Array.from({ length: 31 }, () => ({
      name: 'x',
      calories: 1,
      protein: 0,
      carbs: 0,
      fat: 0,
    }));
    expect(() => createMealSchema.parse({ mealType: 'LUNCH', items })).toThrow();
  });
});
