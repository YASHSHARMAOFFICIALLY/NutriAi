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

# Install
npm install

# Run dev server (no DB models required yet — scaffold only)
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

| Method | Path     | Description        | Auth |
| ------ | -------- | ------------------ | ---- |
| GET    | /health  | Liveness probe     | No   |

Feature endpoints are added PR-by-PR.
