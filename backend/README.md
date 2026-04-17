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
| POST   | /uploads/presign       | Get a presigned S3 PUT URL for an image             | Bearer  |
| POST   | /uploads/confirm       | Confirm the upload and mark the asset UPLOADED      | Bearer  |
| GET    | /profile               | Get the caller's profile and derived targets        | Bearer  |
| PUT    | /profile               | Create or update the caller's profile (PATCH-like)  | Bearer  |
| DELETE | /profile               | Delete the caller's profile                         | Bearer  |
| GET    | /analytics/daily       | Per-day calorie + macro series (default last 7d)    | Bearer  |
| GET    | /analytics/macros      | Macro totals, energy share, target adherence        | Bearer  |
| GET    | /analytics/streak      | Logging streak + calorie-target streak              | Bearer  |
| GET    | /recommendations/meals | Ranked meal suggestions from history                | Bearer  |
| POST   | /api-keys              | Issue a new API key (token returned once)           | Bearer  |
| GET    | /api-keys              | List the caller's API keys (hashes not returned)    | Bearer  |
| DELETE | /api-keys/:id          | Revoke an API key                                   | Bearer  |
| POST   | /v1/public/calories    | Analyze calories from text or imageUrl              | ApiKey  |

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

### Recommendations

`GET /recommendations/meals?mealType=&limit=&remainingCalories=&remainingProtein=&remainingCarbs=&remainingFat=`

The engine pulls meals the user has logged in the last 45 days, groups them
by a normalized item-name signature (order-insensitive; ignores parenthetical
quantities and unit tokens), filters out any bucket that matches an entry in
`UserProfile.allergies`, and ranks the remaining candidates with a weighted
score:

| Component        | Weight | What it rewards                                   |
| ---------------- | ------ | ------------------------------------------------- |
| calorie fit      | 0.40   | Total kcal that fits inside the remaining budget  |
| protein fit      | 0.25   | Closes the remaining protein gap                  |
| frequency        | 0.20   | `sqrt(freq)/4` — flattened so favorites don't win outright |
| recency          | 0.15   | Ramps toward 1.0 as days-since-last approaches 7  |

"Remaining budget" defaults to `profile.effective*Target* − today's totals`.
Clients can override via `remaining*` query params (useful for previewing a
meal that hasn't been logged yet). Returns `remaining` alongside the
`recommendations` list so UIs can render both consistently.

### Analytics

`GET /analytics/daily?from&to` buckets meals by UTC day, fills missing days
with zeros, and attaches `calorieTargetPct` when a profile target is set.

`GET /analytics/macros?from&to` returns aggregated totals, the macro
energy share (4/4/9 kcal per gram → % protein/carbs/fat), and per-day
average adherence vs. profile targets.

`GET /analytics/streak` returns:
- `loggingStreak` — consecutive days with at least one meal ending today
  (or yesterday if today has no log yet, so the streak doesn't break
  until a full day is missed).
- `calorieTargetStreak` — same window, but each day must fall within
  80%–120% of the effective calorie target. `null` if no target is set.

Ranges accept `from` / `to` as ISO dates; default is the last 7 UTC days.

### Personalization

`PUT /profile` is a PATCH-like upsert — only fields you include are written,
so partial onboarding flows work naturally. When the caller supplies
`sex`, `birthYear`, `heightCm`, `weightKg`, `activityLevel`, and `goal`,
the server computes:

- `bmr` via Mifflin-St Jeor
- `tdee = bmr * activityMultiplier`
- `dailyCalorieTarget = tdee + goalDelta` (`LOSE=-500`, `MAINTAIN=0`,
  `GAIN=+300`), floored at 1200 kcal
- Macro split: 30% protein / 40% carbs / 30% fat (4/4/9 kcal per gram)

These land under `derived` in the response. If you set
`dailyCalorieTarget`, `proteinTargetG`, `carbsTargetG`, or `fatTargetG`
explicitly, your manual overrides win and are surfaced as
`effectiveCalorieTarget`, `effective*TargetG`. This profile is what the
upcoming recommendation engine reads from.

### Image upload flow

Clients never stream bytes through the API. Instead:

1. `POST /uploads/presign` with `{ contentType, size? }` returns an
   `assetId` plus a short-lived `uploadUrl` (S3 PUT) and the required
   headers (`Content-Type`).
2. Client uploads the file directly to S3 with an HTTP `PUT` to
   `uploadUrl`.
3. `POST /uploads/confirm` with `{ assetId }` verifies the object exists
   via `HeadObject`, records its size, and flips the asset to
   `UPLOADED`.
4. `POST /analyze-food` accepts `{ assetId }` — the server resolves it
   to a short-lived signed GET URL and passes that to the vision model.
   The query row is persisted with `assetId` so the original image is
   discoverable in history.

Only `image/jpeg`, `image/png`, `image/webp`, `image/heic`, and
`image/heif` are allowed; `UPLOAD_MAX_SIZE_BYTES` caps the size a caller
may declare. Use `AWS_S3_ENDPOINT` + `AWS_S3_FORCE_PATH_STYLE=true` to
point at LocalStack or MinIO during local dev.

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

### Public B2B API

The public API is a thin, stateless surface meant for third-party integrations.
Callers authenticate with an API key issued under their NutriAI account.

Issue a key from the authenticated management endpoints:

| Method | Path             | Description                               |
| ------ | ---------------- | ----------------------------------------- |
| POST   | /api-keys        | Create a key; the token is returned once  |
| GET    | /api-keys        | List the caller's keys (no secrets)       |
| DELETE | /api-keys/:id    | Revoke a key (idempotent)                 |

Token format: `nk_<prefix>.<secret>` — the prefix is stored alongside a
SHA-256 of the full token so the secret half is never persisted. Tokens are
shown exactly once at creation.

Send the token to the public surface via either:

- `x-api-key: nk_<prefix>.<secret>`, or
- `Authorization: Bearer nk_<prefix>.<secret>`

Scopes (optional) are exact-match. An empty `scopes` array grants all
public endpoints; otherwise each route declares its required scope (e.g.
`calories:read` on `POST /v1/public/calories`).

Per-key rate limit defaults to 60 req/min and is enforced by a Redis
bucket keyed on the key's id. Every successful or failing request is
metered into `ApiUsage { apiKeyId, endpoint, statusCode, latencyMs,
createdAt }` via a response-finish hook so billing and diagnostics can
be derived directly from the table.

```bash
# 1. Issue a key (requires a user access token)
curl -s -X POST http://localhost:4000/api-keys \
  -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' \
  -d '{"name":"partner","scopes":["calories:read"]}'
# => { id, name, prefix, scopes, rateLimitPerMin, createdAt, token }

# 2. Call the public endpoint with that token
curl -s -X POST http://localhost:4000/v1/public/calories \
  -H "x-api-key: $API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"text":"2 boiled eggs and a slice of toast"}'
```

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
