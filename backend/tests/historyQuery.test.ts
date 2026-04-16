import { describe, expect, it } from 'vitest';
import { historyQuerySchema } from '../src/controllers/historyController';

describe('historyQuerySchema', () => {
  it('applies defaults for pagination', () => {
    const parsed = historyQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });

  it('coerces string query params to numbers and dates', () => {
    const parsed = historyQuerySchema.parse({
      from: '2026-01-01',
      to: '2026-01-31',
      minCalories: '100',
      maxCalories: '800',
      page: '2',
      pageSize: '50',
    });
    expect(parsed.from).toBeInstanceOf(Date);
    expect(parsed.to).toBeInstanceOf(Date);
    expect(parsed.minCalories).toBe(100);
    expect(parsed.maxCalories).toBe(800);
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(50);
  });

  it('rejects pageSize over 100', () => {
    expect(() => historyQuerySchema.parse({ pageSize: '500' })).toThrow();
  });

  it('rejects negative calories', () => {
    expect(() => historyQuerySchema.parse({ minCalories: '-10' })).toThrow();
  });
});
