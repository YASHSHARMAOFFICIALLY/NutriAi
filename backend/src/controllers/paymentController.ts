import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createCheckoutSession,
  getUserPlan,
  handleWebhookEvent,
  verifyWebhook,
} from '../services/paymentService';
import { BadRequestError } from '../utils/errors';

const CheckoutSchema = z.object({
  plan: z.enum(['monthly', 'lifetime']),
});

export const createCheckout = async (req: Request, res: Response) => {
  const { plan } = CheckoutSchema.parse(req.body);
  const result = await createCheckoutSession(req.user!.id, req.user!.email, plan);
  res.json(result);
};

export const getMyPlan = async (req: Request, res: Response) => {
  const plan = await getUserPlan(req.user!.id);
  res.json(plan);
};

export const webhookHandler = async (req: Request, res: Response) => {
  const webhookId = req.headers['webhook-id'] as string;
  const webhookSignature = req.headers['webhook-signature'] as string;
  const webhookTimestamp = req.headers['webhook-timestamp'] as string;

  if (!webhookId || !webhookSignature || !webhookTimestamp) {
    throw new BadRequestError('Missing webhook headers');
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  if (!rawBody) {
    throw new BadRequestError('Missing raw body');
  }

  const payload = verifyWebhook(rawBody, {
    'webhook-id': webhookId,
    'webhook-signature': webhookSignature,
    'webhook-timestamp': webhookTimestamp,
  });

  await handleWebhookEvent(payload as Parameters<typeof handleWebhookEvent>[0]);

  res.json({ received: true });
};
