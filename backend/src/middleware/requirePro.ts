import type { RequestHandler } from 'express';
import { getUserPlan, isPro } from '../services/paymentService';
import { ForbiddenError } from '../utils/errors';
import { requireUser } from '../utils/requestUser';

export const requirePro: RequestHandler = async (req, _res, next) => {
  const user = requireUser(req);
  const plan = await getUserPlan(user.id);
  if (!isPro(plan)) {
    throw new ForbiddenError('This feature requires a Pro subscription');
  }
  next();
};
