import { describe, expect, it } from 'vitest';
import {
  createApiKeySchema,
  revokeApiKeyParamsSchema,
} from '../src/controllers/apiKeyController';
import { publicAnalyzeSchema } from '../src/controllers/publicController';

describe('createApiKeySchema', () => {
  it('accepts a name only', () => {
    const parsed = createApiKeySchema.parse({ name: 'prod' });
    expect(parsed.name).toBe('prod');
    expect(parsed.scopes).toBeUndefined();
  });

  it('accepts scopes and a custom rate limit', () => {
    const parsed = createApiKeySchema.parse({
      name: 'partner',
      scopes: ['calories:read'],
      rateLimitPerMin: 120,
    });
    expect(parsed.scopes).toEqual(['calories:read']);
    expect(parsed.rateLimitPerMin).toBe(120);
  });

  it('rejects an empty name', () => {
    expect(() => createApiKeySchema.parse({ name: '' })).toThrow();
  });

  it('rejects a non-positive rate limit', () => {
    expect(() => createApiKeySchema.parse({ name: 'x', rateLimitPerMin: 0 })).toThrow();
  });

  it('rejects scopes past the length cap', () => {
    const many = Array.from({ length: 21 }, (_, i) => `scope:${i}`);
    expect(() => createApiKeySchema.parse({ name: 'x', scopes: many })).toThrow();
  });
});

describe('revokeApiKeyParamsSchema', () => {
  it('accepts a uuid', () => {
    const parsed = revokeApiKeyParamsSchema.parse({
      id: '00000000-0000-0000-0000-000000000001',
    });
    expect(parsed.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('rejects a non-uuid id', () => {
    expect(() => revokeApiKeyParamsSchema.parse({ id: 'nope' })).toThrow();
  });
});

describe('publicAnalyzeSchema', () => {
  it('accepts text only', () => {
    const parsed = publicAnalyzeSchema.parse({ text: '2 boiled eggs' });
    expect(parsed.text).toBe('2 boiled eggs');
  });

  it('accepts imageUrl only', () => {
    const parsed = publicAnalyzeSchema.parse({ imageUrl: 'https://example.com/x.jpg' });
    expect(parsed.imageUrl).toBe('https://example.com/x.jpg');
  });

  it('rejects when nothing is provided', () => {
    expect(() => publicAnalyzeSchema.parse({})).toThrow();
  });

  it('rejects an invalid imageUrl', () => {
    expect(() => publicAnalyzeSchema.parse({ imageUrl: 'not-a-url' })).toThrow();
  });
});
