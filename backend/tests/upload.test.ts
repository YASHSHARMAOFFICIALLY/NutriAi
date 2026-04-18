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

  it('rejects non-https imageUrl values', () => {
    expect(() => analyzeFoodSchema.parse({ imageUrl: 'http://example.com/a.png' })).toThrow();
  });

  it('accepts https imageUrl values', () => {
    const parsed = analyzeFoodSchema.parse({ imageUrl: 'https://example.com/a.png' });
    expect(parsed.imageUrl).toBe('https://example.com/a.png');
  });

  it('rejects localhost imageUrl values', () => {
    expect(() => analyzeFoodSchema.parse({ imageUrl: 'https://localhost/a.png' })).toThrow();
  });

  it('rejects IP-literal imageUrl values', () => {
    expect(() => analyzeFoodSchema.parse({ imageUrl: 'https://127.0.0.1/a.png' })).toThrow();
  });
});
