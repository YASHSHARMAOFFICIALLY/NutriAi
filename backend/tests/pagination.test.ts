import { describe, expect, it } from 'vitest';
import { paginate, toOffset } from '../src/utils/pagination';

describe('pagination', () => {
  it('computes offset correctly', () => {
    expect(toOffset({ page: 1, pageSize: 20 })).toBe(0);
    expect(toOffset({ page: 2, pageSize: 20 })).toBe(20);
    expect(toOffset({ page: 5, pageSize: 10 })).toBe(40);
  });

  it('wraps data with metadata', () => {
    const res = paginate([1, 2, 3], 57, { page: 2, pageSize: 20 });
    expect(res).toEqual({ data: [1, 2, 3], page: 2, pageSize: 20, total: 57, totalPages: 3 });
  });

  it('returns at least 1 totalPages when total is 0', () => {
    const res = paginate<never>([], 0, { page: 1, pageSize: 20 });
    expect(res.totalPages).toBe(1);
  });
});
