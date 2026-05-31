import type { WeightEntry } from '@prisma/client';
import { prisma } from '../config/prisma';
import { NotFoundError, RateLimitError } from '../utils/errors';
import { isUserPro } from './aiPolicy';

const FREE_WEIGHT_ENTRY_LIMIT = 10;

export interface WeightEntryDTO {
  id: string;
  weightKg: number;
  note: string | null;
  recordedAt: string;
  createdAt: string;
}

const toDTO = (e: WeightEntry): WeightEntryDTO => ({
  id: e.id,
  weightKg: Number(e.weightKg),
  note: e.note,
  recordedAt: e.recordedAt.toISOString(),
  createdAt: e.createdAt.toISOString(),
});

export const createEntry = async (
  userId: string,
  weightKg: number,
  recordedAt: Date,
  note: string | null,
): Promise<WeightEntryDTO> => {
  const userPro = await isUserPro(userId);
  if (!userPro) {
    const count = await prisma.weightEntry.count({ where: { userId } });
    if (count >= FREE_WEIGHT_ENTRY_LIMIT) {
      throw new RateLimitError(
        `Free plan allows ${FREE_WEIGHT_ENTRY_LIMIT} weight entries. Upgrade to Pro for unlimited tracking.`,
      );
    }
  }
  const entry = await prisma.weightEntry.create({
    data: { userId, weightKg, recordedAt, note },
  });
  return toDTO(entry);
};

export const listEntries = async (
  userId: string,
  opts: { from?: Date; to?: Date; limit?: number } = {},
): Promise<WeightEntryDTO[]> => {
  const where: { userId: string; recordedAt?: { gte?: Date; lte?: Date } } = { userId };
  if (opts.from || opts.to) {
    where.recordedAt = {};
    if (opts.from) where.recordedAt.gte = opts.from;
    if (opts.to) where.recordedAt.lte = opts.to;
  }
  const entries = await prisma.weightEntry.findMany({
    where,
    orderBy: { recordedAt: 'desc' },
    take: opts.limit ?? 500,
  });
  return entries.map(toDTO);
};

export const latestEntry = async (userId: string): Promise<WeightEntryDTO | null> => {
  const entry = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'desc' },
  });
  return entry ? toDTO(entry) : null;
};

export const firstEntry = async (userId: string): Promise<WeightEntryDTO | null> => {
  const entry = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { recordedAt: 'asc' },
  });
  return entry ? toDTO(entry) : null;
};

export const deleteEntry = async (userId: string, id: string): Promise<void> => {
  const entry = await prisma.weightEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== userId) throw new NotFoundError('Weight entry not found');
  await prisma.weightEntry.delete({ where: { id } });
};
