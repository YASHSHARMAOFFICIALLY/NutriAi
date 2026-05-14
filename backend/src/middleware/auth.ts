import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { ACCESS_COOKIE } from '../utils/authCookies';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  const bearerToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  const cookieToken = req.cookies?.[ACCESS_COOKIE] as string | undefined;
  const token = bearerToken || cookieToken;

  if (!token) {
    throw new UnauthorizedError('Missing auth token');
  }

  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, email: payload.email, role: payload.role };
  next();
};
