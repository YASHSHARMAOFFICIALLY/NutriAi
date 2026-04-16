# NutriAI Backend

AI-powered calorie and nutrition SaaS platform.

## Stack

- Node.js 20 + TypeScript (strict)
- Express 4
- PostgreSQL + Prisma ORM
- Redis (caching + rate limiting)
- AWS S3 (image storage)
- Google OAuth 2.0 + JWT (access + refresh)
- OpenAI SDK behind a swappable AI provider interface
- Zod validation, Helmet, CORS, pino structured logs

## Project Structure

```
backend/
  src/
    config/       # env, prisma, redis, logger, s3, passport
    middleware/   # auth, rbac, error, rateLimit, validate
    controllers/  # thin HTTP handlers
    routes/       # express routers
    services/     # business logic
    ai/           # provider interface, prompts, caching, usage metering
    utils/        # errors, hashing, jwt, pagination
    app.ts        # express app assembly
    server.ts     # http listener + graceful shutdown
  prisma/
    schema.prisma
  Dockerfile
  docker-compose.yml   # local postgres + redis
```

## Local Development

```bash
cd backend
cp .env.example .env
# Fill in any secrets as features are added.

# Start infra
docker compose up -d

# Install + generate + migrate
npm install
npm run prisma:generate
npm run prisma:migrate

# Run dev server
npm run dev
```

Verify the scaffold:

```bash
curl -s http://localhost:4000/health
# { "ok": true, "service": "nutriai-backend", "env": "development" }
```

## Scripts

| Script                    | Purpose                               |
| ------------------------- | ------------------------------------- |
| `npm run dev`             | Watch-mode dev server via `tsx`       |
| `npm run build`           | TypeScript build to `dist/`           |
| `npm start`               | Run compiled server                   |
| `npm run lint`            | ESLint over `src/`                    |
| `npm test`                | Vitest suite                          |
| `npm run prisma:migrate`  | Apply/create Prisma migrations (dev)  |
| `npm run prisma:deploy`   | Apply Prisma migrations (prod)        |
| `npm run prisma:studio`   | Prisma Studio GUI                     |

## Environment Variables

See [`.env.example`](./.env.example). Values not yet required are left blank and
populated in their respective feature PRs (Auth, S3, AI, etc).

## Endpoints

| Method | Path                   | Description                                         | Auth    |
| ------ | ---------------------- | --------------------------------------------------- | ------- |
| GET    | /health                | Liveness probe                                      | No      |
| GET    | /auth/google           | Start Google OAuth flow (browser)                   | No      |
| GET    | /auth/google/callback  | OAuth callback; redirects to frontend with token    | No      |
| POST   | /auth/refresh          | Rotate refresh token, return new access token       | Cookie  |
| POST   | /auth/logout           | Revoke active refresh token                         | No      |
| GET    | /auth/me               | Return the authenticated user                       | Bearer  |
| POST   | /auth/dev-login        | Dev-only: upsert user by email and issue tokens     | No      |
| POST   | /analyze-food          | Analyze calories + macros from text or image        | Bearer  |
| GET    | /history               | List past food queries with filters + pagination    | Bearer  |
| POST   | /meals                 | Log a meal (items or snapshot from a FoodQuery)     | Bearer  |
| GET    | /meals?date=YYYY-MM-DD | List meals logged on a UTC date                     | Bearer  |
| GET    | /meals/daily-summary   | Aggregated totals by meal type for a UTC date       | Bearer  |
| DELETE | /meals/:id             | Delete one of the caller's meals                    | Bearer  |
| POST   | /chat                  | Send a message; continues or starts a conversation  | Bearer  |
| GET    | /chat/conversations    | List the caller's conversations                     | Bearer  |
| GET    | /chat/conversations/:id| Get one conversation with its full message history  | Bearer  |
| DELETE | /chat/conversations/:id| Delete a conversation and its messages              | Bearer  |

Feature endpoints are added PR-by-PR.

### History filters

`GET /history` accepts these query params (all optional):

| Param        | Type     | Notes                                 |
| ------------ | -------- | ------------------------------------- |
| from         | ISO date | Inclusive lower bound on createdAt    |
| to           | ISO date | Inclusive upper bound on createdAt    |
| minCalories  | number   | Inclusive lower bound on totalCalories|
| maxCalories  | number   | Inclusive upper bound on totalCalories|
| page         | integer  | Default 1                             |
| pageSize     | integer  | Default 20, max 100                   |

### Chat assistant

`POST /chat` accepts `{ message, conversationId?, title? }`. If
`conversationId` is omitted, a new conversation is created and its title is
derived from the first message. The server includes up to
`AI_CHAT_HISTORY_WINDOW` prior turns in the prompt so replies remain
context-aware. Both the user message and the assistant reply are persisted;
`updatedAt` is bumped so the most recently used conversation floats to the
top of `GET /chat/conversations`.

### AI policy (applied to every AI-backed endpoint)

- **Input hashing**: SHA-256 of canonicalized input is used as a cache key so
  equivalent queries deduplicate even when whitespace or key order differ.
- **Redis cache**: results are cached under `ai:{provider}:{model}:{hash}` with
  a 24h TTL by default (`AI_CACHE_TTL_SECONDS`).
- **Token usage logging**: every provider call inserts a row into `TokenUsage`
  and emits a pino log line tagged `ai_usage` with prompt/completion/total
  tokens, computed cost, cache hit flag, and latency.
- **Provider swap**: set `AI_PROVIDER=stub` to use a deterministic offline
  provider for dev/tests — same contract, zero network calls, zero cost.

### Auth quick-test (without setting up Google OAuth)

```bash
# 1. Upsert a user and get tokens
curl -s -X POST http://localhost:4000/auth/dev-login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@nutriai.test"}'

# 2. Call a protected route
ACCESS=...
curl -s http://localhost:4000/auth/me -H "Authorization: Bearer $ACCESS"
```
