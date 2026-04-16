import { describe, expect, it } from 'vitest';
import { computeCostUsd } from '../src/ai/pricing';

describe('computeCostUsd', () => {
  it('computes cost for gpt-4o-mini', () => {
    // 1000 input @ 0.00015 + 500 output @ 0.0006 = 0.00015 + 0.0003 = 0.00045
    expect(computeCostUsd('gpt-4o-mini', 1000, 500)).toBeCloseTo(0.00045, 6);
  });

  it('returns zero for unknown models rather than throwing', () => {
    expect(computeCostUsd('totally-made-up-model', 1000, 1000)).toBe(0);
  });

  it('handles zero tokens', () => {
    expect(computeCostUsd('gpt-4o', 0, 0)).toBe(0);
  });
});
