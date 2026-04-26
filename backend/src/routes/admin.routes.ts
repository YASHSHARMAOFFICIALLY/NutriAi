import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  adminActivityHandler,
  adminAiSettingsHandler,
  adminOverviewHandler,
  adminRuntimeHandler,
  adminUserDetailHandler,
  updateAdminAiSettingsHandler,
  adminUsageHandler,
  adminUsersHandler,
} from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/overview', adminOverviewHandler);
adminRouter.get('/runtime', adminRuntimeHandler);
adminRouter.get('/users', adminUsersHandler);
adminRouter.get('/users/:id', adminUserDetailHandler);
adminRouter.get('/usage', adminUsageHandler);
adminRouter.get('/activity', adminActivityHandler);
adminRouter.get('/ai-settings', adminAiSettingsHandler);
adminRouter.put('/ai-settings', updateAdminAiSettingsHandler);
