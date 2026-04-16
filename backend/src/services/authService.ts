import type { User } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { signAccessToken } from '../utils/jwt';
import { randomTokenUrlSafe, sha256Hex } from '../utils/hash';
import { UnauthorizedError } from '../utils/errors';

interface GoogleProfileInput {
  googleId: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

const REFRESH_TTL_DAYS = (() => {
  const m = env.JWT_REFRESH_TTL.match(/^(\d+)d$/);
  return m ? Number(m[1]) : 30;
})();

const refreshExpiry = (): Date =>
  new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

export const findOrCreateFromGoogle = async (input: GoogleProfileInput): Promise<User> => {
  const existingByGoogle = await prisma.user.findUnique({ where: { googleId: input.googleId } });
  if (existingByGoogle) return existingByGoogle;

  const existingByEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        googleId: input.googleId,
        name: existingByEmail.name ?? input.name ?? null,
        avatarUrl: existingByEmail.avatarUrl ?? input.avatarUrl ?? null,
      },
    });
  }

  return prisma.user.create({
    data: {
      googleId: input.googleId,
      email: input.email,
      name: input.name ?? null,
      avatarUrl: input.avatarUrl ?? null,
    },
  });
};

export const issueTokens = async (user: Pick<User, 'id' | 'email' | 'role'>): Promise<IssuedTokens> => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = randomTokenUrlSafe(48);
  const refreshExpiresAt = refreshExpiry();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: refreshExpiresAt,
    },
  });

  return { accessToken, refreshToken, refreshExpiresAt };
};

export const rotateRefresh = async (presented: string): Promise<IssuedTokens & { user: User }> => {
  const tokenHash = sha256Hex(presented);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record || record.revokedAt || record.expiresAt <= new Date()) {
    // If a revoked token is reused, revoke every active token for the user (token-reuse defense).
    if (record?.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    throw new UnauthorizedError('Invalid refresh token');
  }

  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });

  const issued = await issueTokens(record.user);
  return { ...issued, user: record.user };
};

export const revokeRefresh = async (presented: string): Promise<void> => {
  const tokenHash = sha256Hex(presented);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
