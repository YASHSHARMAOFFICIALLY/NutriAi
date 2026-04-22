import { describe, expect, it } from 'vitest';
import {
  adminActivityQuerySchema,
  adminUsageQuerySchema,
  adminUsersQuerySchema,
} from '../src/controllers/adminController';

describe('admin query schemas', () => {
  it('defaults user pagination', () => {
    const parsed = adminUsersQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
  });

  it('accepts role and bounded pagination', () => {
    const parsed = adminUsersQuerySchema.parse({ role: 'ADMIN', page: '2', limit: '50' });
    expect(parsed.role).toBe('ADMIN');
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(50);
  });

  it('rejects excessive user page sizes', () => {
    expect(() => adminUsersQuerySchema.parse({ limit: '1000' })).toThrow();
  });

  it('coerces usage date range', () => {
    const parsed = adminUsageQuerySchema.parse({ from: '2026-04-01', to: '2026-04-22' });
    expect(parsed.from?.toISOString().slice(0, 10)).toBe('2026-04-01');
    expect(parsed.to?.toISOString().slice(0, 10)).toBe('2026-04-22');
  });

  it('bounds activity limit', () => {
    expect(adminActivityQuerySchema.parse({ limit: '30' }).limit).toBe(30);
    expect(() => adminActivityQuerySchema.parse({ limit: '100' })).toThrow();
  });
});
