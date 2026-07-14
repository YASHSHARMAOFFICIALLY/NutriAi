import { describe, expect, it } from 'vitest';
import { countWords } from '../src/utils/text';

describe('countWords', () => {
  it('counts words separated by whitespace', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('handles leading/trailing whitespace', () => {
    expect(countWords('  one two three  ')).toBe(3);
  });

  it('returns 0 for empty and whitespace-only strings', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('handles tabs and newlines', () => {
    expect(countWords("one\ttwo\nthree")).toBe(3);
  });
});
