import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { requireUser } from '../utils/requestUser';

export const ADMIN_OWNER_EMAIL = 'yashsharmaofficially@gmail.com';

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    const user = requireUser(req);
    if (!roles.includes(user.role)) throw new ForbiddenError('Insufficient role');
    next();
  };

export const requireAdminOwner: RequestHandler = (req, _res, next) => {
  const user = requireUser(req);
  if (user.email.toLowerCase() !== ADMIN_OWNER_EMAIL) {
    throw new NotFoundError();
  }
  next();
};
