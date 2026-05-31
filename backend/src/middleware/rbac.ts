import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { requireUser } from '../utils/requestUser';

const adminEmails = (): Set<string> =>
  new Set(
    env.ADMIN_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    const user = requireUser(req);
    if (!roles.includes(user.role)) throw new ForbiddenError('Insufficient role');
    next();
  };

export const requireAdminOwner: RequestHandler = (req, _res, next) => {
  const user = requireUser(req);
  if (!adminEmails().has(user.email.toLowerCase())) {
    throw new NotFoundError();
  }
  next();
};
