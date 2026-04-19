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

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  TRUST_PROXY: TrustProxySchema,

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().default('http://localhost:4000/auth/google/callback'),

  FRONTEND_POST_LOGIN_URL: z.string().default('http://localhost:3000/auth/callback'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().url().optional(),
  AWS_S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),
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
  AI_CHAT_HISTORY_WINDOW: z.coerce.number().int().positive().default(20),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
