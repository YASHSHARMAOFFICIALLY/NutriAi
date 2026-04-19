import bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { randomTokenUrlSafe, sha256Hex } from '../utils/hash';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { sendPasswordResetEmail, sendVerificationEmail } from './emailService';

const BCRYPT_ROUNDS = 12;

const hoursFromNow = (hours: number): Date => new Date(Date.now() + hours * 60 * 60 * 1000);

const issueVerification = async (user: Pick<User, 'id' | 'email'>): Promise<void> => {
  const token = randomTokenUrlSafe(32);
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAt: hoursFromNow(env.EMAIL_VERIFICATION_TTL_HOURS),
    },
  });
  await sendVerificationEmail(user.email, token);
};

export async function registerWithPassword(input: {
  email: string;
  password: string;
  name?: string | null;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing?.passwordHash) {
    throw new ConflictError('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, name: existing.name ?? input.name ?? null },
      })
    : await prisma.user.create({
        data: { email, passwordHash, name: input.name ?? null },
      });

  await issueVerification(user);
  return user;
}

export async function authenticateWithPassword(input: {
  email: string;
  password: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password.');
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid email or password.');
  if (!user.emailVerified) {
    throw new UnauthorizedError('Please verify your email before signing in.');
  }
  return user;
}

export async function verifyEmailWithToken(token: string): Promise<User> {
  const tokenHash = sha256Hex(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new BadRequestError('Verification link is invalid or has expired.');
  }

  const [, user] = await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    }),
  ]);
  return user;
}

export async function resendVerification(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  // Always succeed silently if no user / already verified — don't leak account existence.
  if (!user || user.emailVerified) return;

  // Invalidate any outstanding tokens so only the latest works.
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  await issueVerification(user);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !user.passwordHash) return; // silent no-op

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  const token = randomTokenUrlSafe(32);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: sha256Hex(token),
      expiresAt: hoursFromNow(env.PASSWORD_RESET_TTL_HOURS),
    },
  });
  await sendPasswordResetEmail(user.email, token);
}

export async function resetPasswordWithToken(input: {
  token: string;
  newPassword: string;
}): Promise<User> {
  const tokenHash = sha256Hex(input.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new BadRequestError('Reset link is invalid or has expired.');
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

  const [, user] = await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        // Completing a reset also verifies the email (the user owns the inbox).
        emailVerified: true,
        emailVerifiedAt: record.user.emailVerifiedAt ?? new Date(),
      },
    }),
    // Revoke all existing sessions after a password reset.
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  return user;
}
