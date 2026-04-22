import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import {
  adminActivityHandler,
  adminOverviewHandler,
  adminRuntimeHandler,
  adminUsageHandler,
  adminUsersHandler,
} from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));
adminRouter.get('/overview', adminOverviewHandler);
adminRouter.get('/runtime', adminRuntimeHandler);
adminRouter.get('/users', adminUsersHandler);
adminRouter.get('/usage', adminUsageHandler);
adminRouter.get('/activity', adminActivityHandler);
