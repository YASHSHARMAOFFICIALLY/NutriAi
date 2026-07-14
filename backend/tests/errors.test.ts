import { describe, expect, it } from 'vitest';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '../src/utils/errors';

describe('AppError hierarchy', () => {
  it('AppError sets statusCode, code, message, details', () => {
    const err = new AppError(418, 'TEAPOT', 'I am a teapot', { extra: 1 });
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe('TEAPOT');
    expect(err.message).toBe('I am a teapot');
    expect(err.details).toEqual({ extra: 1 });
    expect(err).toBeInstanceOf(Error);
  });

  it.each([
    { Cls: BadRequestError, status: 400, code: 'BAD_REQUEST' },
    { Cls: UnauthorizedError, status: 401, code: 'UNAUTHORIZED' },
    { Cls: ForbiddenError, status: 403, code: 'FORBIDDEN' },
    { Cls: NotFoundError, status: 404, code: 'NOT_FOUND' },
    { Cls: ConflictError, status: 409, code: 'CONFLICT' },
    { Cls: RateLimitError, status: 429, code: 'RATE_LIMITED' },
  ])('$Cls.name has statusCode $status', ({ Cls, status, code }) => {
    const err = new Cls();
    expect(err.statusCode).toBe(status);
    expect(err.code).toBe(code);
    expect(err).toBeInstanceOf(AppError);
  });
});
