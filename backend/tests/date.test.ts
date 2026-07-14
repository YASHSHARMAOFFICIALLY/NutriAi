import { describe, expect, it } from 'vitest';
import { startOfUtcDay, addUtcDays, utcDateKey } from '../src/utils/date';

describe('startOfUtcDay', () => {
  it('zeros out hours/minutes/seconds', () => {
    const d = new Date('2025-06-15T14:30:45.123Z');
    const start = startOfUtcDay(d);
    expect(start.toISOString()).toBe('2025-06-15T00:00:00.000Z');
  });
});

describe('addUtcDays', () => {
  it('adds days correctly', () => {
    const d = new Date('2025-01-30T00:00:00.000Z');
    const result = addUtcDays(d, 3);
    expect(result.toISOString()).toBe('2025-02-02T00:00:00.000Z');
  });

  it('handles negative days', () => {
    const d = new Date('2025-03-01T00:00:00.000Z');
    const result = addUtcDays(d, -1);
    expect(result.toISOString()).toBe('2025-02-28T00:00:00.000Z');
  });
});

describe('utcDateKey', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(utcDateKey(new Date('2025-12-25T23:59:59.000Z'))).toBe('2025-12-25');
  });
});
