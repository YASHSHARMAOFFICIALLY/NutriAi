import { describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { requireAuth } from '../src/middleware/auth';
import { requireRole } from '../src/middleware/rbac';
import { signAccessToken } from '../src/utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../src/utils/errors';

const runMiddleware = (mw: ReturnType<typeof requireAuth>, req: Partial<Request>) => {
  const next: NextFunction = vi.fn();
  const res = {} as Response;
  try {
    (mw as (req: Request, res: Response, next: NextFunction) => void)(req as Request, res, next);
    return { next, error: null as Error | null };
  } catch (err) {
    return { next, error: err as Error };
  }
};

describe('requireAuth middleware', () => {
  it('rejects requests without authorization header', () => {
    const { error } = runMiddleware(requireAuth, { headers: {} });
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('rejects malformed bearer header', () => {
    const { error } = runMiddleware(requireAuth, { headers: { authorization: 'Basic foo' } });
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('attaches req.user on valid bearer token', () => {
    const token = signAccessToken({ sub: 'u1', email: 'u@n.com', role: 'USER' });
    const req: Partial<Request> = { headers: { authorization: `Bearer ${token}` } };
    const { next, error } = runMiddleware(requireAuth, req);
    expect(error).toBeNull();
    expect(next).toHaveBeenCalledOnce();
    expect(req.user).toEqual({ id: 'u1', email: 'u@n.com', role: 'USER' });
  });
});

describe('requireRole middleware', () => {
  it('throws Unauthorized when req.user is missing', () => {
    const mw = requireRole('ADMIN');
    const { error } = runMiddleware(mw, { headers: {} });
    expect(error).toBeInstanceOf(UnauthorizedError);
  });

  it('throws Forbidden when role does not match', () => {
    const mw = requireRole('ADMIN');
    const { error } = runMiddleware(mw, {
      headers: {},
      user: { id: 'u', email: 'e@e.com', role: 'USER' },
    });
    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it('passes through when role matches', () => {
    const mw = requireRole('USER', 'ADMIN');
    const { next, error } = runMiddleware(mw, {
      headers: {},
      user: { id: 'u', email: 'e@e.com', role: 'ADMIN' },
    });
    expect(error).toBeNull();
    expect(next).toHaveBeenCalledOnce();
  });
});
