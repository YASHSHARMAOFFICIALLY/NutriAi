import 'dotenv/config';
import { z } from 'zod';

const TrustProxySchema = z
  .string()
  .default('false')
  .transform((value) => value.trim())
  .transform((value) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return Number(value);
    if (value === 'loopback' || value === 'linklocal' || value === 'uniquelocal') return value;
    throw new Error('TRUST_PROXY must be false, true, a non-negative integer, or a supported preset');
  });

const OptionalUrlSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().url().optional(),
);

const BooleanSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return value;
}, z.boolean());

const isLocalhostUrl = (value: string): boolean => {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};

const requireProductionHttpsUrl = (ctx: z.RefinementCtx, key: string, value: string): void => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [key], message: `${key} must be a valid URL` });
    return;
  }
  if (parsed.protocol !== 'https:' || isLocalhostUrl(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [key],
      message: `${key} must be a public https URL in production`,
    });
  }
};

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY: TrustProxySchema,

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_FAIL_OPEN: BooleanSchema.default(false),
  READINESS_CHECK_TIMEOUT_MS: z.coerce.number().int().positive().default(1500),
  METRICS_BEARER_TOKEN: z.string().min(24).optional(),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:4000/auth/google/callback'),

  FRONTEND_POST_LOGIN_URL: z.string().default('http://localhost:3000/auth/callback'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('NutriAI <noreply@nutriai.local>'),

  EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().int().positive().default(24),
  PASSWORD_RESET_TTL_HOURS: z.coerce.number().int().positive().default(1),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: OptionalUrlSchema,
  AWS_S3_FORCE_PATH_STYLE: BooleanSchema.default(false),
  UPLOAD_PRESIGN_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  UPLOAD_MAX_SIZE_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),

  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'gemini', 'stub']).default('openai'),
  GEMINI_API_KEY: z.string().optional(),
  USDA_API_KEY: z.string().default('DEMO_KEY'),
  AI_MODEL_TEXT: z.string().default('gpt-4o-mini'),
  AI_MODEL_VISION: z.string().default('gpt-4o'),
  AI_MODEL_CHAT: z.string().default('gpt-4o-mini'),
  AI_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(86_400),
  AI_CHAT_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(3_600),
  AI_CHAT_HISTORY_WINDOW: z.coerce.number().int().positive().default(8),
  AI_CHAT_DAILY_MESSAGE_LIMIT: z.coerce.number().int().positive().default(5),
  AI_CHAT_MAX_WORDS: z.coerce.number().int().positive().default(100),
  AI_CHAT_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(220),
  AI_FOOD_TEXT_MAX_WORDS: z.coerce.number().int().positive().default(40),
  AI_IMAGE_DAILY_LIMIT: z.coerce.number().int().positive().default(3),
  AI_DAILY_BUDGET_USD: z.coerce.number().positive().default(2),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(25_000),
  AI_MAX_CONCURRENT_REQUESTS: z.coerce.number().int().positive().default(20),
  AI_QUEUE_TIMEOUT_MS: z.coerce.number().int().positive().default(2_000),
  ENABLE_DIGEST_JOBS: BooleanSchema.default(false),

  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_USERNAME: z.string().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  TELEGRAM_LINK_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  TELEGRAM_PENDING_ACTION_TTL_MINUTES: z.coerce.number().int().positive().default(15),
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') return;

  for (const origin of value.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)) {
    requireProductionHttpsUrl(ctx, 'CORS_ORIGIN', origin);
  }
  requireProductionHttpsUrl(ctx, 'FRONTEND_POST_LOGIN_URL', value.FRONTEND_POST_LOGIN_URL);
  requireProductionHttpsUrl(ctx, 'FRONTEND_URL', value.FRONTEND_URL);
  if (value.GOOGLE_CLIENT_ID || value.GOOGLE_CLIENT_SECRET) {
    requireProductionHttpsUrl(ctx, 'GOOGLE_CALLBACK_URL', value.GOOGLE_CALLBACK_URL);
  }

  if (value.RATE_LIMIT_FAIL_OPEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['RATE_LIMIT_FAIL_OPEN'],
      message: 'RATE_LIMIT_FAIL_OPEN must be false in production',
    });
  }
  if (!value.METRICS_BEARER_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['METRICS_BEARER_TOKEN'],
      message: 'METRICS_BEARER_TOKEN is required in production',
    });
  }
  if (value.JWT_ACCESS_SECRET.length < 32) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_ACCESS_SECRET'],
      message: 'JWT_ACCESS_SECRET must be at least 32 characters in production',
    });
  }
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
