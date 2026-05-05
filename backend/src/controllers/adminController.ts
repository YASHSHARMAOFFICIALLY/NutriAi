import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  getAdminActivity,
  getAdminAiSettings,
  getAdminUserDetail,
  getAdminOverview,
  getAdminRuntime,
  getAdminUsage,
  listAdminUsers,
  saveAdminAiSettings,
} from '../services/adminService';
import { NotFoundError } from '../utils/errors';

export const adminUsersQuerySchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminUsageQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const adminActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminUserParamsSchema = z.object({
  id: z.string().uuid(),
});

export const adminAiSettingsSchema = z.object({
  aiDailyBudgetUsd: z.coerce.number().positive().max(100),
  aiChatDailyMessageLimit: z.coerce.number().int().min(1).max(100),
  aiChatMaxWords: z.coerce.number().int().min(5).max(1000),
  aiChatHistoryWindow: z.coerce.number().int().min(1).max(50),
  aiChatMaxOutputTokens: z.coerce.number().int().min(50).max(4000),
  aiFoodTextMaxWords: z.coerce.number().int().min(3).max(500),
  aiImageDailyLimit: z.coerce.number().int().min(0).max(100),
});

export const adminOverviewHandler: RequestHandler = async (_req, res) => {
  res.json(await getAdminOverview());
};

export const adminRuntimeHandler: RequestHandler = async (_req, res) => {
  res.json(await getAdminRuntime());
};

export const adminAiSettingsHandler: RequestHandler = async (_req, res) => {
  res.json(await getAdminAiSettings());
};

export const updateAdminAiSettingsHandler: RequestHandler = async (req, res) => {
  const body = req.body as z.infer<typeof adminAiSettingsSchema>;
  res.json(await saveAdminAiSettings(body));
};

export const adminUsersHandler: RequestHandler = async (req, res) => {
  const query = req.query as unknown as z.infer<typeof adminUsersQuerySchema>;
  res.json(await listAdminUsers(query));
};

export const adminUserDetailHandler: RequestHandler = async (req, res) => {
  const params = req.params as z.infer<typeof adminUserParamsSchema>;
  const detail = await getAdminUserDetail(params.id);
  if (!detail) throw new NotFoundError('User not found');
  res.json(detail);
};

export const adminUsageHandler: RequestHandler = async (req, res) => {
  const query = req.query as unknown as z.infer<typeof adminUsageQuerySchema>;
  res.json(await getAdminUsage(query));
};

export const adminActivityHandler: RequestHandler = async (req, res) => {
  const query = req.query as unknown as z.infer<typeof adminActivityQuerySchema>;
  res.json(await getAdminActivity(query.limit));
};
