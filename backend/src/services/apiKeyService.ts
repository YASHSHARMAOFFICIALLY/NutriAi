import { randomBytes } from 'node:crypto';
import { prisma } from '../config/prisma';
import { sha256Hex } from '../utils/hash';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const TOKEN_BYTES = 32;
const PREFIX_LEN = 8;

// Token format: nk_<prefix>.<secret> — so the prefix is embeddable in logs
// for support/debug, while the secret half is unrecoverable once shown.
const buildToken = (prefix: string, secret: string): string => `nk_${prefix}.${secret}`;

const generateSecret = (): { prefix: string; secret: string; token: string } => {
  const raw = randomBytes(TOKEN_BYTES).toString('base64url');
  const prefix = raw.slice(0, PREFIX_LEN);
  const secret = raw.slice(PREFIX_LEN);
  return { prefix, secret, token: buildToken(prefix, secret) };
};

interface IssueArgs {
  userId: string;
  name: string;
  scopes?: string[];
  rateLimitPerMin?: number;
}

export const issueApiKey = async ({ userId, name, scopes, rateLimitPerMin }: IssueArgs) => {
  const { prefix, secret, token } = generateSecret();
  const tokenHash = sha256Hex(token);

  const row = await prisma.apiKey.create({
    data: {
      userId,
      name,
      prefix,
      tokenHash,
      scopes: scopes ?? [],
      rateLimitPerMin: rateLimitPerMin ?? 60,
    },
  });

  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    scopes: row.scopes,
    rateLimitPerMin: row.rateLimitPerMin,
    createdAt: row.createdAt,
    // Only returned at creation time — never again.
    token,
  };
  // Intentionally unused locally but useful for debugging; silence tsc unused.
  void secret;
};

export const listApiKeys = async (userId: string) => {
  const rows = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      rateLimitPerMin: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });
  return rows;
};

export const revokeApiKey = async (userId: string, id: string) => {
  const row = await prisma.apiKey.findUnique({ where: { id } });
  if (!row || row.userId !== userId) throw new NotFoundError('API key not found');
  if (row.revokedAt) return row;
  return prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
};

export const findActiveByToken = async (token: string) => {
  if (!token.startsWith('nk_')) return null;
  const body = token.slice(3);
  const dot = body.indexOf('.');
  if (dot <= 0) return null;
  const prefix = body.slice(0, dot);

  const tokenHash = sha256Hex(token);
  const row = await prisma.apiKey.findUnique({ where: { tokenHash } });
  if (!row || row.prefix !== prefix) return null;
  if (row.revokedAt) throw new ForbiddenError('API key revoked');
  return row;
};

export const touchLastUsed = async (apiKeyId: string): Promise<void> => {
  await prisma.apiKey.update({
    where: { id: apiKeyId },
    data: { lastUsedAt: new Date() },
  });
};

export const recordApiUsage = async (args: {
  apiKeyId: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
}): Promise<void> => {
  try {
    await prisma.apiUsage.create({ data: args });
  } catch {
    // Metering must never break a response.
  }
};
