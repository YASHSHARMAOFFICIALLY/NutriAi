# NutriAI Backend Engineering Guide

This README explains the backend as if you are inheriting the codebase from
scratch. It covers what the backend does, why the stack was chosen, how the
folders are organized, which features were built in which order, what each
important file is responsible for, how requests move through the system, and
what should be improved before or during SaaS launch.

The backend is not a throwaway project scaffold. It is the API, data, auth,
AI, and integration layer for a nutrition SaaS. The website, Telegram bot, and
future mobile app should all write through the same backend services so user
data stays consistent.

## Product Role

NutriAI lets users:

- Create an account with Google or email/password.
- Complete a nutrition profile.
- Analyze food from text, image URLs, direct website uploads, public API calls,
  or Telegram messages.
- Convert analyzed food into logged meals.
- Track daily calories, macros, streaks, weight, challenges, and history.
- Chat with a nutrition assistant that can use recent context.
- Receive or later schedule email digest/reminder flows.
- Use API keys for B2B or integration use cases.
- Connect Telegram for lower-friction meal logging when the website feels too
  heavy for daily use.

The backend owns the trustworthy state:

- Users and sessions.
- Profile targets and health-adjacent preferences.
- Food analysis records.
- Meal logs.
- Uploaded image assets.
- AI usage and cost telemetry.
- API keys and metered usage.
- Telegram account links.

The frontend should be treated as a client. It can render and help users input
data, but the backend must remain the source of truth.

## Tech Stack And Why It Was Chosen

### Node.js 20

Node is a practical fit because this backend is mostly IO-bound: HTTP requests,
database reads/writes, Redis caching, S3 calls, AI provider calls, email calls,
and Telegram webhooks. Node 20 also gives native `fetch`, modern runtime APIs,
and stable TypeScript tooling.

### TypeScript

Nutrition and SaaS data are easy to corrupt if request shapes drift. TypeScript
helps keep route handlers, services, Prisma models, AI provider contracts, and
frontend DTOs coherent. It is especially useful because AI-written code often
looks correct but quietly changes a property name or return shape.

### Express

Express is simple and explicit. The app uses a classic layered structure:

```txt
route -> middleware -> controller -> service -> database/provider
```

This makes it easy to add new channels like Telegram without changing the
existing website routes. Telegram can call the same services as the website.

### Prisma And PostgreSQL

PostgreSQL stores durable application data. Prisma provides:

- A typed schema for models and relations.
- Migrations for production-safe schema changes.
- A generated client used throughout services.
- Easier relation loading for user-owned data.

Postgres is the right default for this product because users, meals, profiles,
queries, API keys, and integrations are relational.

### Redis

Redis is used for:

- Rate limiting buckets.
- AI response cache.
- Chat/AI cache paths.

AI calls are expensive and slow. Redis avoids repeated work for identical food
queries and protects endpoints from abuse.

### AWS S3

Food images should not be streamed through the API server. S3 gives a safe
object store for user images. The website flow uses presigned upload URLs, and
the Telegram flow downloads Telegram files server-side and stores them as
normal NutriAI assets.

### OpenAI SDK Behind A Provider Interface

AI provider logic is hidden behind `src/ai/provider.ts`. That gives three
important benefits:

- Production can use OpenAI.
- Development and tests can use the deterministic stub provider.
- Future providers such as Gemini can be swapped without rewriting services.

### Zod

Zod validates request bodies, query strings, and params at the edge. This keeps
controllers thin and prevents invalid data from entering services.

### JWT Access Tokens And Refresh Tokens

Access tokens are short-lived bearer tokens. Refresh tokens are stored hashed in
the database and normally transported through cookies. This supports web app
sessions while keeping server-side revocation possible.

### Helmet, CORS, Pino

- Helmet adds conservative security headers.
- CORS restricts browser clients to configured origins.
- Pino provides structured logs for debugging, production monitoring, and AI
  cost visibility.

## High-Level Architecture

The backend is intentionally layered:

```txt
src/server.ts
  creates HTTP listener
  handles shutdown and scheduled jobs

src/app.ts
  builds Express app
  installs global middleware
  mounts routers
  installs error handling

src/routes/*
  maps URL paths and HTTP methods to controller handlers
  attaches auth/rate limit/validation middleware

src/controllers/*
  parses already-validated input
  calls service functions
  shapes HTTP responses

src/services/*
  owns business rules
  reads/writes Prisma models
  calls AI, S3, email, Telegram, or Redis helpers

src/ai/*
  provider abstraction
  prompts
  caching
  pricing
  token usage

src/config/*
  process environment
  shared clients
  third-party setup

src/middleware/*
  reusable request pipeline logic

src/utils/*
  small pure helpers and application errors

prisma/*
  schema and migrations

tests/*
  focused unit/contract tests
```

The core rule is: controllers should stay thin, services should own behavior,
and shared business logic should never be duplicated separately for web,
Telegram, and public API clients.

## Request Flow Example: Website Food Text

1. Frontend calls `POST /analyze-food` with `{ text: "2 eggs and toast" }`.
2. `food.routes.ts` requires auth, applies an AI-specific rate limit, validates
   the body with `analyzeFoodSchema`, and calls `analyzeFoodHandler`.
3. `foodController.ts` extracts `req.user.id` and calls `analyzeFood`.
4. `foodService.ts` canonicalizes the input, hashes it, checks Redis cache,
   checks DB history and USDA for text, then calls the configured AI provider if
   needed.
5. The result is stored in `FoodQuery` and `FoodItem`.
6. The response returns `queryId`, items, totals, confidence, and provider
   metadata.
7. If the user confirms the food as a meal, frontend calls `POST /meals` with
   `foodQueryId`.
8. `mealService.ts` snapshots the query items into `Meal` and `MealItem`.

## Request Flow Example: Telegram Food Photo

1. Telegram sends a webhook to `POST /telegram/webhook`.
2. `telegramController.ts` validates the Telegram secret token in production.
3. `telegramService.ts` verifies that the Telegram user is linked to a NutriAI
   user.
4. The bot calls Telegram `getFile`, downloads the image server-side, uploads it
   to S3, and creates an `Asset`.
5. It calls the same `analyzeFood` service used by the website.
6. The bot sends a result message with inline buttons.
7. When the user taps `Log lunch`, the callback consumes one
   `TelegramPendingAction` and calls the same `createMeal` service used by the
   website.

This is the correct architecture: Telegram is only another input channel, not a
second nutrition system.

## Development Setup

From repo root:

```bash
cd backend
cp .env.example .env
npm install
docker compose up -d
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Health check:

```bash
curl -s http://localhost:4000/health
```

Expected shape:

```json
{ "ok": true, "service": "nutriai-backend", "env": "development" }
```

## Scripts

| Script | Role |
| --- | --- |
| `npm run dev` | Starts the development server with `tsx watch`. |
| `npm run build` | Type-checks and compiles TypeScript to `dist/`. |
| `npm start` | Runs the compiled production entrypoint. |
| `npm run lint` | Runs ESLint on backend TypeScript files. |
| `npm test` | Runs the Vitest test suite. |
| `npm run test:watch` | Runs Vitest in watch mode. |
| `npm run prisma:generate` | Regenerates Prisma Client from schema. |
| `npm run prisma:migrate` | Creates/applies development migrations. |
| `npm run prisma:deploy` | Applies checked-in migrations in production. |
| `npm run prisma:studio` | Opens Prisma Studio. |
| `npm run smoke` | Runs the smoke script in `scripts/smoke.mjs`. |

## Environment Variables

See `.env.example` for the complete list. The most important groups are:

### Runtime

- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`
- `TRUST_PROXY`

### Data Stores

- `DATABASE_URL`
- `REDIS_URL`

### Auth

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- Google OAuth variables.

### Email

- `RESEND_API_KEY`
- `EMAIL_FROM`
- email token TTLs.

### Uploads

- AWS credentials and bucket settings.
- `UPLOAD_PRESIGN_TTL_SECONDS`
- `UPLOAD_MAX_SIZE_BYTES`

### AI

- `AI_PROVIDER`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- model names.
- cache and timeout values.

### Telegram

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_LINK_TOKEN_TTL_MINUTES`
- `TELEGRAM_PENDING_ACTION_TTL_MINUTES`

In production, `TELEGRAM_WEBHOOK_SECRET` should be set and configured with
Telegram's webhook secret token.

## Database Build Order

The migration folders show the historical feature build order:

1. `20250101000000_init_auth`
   - Users, roles, refresh tokens, Google login foundation.
2. `20250102000000_food_analysis`
   - `FoodQuery`, `FoodItem`, token usage, food input types.
3. `20250103000000_meal_tracker`
   - `Meal`, `MealItem`, meal types, daily meal logging.
4. `20250104000000_ai_chat`
   - Conversations and messages for the chat assistant.
5. `20250105000000_image_upload`
   - `Asset` model for S3-backed food images.
6. `20250106000000_personalization`
   - User profile, body data, goals, allergies, preferences, budget, targets.
7. `20250107000000_public_api`
   - API keys and API usage metering.
8. `20250108000000_email_password_auth`
   - Email verification and password reset tokens.
9. `20250109000000_challenges`
   - Challenge presets and user challenge progress.
10. `20260419000000_email_digest_prefs`
    - Notification preference fields.
11. `20260419020000_weight_entry`
    - Weight tracking.
12. `20260423000000_telegram_integration`
    - Telegram account links, link tokens, and pending meal-log actions.

This order also explains how the backend was probably implemented:

1. Auth and app shell first.
2. Food analysis second.
3. Meal logging third.
4. Chat and image uploads after core food analysis.
5. Personalization and analytics after meals existed.
6. Public API/admin/challenges/weight once the SaaS surface expanded.
7. Telegram last as a lower-friction daily logging channel.

## Folder And File Guide

### Root Files

| File | Role |
| --- | --- |
| `package.json` | Scripts, dependencies, Node version, backend package metadata. |
| `package-lock.json` | Exact dependency lockfile. Commit this for reproducible installs. |
| `tsconfig.json` | TypeScript compiler settings. |
| `eslint.config.mjs` | Backend lint rules. |
| `vitest.config.ts` | Vitest setup, test timeout, and include pattern. |
| `.env.example` | Documented environment variable template. |
| `docker-compose.yml` | Local Postgres and Redis services. |
| `README.md` | This guide. |

### `src/server.ts`

Production/development entrypoint. It:

- Creates the Express app using `createApp`.
- Starts listening on `env.PORT`.
- Starts digest jobs if enabled.
- Handles `SIGINT` and `SIGTERM`.
- Closes Redis on shutdown.

Keep long-running process concerns here. Do not put routes or business logic in
this file.

### `src/app.ts`

Express application assembly. It:

- Sets trust proxy.
- Assigns request IDs.
- Installs Helmet, CORS, JSON parsing, cookies, logging, metrics.
- Initializes Passport.
- Mounts liveness/readiness/metrics.
- Mounts Telegram webhook before the global rate limiter.
- Installs global rate limiting.
- Mounts feature routers.
- Installs 404 and error handlers.

This file defines the HTTP pipeline order. Middleware order matters here.

### `src/config`

| File | Role |
| --- | --- |
| `env.ts` | Reads and validates environment variables with Zod. Fails fast on invalid config. |
| `logger.ts` | Creates the shared Pino logger. |
| `passport.ts` | Configures Google OAuth strategy and user lookup/upsert behavior. |
| `prisma.ts` | Exports the Prisma client singleton. |
| `redis.ts` | Exports Redis client for cache/rate limit use. |
| `s3.ts` | Builds S3 client and bucket helpers. |

Config files should create clients and validate settings, not implement feature
logic.

### `src/middleware`

| File | Role |
| --- | --- |
| `auth.ts` | Reads bearer tokens, verifies JWTs, loads `req.user`, and provides `requireAuth`. |
| `apiKey.ts` | Validates public API keys and scopes. |
| `rbac.ts` | Role-based access checks such as admin-only routes. |
| `rateLimit.ts` | Redis-backed rate limiting middleware. |
| `validate.ts` | Applies Zod schemas to body/query/params. |
| `error.ts` | Converts Zod errors and `AppError` instances into JSON API errors. |
| `metrics.ts` | Tracks request metrics for `/metrics`. |

Middleware should be reusable and side-effect-light. If logic needs database
business rules, prefer a service.

### `src/utils`

| File | Role |
| --- | --- |
| `errors.ts` | Application error classes such as `BadRequestError`, `UnauthorizedError`, `NotFoundError`. |
| `hash.ts` | Hash helpers, currently SHA-256. |
| `jwt.ts` | JWT signing and verification helpers. |
| `pagination.ts` | Pagination parsing and metadata helpers. |
| `urlSafety.ts` | Prevents unsafe image URLs such as localhost or IP literals. |

These should stay small and mostly pure.

### `src/ai`

| File | Role |
| --- | --- |
| `provider.ts` | Shared provider interfaces for food analysis and chat. |
| `index.ts` | Selects the configured provider based on `AI_PROVIDER`. |
| `openaiProvider.ts` | OpenAI implementation for text, vision, and chat. |
| `geminiProvider.ts` | Gemini provider path, if configured. |
| `stubProvider.ts` | Deterministic offline provider for tests/dev. |
| `prompts/foodAnalysis.ts` | Prompt and output expectations for food analysis. |
| `prompts/chat.ts` | Prompt/context rules for chat assistant. |
| `cache.ts` | Redis AI cache helpers. |
| `canonicalize.ts` | Stable input canonicalization before hashing. |
| `pricing.ts` | Token pricing calculations. |
| `usage.ts` | Persists and logs token usage. |
| `guard.ts` | Concurrency/timeout protection around AI calls. |
| `dbLookup.ts` | Looks up prior high-confidence food items from NutriAI DB history. |
| `usdaLookup.ts` | Uses USDA FoodData Central before paid AI for simple text foods. |

AI endpoints follow a cost-control ladder:

1. Redis cache.
2. Internal DB lookup for prior known foods.
3. USDA lookup for text foods.
4. Paid AI provider.

### Controllers

Controllers are thin HTTP adapters. They should not contain heavy business
logic.

| File | Role |
| --- | --- |
| `healthController.ts` | `/health`, `/ready`, `/metrics`. |
| `authController.ts` | Google OAuth, refresh, logout, current user, dev login. |
| `emailAuthController.ts` | Signup/login/verify/reset email-password flows. |
| `foodController.ts` | Validates and handles `/analyze-food`. |
| `mealController.ts` | Create/list/delete meals and daily summary. |
| `historyController.ts` | Query user's prior food analyses. |
| `chatController.ts` | Chat messages and conversation CRUD. |
| `uploadController.ts` | Presign and confirm image uploads. |
| `profileController.ts` | Profile get/update/delete. |
| `analyticsController.ts` | Daily, macro, and streak analytics. |
| `recommendationController.ts` | Meal recommendation endpoint. |
| `apiKeyController.ts` | API key issue/list/revoke. |
| `publicController.ts` | Public API calorie endpoint. |
| `challengeController.ts` | Preset and user challenge actions. |
| `weightController.ts` | Weight entry CRUD. |
| `adminController.ts` | Admin overview, users, usage, and activity. |
| `telegramController.ts` | Telegram status/link/unlink and webhook HTTP handler. |

### Routes

Routes wire URL paths to middleware and controllers.

| File | Role |
| --- | --- |
| `auth.routes.ts` | `/auth/*` routes. |
| `food.routes.ts` | `/analyze-food` with auth and AI rate limit. |
| `meal.routes.ts` | `/meals` and `/meals/daily-summary`. |
| `history.routes.ts` | `/history`. |
| `chat.routes.ts` | `/chat` and conversation routes. |
| `upload.routes.ts` | `/uploads/presign`, `/uploads/confirm`. |
| `profile.routes.ts` | `/profile`. |
| `analytics.routes.ts` | `/analytics/daily`, `/analytics/macros`, `/analytics/streak`. |
| `recommendation.routes.ts` | `/recommendations/meals`. |
| `apiKey.routes.ts` | `/api-keys`. |
| `public.routes.ts` | `/v1/public/*` behind API key middleware. |
| `challenge.routes.ts` | `/challenges/*`. |
| `weight.routes.ts` | `/weight`. |
| `admin.routes.ts` | `/admin/*` behind admin role checks. |
| `telegram.routes.ts` | `/telegram/webhook`, `/telegram/status`, `/telegram/link-token`, `/telegram/unlink`. |

When adding a feature, create or update a route file, then mount it in
`app.ts`.

### Services

Services own application behavior.

| File | Role |
| --- | --- |
| `authService.ts` | Token issuing/revocation and refresh token storage. |
| `emailAuthService.ts` | Email signup/login, verification, password reset. |
| `emailService.ts` | Sends or logs emails via Resend/dev fallback. |
| `foodService.ts` | Main food analysis pipeline and `FoodQuery` persistence. |
| `mealService.ts` | Meal creation, day windows, daily summaries, deletion. |
| `historyService.ts` | Paginated/filterable food query history. |
| `chatService.ts` | Conversation persistence and assistant replies. |
| `uploadService.ts` | S3 presign/confirm/read URL asset lifecycle. |
| `profileService.ts` | Profile upsert, derived targets, effective targets. |
| `analyticsService.ts` | Daily series, macro analytics, streak logic. |
| `recommendationService.ts` | Ranks meal suggestions from history and remaining targets. |
| `apiKeyService.ts` | API key generation, hashing, revocation, usage metering. |
| `publicFoodService.ts` | Public API wrapper around food analysis. |
| `challengeService.ts` | Challenge list/start/check-in behavior. |
| `weightService.ts` | Weight entry create/list/get/delete behavior. |
| `adminService.ts` | Admin dashboards, user rows, usage breakdown, activity feed. |
| `runtimeMetrics.ts` | In-memory request metrics aggregation. |
| `digestService.ts` | Data selection for digest/reminder jobs. |
| `telegramAccountService.ts` | Link token creation, Telegram account linking, status, unlink cleanup. |
| `telegramService.ts` | Telegram bot update handling, commands, photo upload, analysis, and meal logging. |

If frontend and Telegram both need the same behavior, put it in a service once
and call it from both controllers.

### Workers

| File | Role |
| --- | --- |
| `workers/emailDigest.ts` | Schedules digest/reminder jobs when `ENABLE_DIGEST_JOBS=true`. |

Workers should reuse services. They should not duplicate query or email logic.

### Prisma

| File | Role |
| --- | --- |
| `schema.prisma` | Source of truth for database models, enums, indexes, and relations. |
| `migrations/*/migration.sql` | Checked-in SQL migration history. |
| `seed-challenges.ts` | Seeds preset challenges. |

### Tests

Tests are focused unit/contract tests. They currently cover auth middleware,
schemas, utilities, analytics, meal logic, profile logic, recommendations,
uploads, AI provider behavior, Telegram hardening, and more.

| File | Role |
| --- | --- |
| `setup.ts` | Test environment defaults. |
| `telegram.test.ts` | Telegram link cleanup, HTML escaping, text length guard, and idempotent callback logging. |
| Other `*.test.ts` files | Focused tests for their matching utility/service/controller contracts. |

## Endpoint Map

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Liveness probe. |
| `GET` | `/ready` | No | Readiness probe. |
| `GET` | `/metrics` | No | Basic runtime metrics. |
| `GET` | `/auth/google` | No | Start Google OAuth. |
| `GET` | `/auth/google/callback` | No | OAuth callback. |
| `POST` | `/auth/refresh` | Cookie | Rotate refresh token. |
| `POST` | `/auth/logout` | Cookie/body | Revoke refresh token. |
| `GET` | `/auth/me` | Bearer | Current user. |
| `POST` | `/auth/dev-login` | Dev | Dev-only login. |
| `POST` | `/auth/register` | No | Email signup. |
| `POST` | `/auth/login` | No | Email login. |
| `POST` | `/auth/verify-email` | No | Verify email. |
| `POST` | `/auth/forgot-password` | No | Request reset. |
| `POST` | `/auth/reset-password` | No | Complete reset. |
| `POST` | `/analyze-food` | Bearer | Analyze food text/image/asset. |
| `GET` | `/history` | Bearer | Food analysis history. |
| `POST` | `/meals` | Bearer | Log a meal. |
| `GET` | `/meals` | Bearer | List meals for a date. |
| `GET` | `/meals/daily-summary` | Bearer | Daily totals. |
| `DELETE` | `/meals/:id` | Bearer | Delete meal. |
| `POST` | `/chat` | Bearer | Send assistant message. |
| `GET` | `/chat/conversations` | Bearer | List conversations. |
| `GET` | `/chat/conversations/:id` | Bearer | Read conversation. |
| `DELETE` | `/chat/conversations/:id` | Bearer | Delete conversation. |
| `POST` | `/uploads/presign` | Bearer | Create S3 upload URL. |
| `POST` | `/uploads/confirm` | Bearer | Confirm upload. |
| `GET` | `/profile` | Bearer | Read profile. |
| `PUT` | `/profile` | Bearer | Upsert profile. |
| `DELETE` | `/profile` | Bearer | Delete profile. |
| `GET` | `/analytics/daily` | Bearer | Daily series. |
| `GET` | `/analytics/macros` | Bearer | Macro totals and energy share. |
| `GET` | `/analytics/streak` | Bearer | Streak analytics. |
| `GET` | `/recommendations/meals` | Bearer | Meal suggestions. |
| `POST` | `/api-keys` | Bearer | Issue API key. |
| `GET` | `/api-keys` | Bearer | List API keys. |
| `DELETE` | `/api-keys/:id` | Bearer | Revoke API key. |
| `POST` | `/v1/public/calories` | API key | Public food analysis. |
| `GET` | `/challenges` | Bearer | List challenges. |
| `POST` | `/challenges/start` | Bearer | Start challenge. |
| `POST` | `/challenges/:id/check-in` | Bearer | Challenge check-in. |
| `GET` | `/weight` | Bearer | List weight entries. |
| `POST` | `/weight` | Bearer | Create weight entry. |
| `DELETE` | `/weight/:id` | Bearer | Delete weight entry. |
| `GET` | `/admin/*` | Admin | Admin dashboards. |
| `POST` | `/telegram/webhook` | Secret token | Telegram bot webhook. |
| `GET` | `/telegram/status` | Bearer | Telegram link status. |
| `POST` | `/telegram/link-token` | Bearer | Create Telegram deep link. |
| `DELETE` | `/telegram/unlink` | Bearer | Unlink Telegram. |

## Important Feature Notes

### Food Analysis

Food analysis is intentionally stored as `FoodQuery` first, not directly as a
meal. This lets users inspect an estimate before logging it. It also enables
history, cache, public API responses, Telegram pending actions, and later
corrections.

### Meal Logging

`Meal` snapshots totals and items. This is correct because AI estimates may
change in future models, but an already logged meal should remain stable.

### Analytics

Analytics read from `Meal`, not `FoodQuery`. A food query means "the system
estimated food." A meal means "the user logged it." Dashboards should count
logged meals.

### Uploads

Website uploads are direct-to-S3 with presigned URLs. Telegram uploads are
server-side because Telegram files require the bot token and should never be
exposed to the browser.

### Telegram

Telegram has three tables:

- `TelegramAccount`: a linked Telegram identity for a NutriAI user.
- `TelegramLinkToken`: short-lived website-to-bot link tokens.
- `TelegramPendingAction`: temporary state between "AI analyzed this food" and
  "user tapped Log lunch."

Telegram callback logging consumes pending actions before logging. This avoids
double-tap duplicate meals.

## Backend Improvement Areas Beyond Telegram

These are good SaaS-quality improvements to consider next:

1. Add integration tests around the full authenticated HTTP flows with
   Supertest and a test database.
2. Add a database cleanup job for expired tokens and expired Telegram pending
   actions.
3. Add audit logs for sensitive account events: login, logout, password reset,
   Telegram link/unlink, API key creation/revocation.
4. Add account deletion and data export workflows. The frontend currently avoids
   fake destructive actions.
5. Add stricter Redis behavior in tests so connection errors do not create noisy
   logs.
6. Add OpenAPI generation from Zod schemas or a maintained API spec.
7. Add request tracing around AI calls, S3 calls, Telegram webhooks, and email.
8. Add retry/backoff for Telegram send failures and email provider failures.
9. Add moderation/safety checks for uploaded images and unsupported food inputs.
10. Add timezone-aware meal windows. Current meal day windows are UTC-based.
11. Add nutrition correction/edit flows so users can adjust AI estimates before
    logging.
12. Add row-level ownership tests for every user-owned read/write route.
13. Add background cleanup for old uploaded assets that never get confirmed.
14. Add idempotency keys for public API and expensive analysis endpoints.
15. Add cost ceilings per user/API key/day to protect AI spend.

## How To Add A New Backend Feature

Use this order:

1. Add or update Prisma models.
2. Create a migration.
3. Add service logic.
4. Add controller schema and handler.
5. Add route with auth, validation, and rate limits.
6. Mount route in `app.ts`.
7. Add tests for schema, service behavior, and security edge cases.
8. Update frontend API client types.
9. Update this README if the feature changes architecture or developer workflow.

## Production Checklist

Before launch:

- Run `npm run lint`.
- Run `npm run build`.
- Run `npm test`.
- Run `npm run prisma:deploy` on production.
- Confirm `CORS_ORIGIN` matches deployed frontend domains.
- Confirm JWT secrets are strong and unique.
- Confirm S3 bucket permissions are private.
- Confirm Redis is reachable.
- Confirm OpenAI/Gemini provider keys and model names are valid.
- Confirm Resend sender domain is verified.
- Confirm Telegram webhook is configured with secret token.
- Confirm admin users are correctly assigned.
- Confirm backups and database monitoring exist.

## Current Verification Status

At the time this guide was written, backend checks passed:

```bash
npm run lint
npm run build
npm test
```

The test suite includes 18 test files and 113 tests after Telegram tests were
added.
