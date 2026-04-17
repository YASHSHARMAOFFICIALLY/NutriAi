import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import { issueApiKey, listApiKeys, revokeApiKey } from '../services/apiKeyService';

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  rateLimitPerMin: z.number().int().positive().max(6000).optional(),
});

export type CreateApiKeyBody = z.infer<typeof createApiKeySchema>;

export const revokeApiKeyParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createApiKeyHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as CreateApiKeyBody;
  const issued = await issueApiKey({
    userId: req.user.id,
    name: body.name,
    scopes: body.scopes,
    rateLimitPerMin: body.rateLimitPerMin,
  });
  res.status(201).json(issued);
};

export const listApiKeysHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const keys = await listApiKeys(req.user.id);
  res.json({ keys });
};

export const revokeApiKeyHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const { id } = req.params as { id: string };
  const row = await revokeApiKey(req.user.id, id);
  res.json({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    revokedAt: row.revokedAt,
  });
};
