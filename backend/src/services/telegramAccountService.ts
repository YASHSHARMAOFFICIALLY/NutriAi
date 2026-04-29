import { randomBytes } from 'node:crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { sha256Hex } from '../utils/hash';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

export interface TelegramAccountDTO {
  linked: boolean;
  botUsername: string | null;
  account: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    linkedAt: Date;
    lastSeenAt: Date | null;
  } | null;
}

const linkToken = () => randomBytes(24).toString('base64url');
const hashToken = (token: string) => sha256Hex(token);
const telegramEmail = (telegramUserId: string) => `telegram+${telegramUserId}@users.nutriai.local`;
const telegramDisplayName = (firstName?: string | null, lastName?: string | null, username?: string | null) => {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || (username ? `@${username}` : 'Telegram user');
};

export const getTelegramStatus = async (userId: string): Promise<TelegramAccountDTO> => {
  const account = await prisma.telegramAccount.findUnique({ where: { userId } });
  return {
    linked: Boolean(account),
    botUsername: env.TELEGRAM_BOT_USERNAME ?? null,
    account: account
      ? {
          username: account.username,
          firstName: account.firstName,
          lastName: account.lastName,
          linkedAt: account.linkedAt,
          lastSeenAt: account.lastSeenAt,
        }
      : null,
  };
};

export const createTelegramLink = async (userId: string) => {
  const token = linkToken();
  const expiresAt = new Date(Date.now() + env.TELEGRAM_LINK_TOKEN_TTL_MINUTES * 60_000);

  await prisma.$transaction(async (tx) => {
    await tx.telegramLinkToken.deleteMany({ where: { userId } });

    await tx.telegramLinkToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt,
      },
    });
  });

  const botUsername = env.TELEGRAM_BOT_USERNAME ?? null;
  return {
    token,
    expiresAt,
    botUsername,
    deepLink: botUsername ? `https://t.me/${botUsername}?start=${token}` : null,
  };
};

interface LinkTelegramAccountArgs {
  token: string;
  telegramUserId: string;
  chatId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export const linkTelegramAccount = async ({
  token,
  telegramUserId,
  chatId,
  username,
  firstName,
  lastName,
}: LinkTelegramAccountArgs) => {
  const tokenHash = hashToken(token);

  return prisma.$transaction(async (tx) => {
    const link = await tx.telegramLinkToken.findUnique({ where: { tokenHash } });
    if (!link || link.usedAt || link.expiresAt <= new Date()) {
      throw new BadRequestError('Telegram link expired. Generate a new link from settings.');
    }

    const existingTelegram = await tx.telegramAccount.findUnique({ where: { telegramUserId } });
    if (existingTelegram && existingTelegram.userId !== link.userId) {
      throw new ConflictError('This Telegram account is already linked to another NutriAI account.');
    }

    await tx.telegramAccount.upsert({
      where: { userId: link.userId },
      create: {
        userId: link.userId,
        telegramUserId,
        chatId,
        username: username ?? null,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        lastSeenAt: new Date(),
      },
      update: {
        telegramUserId,
        chatId,
        username: username ?? null,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        lastSeenAt: new Date(),
      },
    });

    await tx.telegramLinkToken.update({
      where: { id: link.id },
      data: { usedAt: new Date() },
    });

    return tx.user.findUniqueOrThrow({
      where: { id: link.userId },
      select: { id: true, email: true, name: true },
    });
  });
};

export const getOrCreateTelegramUserAccount = async (input: {
  telegramUserId: string;
  chatId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}) => {
  const existing = await prisma.telegramAccount.findUnique({
    where: { telegramUserId: input.telegramUserId },
    include: { user: true },
  });
  if (existing) {
    await prisma.telegramAccount.update({
      where: { id: existing.id },
      data: {
        chatId: input.chatId,
        username: input.username ?? existing.username,
        firstName: input.firstName ?? existing.firstName,
        lastName: input.lastName ?? existing.lastName,
        lastSeenAt: new Date(),
      },
    });
    return existing;
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: telegramEmail(input.telegramUserId),
        name: telegramDisplayName(input.firstName, input.lastName, input.username),
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    return tx.telegramAccount.create({
      data: {
        userId: user.id,
        telegramUserId: input.telegramUserId,
        chatId: input.chatId,
        username: input.username ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        lastSeenAt: new Date(),
      },
      include: { user: true },
    });
  });
};

export const unlinkTelegramAccount = async (userId: string) => {
  await prisma.$transaction(async (tx) => {
    await tx.telegramPendingAction.deleteMany({ where: { userId } });
    await tx.telegramLinkToken.deleteMany({ where: { userId } });
    await tx.telegramAccount.delete({ where: { userId } }).catch((err: unknown) => {
      if (typeof err === 'object' && err && 'code' in err && err.code === 'P2025') return null;
      throw err;
    });
  });
};

export const requireLinkedTelegramAccount = async (telegramUserId: string) => {
  const account = await prisma.telegramAccount.findUnique({
    where: { telegramUserId },
    include: { user: true },
  });
  if (!account) throw new NotFoundError('Telegram account is not linked');
  await prisma.telegramAccount.update({
    where: { id: account.id },
    data: { lastSeenAt: new Date() },
  });
  return account;
};
