import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

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

  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'stub']).default('openai'),
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
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: Env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
