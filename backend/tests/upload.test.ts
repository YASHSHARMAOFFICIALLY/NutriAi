import { describe, expect, it } from 'vitest';
import { presignSchema, confirmSchema } from '../src/controllers/uploadController';
import { analyzeFoodSchema } from '../src/controllers/foodController';

describe('presignSchema', () => {
  it('accepts a supported contentType', () => {
    const parsed = presignSchema.parse({ contentType: 'image/jpeg' });
    expect(parsed.contentType).toBe('image/jpeg');
  });

  it('accepts an optional size', () => {
    const parsed = presignSchema.parse({ contentType: 'image/png', size: 12345 });
    expect(parsed.size).toBe(12345);
  });

  it('rejects a missing contentType', () => {
    expect(() => presignSchema.parse({})).toThrow();
  });

  it('rejects a negative size', () => {
    expect(() => presignSchema.parse({ contentType: 'image/png', size: -1 })).toThrow();
  });
});

describe('confirmSchema', () => {
  it('accepts a valid assetId', () => {
    const parsed = confirmSchema.parse({ assetId: '00000000-0000-0000-0000-000000000001' });
    expect(parsed.assetId).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('rejects a non-uuid assetId', () => {
    expect(() => confirmSchema.parse({ assetId: 'nope' })).toThrow();
  });
});

describe('analyzeFoodSchema with assetId', () => {
  it('accepts assetId without text or imageUrl', () => {
    const parsed = analyzeFoodSchema.parse({
      assetId: '00000000-0000-0000-0000-000000000001',
    });
    expect(parsed.assetId).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('rejects when no input is provided', () => {
    expect(() => analyzeFoodSchema.parse({})).toThrow();
  });

  it('rejects a non-uuid assetId', () => {
    expect(() => analyzeFoodSchema.parse({ assetId: 'nope' })).toThrow();
  });
});
