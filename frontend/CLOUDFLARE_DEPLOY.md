# Cloudflare Frontend Deployment

This frontend is configured for Cloudflare Workers with the OpenNext adapter.

## Required Cloudflare Environment Variable

Set this in Cloudflare for the frontend build:

```bash
NEXT_PUBLIC_API_URL=https://nutriai-backend-a696.onrender.com
```

Use the actual Render backend URL. This value is public and is compiled into the browser bundle.

## Required Render Backend Variables

Update the backend service on Render after you know the Cloudflare frontend URL:

```bash
CORS_ORIGIN=https://nutriai-frontend.your-worker-subdomain.workers.dev,https://your-custom-domain.com
FRONTEND_URL=https://your-custom-domain.com
FRONTEND_POST_LOGIN_URL=https://your-custom-domain.com/auth/callback
```

If Google OAuth is enabled, also update the Google OAuth authorized redirect URI to:

```bash
https://nutriai-backend-a696.onrender.com/auth/google/callback
```

## Local Cloudflare Build Check

```bash
npx opennextjs-cloudflare build
npx wrangler deploy --dry-run
```

## Deploy

Before deploying from a local terminal, authenticate Wrangler:

```bash
npx wrangler login
```

For CI or non-interactive deploys, set `CLOUDFLARE_API_TOKEN` with a token that can edit Workers scripts.

```bash
NEXT_PUBLIC_API_URL=https://nutriai-backend-a696.onrender.com npm run deploy
```

## Cloudflare Dashboard Setup

Use a Workers deployment connected to this repository:

- Root directory: `frontend`
- Install command: `npm install`
- Build/deploy command: `npm run deploy`
- Node version: `22`
- Build variables and secrets:
  - `NEXT_PUBLIC_API_URL=https://nutriai-backend-a696.onrender.com`

The generated worker uses `wrangler.jsonc` and bundles static assets from `.open-next/assets`.
