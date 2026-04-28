import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { createCheckout, getMyPlan, webhookHandler } from '../controllers/paymentController';

export const paymentRouter = Router();

paymentRouter.get('/payments/plan', requireAuth, getMyPlan);
paymentRouter.post('/payments/checkout', requireAuth, createCheckout);

// Webhook route — no auth, verified via webhook signature.
// Needs raw body, mounted separately in app.ts with raw body parser.
export const paymentWebhookRouter = Router();
paymentWebhookRouter.post('/webhooks/dodo', webhookHandler);
