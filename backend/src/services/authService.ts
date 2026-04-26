import type { User } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { signAccessToken } from '../utils/jwt';
import { randomTokenUrlSafe, sha256Hex } from '../utils/hash';
import { UnauthorizedError } from '../utils/errors';
import type { SessionMetadataInput } from '../utils/sessionMetadata';

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

export const issueTokens = async (
  user: Pick<User, 'id' | 'email' | 'role'>,
  session?: SessionMetadataInput,
): Promise<IssuedTokens> => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = randomTokenUrlSafe(48);
  const refreshExpiresAt = refreshExpiry();

  const refresh = await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: refreshExpiresAt,
    },
  });

  if (session) {
    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenId: refresh.id,
        ipAddress: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        deviceType: session.deviceType ?? null,
        deviceModel: session.deviceModel ?? null,
        os: session.os ?? null,
        browser: session.browser ?? null,
        location: session.location ?? null,
      },
    });
  }

  return { accessToken, refreshToken, refreshExpiresAt };
};

export const rotateRefresh = async (
  presented: string,
  session?: SessionMetadataInput,
): Promise<IssuedTokens & { user: User }> => {
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
      await prisma.userSession.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date(), lastSeenAt: new Date() },
      });
    }
    throw new UnauthorizedError('Invalid refresh token');
  }

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    }),
    prisma.userSession.updateMany({
      where: { refreshTokenId: record.id, revokedAt: null },
      data: { revokedAt: new Date(), lastSeenAt: new Date() },
    }),
  ]);

  const issued = await issueTokens(record.user, session);
  return { ...issued, user: record.user };
};

export const markSessionSeen = async (presented: string): Promise<void> => {
  const tokenHash = sha256Hex(presented);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash }, select: { id: true } });
  if (!record) return;
  await prisma.userSession.updateMany({
    where: { refreshTokenId: record.id, revokedAt: null },
    data: { lastSeenAt: new Date() },
  });
};

export const revokeRefresh = async (presented: string): Promise<void> => {
  const tokenHash = sha256Hex(presented);
  const revokedAt = new Date();
  const rows = await prisma.refreshToken.findMany({
    where: { tokenHash, revokedAt: null },
    select: { id: true },
  });
  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt },
    }),
    prisma.userSession.updateMany({
      where: { refreshTokenId: { in: rows.map((row) => row.id) }, revokedAt: null },
      data: { revokedAt, lastSeenAt: revokedAt },
    }),
  ]);
};
