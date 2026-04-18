import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { UnauthorizedError } from './errors';

const ACCESS_TOKEN_ALGORITHM: SignOptions['algorithm'] = 'HS256';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: ACCESS_TOKEN_ALGORITHM,
    expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'],
  });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: [ACCESS_TOKEN_ALGORITHM],
    });
    if (typeof decoded === 'string' || !decoded) {
      throw new UnauthorizedError('Invalid access token');
    }
    return decoded as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
};
