import type { RequestHandler } from 'express';
import { getUserPlan, isPro } from '../services/paymentService';
import { ForbiddenError } from '../utils/errors';

export const requirePro: RequestHandler = async (req, _res, next) => {
  const plan = await getUserPlan(req.user!.id);
  if (!isPro(plan)) {
    throw new ForbiddenError('This feature requires a Pro subscription');
  }
  next();
};
