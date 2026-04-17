import { describe, expect, it } from 'vitest';
import { rangeQuerySchema } from '../src/controllers/analyticsController';

describe('rangeQuerySchema', () => {
  it('accepts no params', () => {
    const parsed = rangeQuerySchema.parse({});
    expect(parsed.from).toBeUndefined();
    expect(parsed.to).toBeUndefined();
  });

  it('coerces ISO date strings', () => {
    const parsed = rangeQuerySchema.parse({ from: '2026-04-01', to: '2026-04-16' });
    expect(parsed.from?.toISOString().slice(0, 10)).toBe('2026-04-01');
    expect(parsed.to?.toISOString().slice(0, 10)).toBe('2026-04-16');
  });

  it('rejects an invalid date', () => {
    expect(() => rangeQuerySchema.parse({ from: 'nope' })).toThrow();
  });
});
