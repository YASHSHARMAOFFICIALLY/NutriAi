import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createApiKeyHandler,
  createApiKeySchema,
  listApiKeysHandler,
  revokeApiKeyHandler,
  revokeApiKeyParamsSchema,
} from '../controllers/apiKeyController';

export const apiKeyRouter = Router();

apiKeyRouter.post(
  '/api-keys',
  requireAuth,
  validate(createApiKeySchema),
  createApiKeyHandler,
);

apiKeyRouter.get('/api-keys', requireAuth, listApiKeysHandler);

apiKeyRouter.delete(
  '/api-keys/:id',
  requireAuth,
  validate(revokeApiKeyParamsSchema, 'params'),
  revokeApiKeyHandler,
);
