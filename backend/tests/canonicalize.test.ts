import { describe, expect, it } from 'vitest';
import { canonicalize, canonicalizeText } from '../src/ai/canonicalize';

describe('canonicalize', () => {
  it('sorts object keys so equivalent inputs produce the same string', () => {
    const a = canonicalize({ b: 1, a: 2, c: { z: 9, y: 8 } });
    const b = canonicalize({ c: { y: 8, z: 9 }, a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it('preserves array order', () => {
    expect(canonicalize([1, 2, 3])).not.toBe(canonicalize([3, 2, 1]));
  });

  it('handles null and undefined consistently', () => {
    expect(canonicalize(null)).toBe('null');
    expect(canonicalize(undefined)).toBe('null');
  });
});

describe('canonicalizeText', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(canonicalizeText('  Grilled   Chicken \nBreast ')).toBe('grilled chicken breast');
  });

  it('is idempotent', () => {
    const once = canonicalizeText('  FOO   BAR ');
    expect(canonicalizeText(once)).toBe(once);
  });
});
