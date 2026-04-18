import { describe, expect, it } from 'vitest';
import { isSafeExternalHttpsUrl } from '../src/utils/urlSafety';

describe('isSafeExternalHttpsUrl', () => {
  it('accepts ordinary external https URLs', () => {
    expect(isSafeExternalHttpsUrl('https://example.com/image.jpg')).toBe(true);
  });

  it('rejects non-https URLs', () => {
    expect(isSafeExternalHttpsUrl('http://example.com/image.jpg')).toBe(false);
  });

  it('rejects localhost URLs', () => {
    expect(isSafeExternalHttpsUrl('https://localhost/image.jpg')).toBe(false);
  });

  it('rejects direct IP URLs', () => {
    expect(isSafeExternalHttpsUrl('https://127.0.0.1/image.jpg')).toBe(false);
  });

  it('rejects URLs with embedded credentials', () => {
    expect(isSafeExternalHttpsUrl('https://user:pass@example.com/image.jpg')).toBe(false);
  });

  it('rejects non-standard ports', () => {
    expect(isSafeExternalHttpsUrl('https://example.com:8443/image.jpg')).toBe(false);
  });
});
