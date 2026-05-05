import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireAdminOwner } from '../middleware/rbac';
import { validate } from '../middleware/validate';
import {
  adminActivityQuerySchema,
  adminActivityHandler,
  adminAiSettingsSchema,
  adminAiSettingsHandler,
  adminOverviewHandler,
  adminRuntimeHandler,
  adminUsageQuerySchema,
  adminUserParamsSchema,
  adminUserDetailHandler,
  adminUsersQuerySchema,
  updateAdminAiSettingsHandler,
  adminUsageHandler,
  adminUsersHandler,
} from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireAdminOwner);
adminRouter.get('/overview', adminOverviewHandler);
adminRouter.get('/runtime', adminRuntimeHandler);
adminRouter.get('/users', validate(adminUsersQuerySchema, 'query'), adminUsersHandler);
adminRouter.get('/users/:id', validate(adminUserParamsSchema, 'params'), adminUserDetailHandler);
adminRouter.get('/usage', validate(adminUsageQuerySchema, 'query'), adminUsageHandler);
adminRouter.get('/activity', validate(adminActivityQuerySchema, 'query'), adminActivityHandler);
adminRouter.get('/ai-settings', adminAiSettingsHandler);
adminRouter.put('/ai-settings', validate(adminAiSettingsSchema), updateAdminAiSettingsHandler);
