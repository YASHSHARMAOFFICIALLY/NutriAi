import type { RequestHandler } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../utils/errors';
import { confirmUpload, presignUpload } from '../services/uploadService';

export const presignSchema = z.object({
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive(),
});

export const confirmSchema = z.object({
  assetId: z.string().uuid(),
});

export type PresignBody = z.infer<typeof presignSchema>;
export type ConfirmBody = z.infer<typeof confirmSchema>;

export const presignHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as PresignBody;
  const result = await presignUpload({
    userId: req.user.id,
    contentType: body.contentType,
    size: body.size,
  });
  res.status(201).json(result);
};

export const confirmHandler: RequestHandler = async (req, res) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as ConfirmBody;
  const result = await confirmUpload({ userId: req.user.id, assetId: body.assetId });
  res.json(result);
};
