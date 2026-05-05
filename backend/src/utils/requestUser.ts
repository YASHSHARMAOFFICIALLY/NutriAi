import type { Request } from 'express';
import { UnauthorizedError } from './errors';

export const requireUser = (req: Request): Express.User => {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
};
