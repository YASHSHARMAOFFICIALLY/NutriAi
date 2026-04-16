import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../src/utils/jwt';
import { UnauthorizedError } from '../src/utils/errors';

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ sub: 'user-1', email: 'a@b.com', role: 'USER' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe('USER');
  });

  it('rejects tampered tokens', () => {
    const token = signAccessToken({ sub: 'u', email: 'x@y.com', role: 'USER' });
    const tampered = token.slice(0, -2) + 'ab';
    expect(() => verifyAccessToken(tampered)).toThrow(UnauthorizedError);
  });

  it('rejects garbage tokens', () => {
    expect(() => verifyAccessToken('not-a-jwt')).toThrow(UnauthorizedError);
  });
});
