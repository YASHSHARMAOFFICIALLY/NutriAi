import { describe, expect, it } from 'vitest';

describe('env defaults', () => {
  it('loads trust proxy as false by default in tests', async () => {
    const { env } = await import('../src/config/env');
    expect(env.TRUST_PROXY).toBe(false);
  });
});
