import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { BadRequestError } from '../utils/errors';

const dodo = env.DODO_PAYMENTS_API_KEY
  ? new DodoPayments({
      bearerToken: env.DODO_PAYMENTS_API_KEY,
      environment: env.DODO_ENVIRONMENT as 'test_mode' | 'live_mode',
    })
  : null;

function requireDodo(): DodoPayments {
  if (!dodo) throw new BadRequestError('Payment provider not configured');
  return dodo;
}

// ── Subscription helpers ─────────────────────────────────────────────────

export async function getOrCreateSubscription(userId: string) {
  return prisma.subscription.upsert({
    where: { userId },
    create: { userId, tier: 'FREE', status: 'ACTIVE' },
    update: {},
  });
}

export async function getUserPlan(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return {
    tier: sub?.tier ?? 'FREE',
    status: sub?.status ?? 'ACTIVE',
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    cancelledAt: sub?.cancelledAt ?? null,
  };
}

export function isPro(sub: { tier: string; status: string }): boolean {
  return sub.tier === 'PRO' && (sub.status === 'ACTIVE' || sub.status === 'PAST_DUE');
}

// ── Checkout ─────────────────────────────────────────────────────────────

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: 'monthly' | 'lifetime',
) {
  const client = requireDodo();

  const productId =
    plan === 'monthly'
      ? env.DODO_PRODUCT_PRO_MONTHLY
      : env.DODO_PRODUCT_PRO_LIFETIME;

  if (!productId) {
    throw new BadRequestError(`Product not configured for plan: ${plan}`);
  }

  const returnUrl = `${env.FRONTEND_URL}/checkout/success`;

  const payment = await client.payments.create({
    billing: {
      city: 'NA',
      country: 'US',
      state: 'NA',
      street: 'NA',
      zipcode: '00000',
    },
    customer: { email, name: email },
    product_cart: [{ product_id: productId, quantity: 1 }],
    payment_link: true,
    return_url: returnUrl,
    metadata: { userId, plan },
  });

  return { paymentLink: payment.payment_link, paymentId: payment.payment_id };
}

// ── Webhook processing ───────────────────────────────────────────────────

interface WebhookHeaders {
  'webhook-id': string;
  'webhook-signature': string;
  'webhook-timestamp': string;
}

export function verifyWebhook(rawBody: string, headers: WebhookHeaders): unknown {
  if (!env.DODO_WEBHOOK_SECRET) {
    throw new BadRequestError('Webhook secret not configured');
  }
  const wh = new Webhook(env.DODO_WEBHOOK_SECRET);
  return wh.verify(rawBody, headers) as unknown;
}

interface DodoWebhookPayload {
  type: string;
  data: {
    payment_id?: string;
    subscription_id?: string;
    customer?: { email?: string };
    status?: string;
    metadata?: { userId?: string; plan?: string };
    product_cart?: Array<{ product_id: string; quantity: number }>;
    // subscription fields
    current_period_start?: string;
    current_period_end?: string;
    cancelled_at?: string;
  };
}

export async function handleWebhookEvent(payload: DodoWebhookPayload) {
  const { type, data } = payload;
  logger.info({ type, paymentId: data.payment_id }, 'dodo webhook received');

  switch (type) {
    case 'payment.succeeded':
      await handlePaymentSucceeded(data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(data);
      break;
    case 'subscription.active':
      await handleSubscriptionActive(data);
      break;
    case 'subscription.cancelled':
    case 'subscription.expired':
      await handleSubscriptionEnded(data);
      break;
    case 'refund.succeeded':
      await handleRefund(data);
      break;
    default:
      logger.info({ type }, 'unhandled dodo webhook event');
  }
}

async function handlePaymentSucceeded(data: DodoWebhookPayload['data']) {
  const userId = data.metadata?.userId;
  const plan = data.metadata?.plan;
  if (!userId || !data.payment_id) return;

  await prisma.payment.upsert({
    where: { dodoPaymentId: data.payment_id },
    create: {
      userId,
      dodoPaymentId: data.payment_id,
      type: plan === 'lifetime' ? 'ONE_TIME' : 'SUBSCRIPTION',
      status: 'SUCCEEDED',
      amountCents: 0, // Dodo manages pricing
      productId: data.product_cart?.[0]?.product_id ?? '',
    },
    update: { status: 'SUCCEEDED' },
  });

  // Activate Pro for lifetime purchases immediately
  if (plan === 'lifetime') {
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier: 'PRO',
        status: 'ACTIVE',
        dodoCustomerId: data.customer?.email ?? null,
      },
      update: {
        tier: 'PRO',
        status: 'ACTIVE',
      },
    });
  }
}

async function handlePaymentFailed(data: DodoWebhookPayload['data']) {
  if (!data.payment_id) return;
  await prisma.payment.updateMany({
    where: { dodoPaymentId: data.payment_id },
    data: { status: 'FAILED' },
  });
}

async function handleSubscriptionActive(data: DodoWebhookPayload['data']) {
  const userId = data.metadata?.userId;
  if (!userId) return;

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier: 'PRO',
      status: 'ACTIVE',
      dodoSubscriptionId: data.subscription_id ?? null,
      dodoCustomerId: data.customer?.email ?? null,
      currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : null,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    },
    update: {
      tier: 'PRO',
      status: 'ACTIVE',
      dodoSubscriptionId: data.subscription_id ?? null,
      currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : null,
      currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
      cancelledAt: null,
    },
  });
}

async function handleSubscriptionEnded(data: DodoWebhookPayload['data']) {
  if (!data.subscription_id) return;
  await prisma.subscription.updateMany({
    where: { dodoSubscriptionId: data.subscription_id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
}

async function handleRefund(data: DodoWebhookPayload['data']) {
  if (!data.payment_id) return;
  const payment = await prisma.payment.findUnique({
    where: { dodoPaymentId: data.payment_id },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'REFUNDED' },
  });

  // Downgrade if refunded
  await prisma.subscription.updateMany({
    where: { userId: payment.userId },
    data: { tier: 'FREE', status: 'ACTIVE' },
  });
}
