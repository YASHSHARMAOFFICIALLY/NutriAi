import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  getAdminActivity,
  getAdminOverview,
  getAdminRuntime,
  getAdminUsage,
  listAdminUsers,
} from '../services/adminService';

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

export const adminOverviewHandler: RequestHandler = async (_req, res) => {
  res.json(await getAdminOverview());
};

export const adminRuntimeHandler: RequestHandler = async (_req, res) => {
  res.json(await getAdminRuntime());
};

export const adminUsersHandler: RequestHandler = async (req, res) => {
  const query = adminUsersQuerySchema.parse(req.query);
  res.json(await listAdminUsers(query));
};

export const adminUsageHandler: RequestHandler = async (req, res) => {
  const query = adminUsageQuerySchema.parse(req.query);
  res.json(await getAdminUsage(query));
};

export const adminActivityHandler: RequestHandler = async (req, res) => {
  const query = adminActivityQuerySchema.parse(req.query);
  res.json(await getAdminActivity(query.limit));
};
