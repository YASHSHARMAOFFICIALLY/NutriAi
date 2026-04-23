# NutriAI Frontend Engineering Guide

This README explains the frontend from first principles. It is written for a
developer who did not build the app and needs to understand what each part does,
why the stack was chosen, how the routes are organized, how the app talks to
the backend, and what should be improved before SaaS launch.

The frontend is a Next.js application. It is the user-facing product surface for
NutriAI: marketing, authentication, onboarding, dashboard, food snap, meals,
analytics, coach, recommendations, challenges, weight, settings, admin, and
Telegram connection management.

The backend remains the source of truth. The frontend should render state,
collect user input, call API clients in `lib/api`, and avoid duplicating backend
business rules.

## Product Role

The frontend helps users:

- Understand the product from the marketing landing page.
- Sign up, sign in, verify email, reset password, and handle OAuth callback.
- Complete onboarding and nutrition target setup.
- Analyze food from text or image.
- Log analyzed food as meals.
- See daily calorie and macro progress.
- Browse meal history.
- View analytics.
- Chat with the coach.
- Get meal recommendations.
- Track challenges.
- Track weight.
- Manage settings and connect Telegram.
- Use admin pages when their account has admin access.

The app is split into route groups:

```txt
app/(marketing)  public landing pages
app/(auth)       authentication pages
app/(setup)      onboarding flow
app/(app)        authenticated application
```

This is a good organization because each user state has a different layout and
navigation model.

## Tech Stack And Why It Was Chosen

### Next.js 16 App Router

Next.js gives:

- File-based routing.
- Route groups for marketing/auth/app/setup separation.
- Server/client component support.
- Production build pipeline.
- Easy deployment to Vercel or any Node-compatible host.

The App Router is a practical fit because NutriAI has several page families
with different layouts.

### React 19

React is used for interactive dashboards, forms, API-driven pages, chat, upload
flows, and settings controls.

### TypeScript

TypeScript helps keep API responses and UI state aligned. This matters because
the backend has many DTOs: profiles, meals, analytics, recommendations, API
keys, Telegram status, admin usage, and more.

### Tailwind CSS

The app uses utility classes from Tailwind. This keeps styling close to
components and makes it fast to build dashboards without creating many custom
CSS files.

### Framer Motion

Framer Motion powers page and section animations. It is mainly used to create a
polished SaaS feel in marketing pages and app transitions.

### Phosphor Icons

Phosphor provides consistent iconography for navigation, buttons, settings, and
dashboard elements.

### Lenis

Lenis is used in the marketing area for smoother landing page scrolling.

## High-Level Architecture

```txt
app/layout.tsx
  global app document and metadata

app/globals.css
  global tokens, base styles, Tailwind imports

app/(marketing)
  public landing route and marketing components

app/(auth)
  login/signup/reset/verify/callback routes

app/(setup)
  onboarding route

app/(app)
  authenticated product shell and product pages

lib/api
  typed backend API client layer
```

Important frontend rule:

```txt
Page/component -> lib/api client -> backend route -> backend service
```

Do not call backend URLs directly from random components when a typed API client
already exists. Put API logic in `lib/api`.

## Local Development

From repo root:

```bash
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

You also need the backend running, normally at:

```txt
http://localhost:4000
```

The API base URL is controlled by the auth/API helper in `lib/api/auth.ts`.

## Scripts

| Script | Role |
| --- | --- |
| `npm run dev` | Starts the Next development server. |
| `npm run build` | Creates an optimized production build and type-checks routes. |
| `npm start` | Runs the production Next server after build. |
| `npm run lint` | Runs ESLint. |

## Route Group Strategy

### `app/(marketing)`

Public pages for users who are not signed in yet. This area sells the product
and explains the value.

Files:

| File | Role |
| --- | --- |
| `layout.tsx` | Marketing-specific layout wrapper. |
| `page.tsx` | Landing page composition. |
| `_lib/lenis-provider.tsx` | Smooth scroll provider for marketing. |
| `_lib/motion.ts` | Shared motion variants/config for marketing animations. |

Marketing components:

| File | Role |
| --- | --- |
| `_components/Nav.tsx` | Top navigation for landing page. |
| `_components/Hero.tsx` | First viewport hero and primary product positioning. |
| `_components/LogoCloud.tsx` | Social proof/logo area. |
| `_components/FeatureBento.tsx` | Feature grid explaining product capabilities. |
| `_components/HowItWorks.tsx` | Step-by-step product flow. |
| `_components/AnalyticsShowcase.tsx` | Visual explanation of analytics. |
| `_components/ChatShowcase.tsx` | Visual explanation of coach/chat. |
| `_components/DeveloperAPI.tsx` | Public API positioning. |
| `_components/Pricing.tsx` | Pricing section. |
| `_components/FinalCTA.tsx` | Final conversion call-to-action. |
| `_components/Footer.tsx` | Footer links and brand close. |

Marketing primitives:

| File | Role |
| --- | --- |
| `_primitives/Button.tsx` | Reusable marketing button. |
| `_primitives/Container.tsx` | Width-constrained layout wrapper. |
| `_primitives/DisplayCards.tsx` | Reusable display card pattern. |
| `_primitives/GlassCard.tsx` | Marketing card surface. |
| `_primitives/MovingGrid.tsx` | Decorative/interactive grid primitive. |
| `_primitives/Reveal.tsx` | Scroll/animation reveal wrapper. |

### `app/(auth)`

Authentication pages. These routes usually do not show the main app sidebar.

| File | Role |
| --- | --- |
| `layout.tsx` | Shared auth layout. |
| `_components/AuthCard.tsx` | Reusable auth page card shell. |
| `login/page.tsx` | Login form, Google login entry, dev login path. |
| `signup/page.tsx` | Email signup form. |
| `callback/page.tsx` | OAuth callback handling and token capture. |
| `forgot-password/page.tsx` | Password reset request. |
| `reset-password/page.tsx` | Password reset completion. |
| `verify-email/page.tsx` | Email verification token handling. |
| `verify-pending/page.tsx` | Tells user to check email. |

Auth pages should remain thin. They call `lib/api/account.ts`,
`lib/api/emailAuth.ts`, or helpers from `lib/api/auth.ts`.

### `app/(setup)`

Onboarding flow for profile and target setup.

| File | Role |
| --- | --- |
| `layout.tsx` | Setup-specific layout. |
| `onboarding/page.tsx` | Multi-step onboarding flow. |
| `onboarding/_components/StepGoal.tsx` | Goal selection step. |
| `onboarding/_components/StepActivity.tsx` | Activity and body inputs. |
| `onboarding/_components/StepTargets.tsx` | Calorie/macro targets. |

Onboarding writes profile data through `lib/api/profile.ts`. The backend owns
derived target calculations, so the frontend should not be the source of truth
for BMR/TDEE logic.

### `app/(app)`

Authenticated product experience.

| File | Role |
| --- | --- |
| `layout.tsx` | App shell layout with sidebar. |
| `_components/AppSidebar.tsx` | Navigation, user loading, active route state. |
| `_components/AppState.tsx` | Shared loading/error/privacy notice UI. |

The app shell is where authenticated navigation belongs. Feature pages should
not each create their own full-page navigation.

## Product Pages

### Dashboard

Files:

| File | Role |
| --- | --- |
| `dashboard/page.tsx` | Main dashboard composition. |
| `dashboard/_components/TodayCard.tsx` | Daily calorie/macro summary. |
| `dashboard/_components/TodayMeals.tsx` | Meals logged today. |
| `dashboard/_components/CoachCard.tsx` | Coach preview/entry point. |
| `dashboard/_components/StreakCard.tsx` | Streak and consistency summary. |

Purpose:

- Give the user a fast view of today's progress.
- Surface next actions.
- Link to deeper flows such as Snap, Meals, Analytics, and Coach.

### Snap

Files:

| File | Role |
| --- | --- |
| `snap/page.tsx` | Food analysis workflow page. |
| `snap/_components/InputPanel.tsx` | Text/image input controls. |
| `snap/_components/AnalyzingState.tsx` | Loading state while analysis runs. |
| `snap/_components/ResultCard.tsx` | Food result, macros, and log actions. |

Purpose:

- Let user analyze food from the website.
- Call `analyzeFood`.
- Let user log the analysis as a meal.

Telegram now offers a lower-friction version of the same workflow, but Snap is
still important for website users and richer visual confirmation.

### Meals

Files:

| File | Role |
| --- | --- |
| `meals/page.tsx` | Meal history/listing page. |
| `meals/_components/DayGroup.tsx` | Groups meals by date. |
| `meals/_components/MealCard.tsx` | Displays one logged meal. |

Purpose:

- Show what the user logged.
- Support inspection and deletion.

### Analytics

Files:

| File | Role |
| --- | --- |
| `analytics/page.tsx` | Analytics dashboard composition. |
| `analytics/_components/WeeklyChart.tsx` | Daily trend chart. |
| `analytics/_components/MacroRing.tsx` | Macro split visualization. |
| `analytics/_components/LogHeatmap.tsx` | Logging consistency visualization. |

Purpose:

- Help users understand trends beyond today's totals.
- Read from backend analytics endpoints.

### Coach

Files:

| File | Role |
| --- | --- |
| `coach/page.tsx` | Chat/coach page. |
| `coach/_components/ChatMessage.tsx` | One chat message row. |
| `coach/_components/NutritionContext.tsx` | Context panel for nutrition state. |

Purpose:

- Give users conversational help.
- Keep messages persisted through backend conversations.

### Recommendations

Files:

| File | Role |
| --- | --- |
| `recommendations/page.tsx` | Meal recommendation page. |
| `recommendations/_components/RecommendationCard.tsx` | One suggestion card. |

Purpose:

- Display backend-ranked meal suggestions.
- Use profile, allergies, meal history, and remaining targets.

### Challenges

| File | Role |
| --- | --- |
| `challenges/page.tsx` | Challenge discovery and progress page. |

Purpose:

- Encourage retention through structured nutrition habits.

### Weight

| File | Role |
| --- | --- |
| `weight/page.tsx` | Weight tracking UI. |

Purpose:

- Show and manage weight entries.
- Support goal tracking.

### Settings

Files:

| File | Role |
| --- | --- |
| `settings/page.tsx` | Profile preferences, notifications, privacy, Telegram, account actions. |
| `settings/_components/SettingsSection.tsx` | Reusable settings section and row components. |
| `settings/_components/Toggle.tsx` | Reusable toggle control. |

Settings currently includes:

- Notification preferences.
- Privacy explanations.
- Telegram connect/unlink.
- Sign out.
- Account deletion placeholder.

The Telegram connection UI calls:

- `GET /telegram/status`
- `POST /telegram/link-token`
- `DELETE /telegram/unlink`

### Admin

| File | Role |
| --- | --- |
| `admin/page.tsx` | Admin overview/users/usage/activity surface. |

Purpose:

- Internal SaaS visibility.
- Should only be useful to accounts with backend admin role.

## API Client Layer

All backend calls should go through `frontend/lib/api`.

| File | Role |
| --- | --- |
| `auth.ts` | Stores/reads access token, API URL helper. |
| `client.ts` | Shared `apiFetch`, refresh-on-401 behavior, `ApiError`, `UnauthorizedError`. |
| `account.ts` | Current user, logout, dev login. |
| `emailAuth.ts` | Signup, login, verification, password reset. |
| `profile.ts` | Get/update/delete profile. |
| `food.ts` | Analyze food. |
| `uploads.ts` | Not present in this frontend folder; upload behavior may be embedded or pending. If added, keep presign/confirm here. |
| `meals.ts` | Create/list/delete meals and daily summary. |
| `history.ts` | Not present in this frontend folder; add if the UI needs food query history. |
| `analytics.ts` | Daily, macro, streak analytics. |
| `chat.ts` | Chat and conversation calls. |
| `recommendations.ts` | Meal recommendations. |
| `challenges.ts` | Challenge APIs. |
| `weight.ts` | Weight entry APIs. |
| `apiKeys.ts` | Not present in this frontend folder; add if user-facing API key management returns. |
| `admin.ts` | Admin APIs. |
| `telegram.ts` | Telegram status/link/unlink calls. |
| `types.ts` | Shared TypeScript DTOs for backend responses and inputs. |
| `index.ts` | Barrel exports for API namespaces. |

Note: Some API files exist in `frontend2` but not in this `frontend` folder.
This project currently has both `frontend` and `frontend2`. The `frontend`
folder is the one documented here because it has the richer current UI and the
Telegram settings integration.

## Auth And Token Flow

The client uses `apiFetch` in `lib/api/client.ts`.

Behavior:

1. Read access token from `lib/api/auth.ts`.
2. Add `Authorization: Bearer <token>` if present.
3. Send request with `credentials: "include"` so refresh cookies can travel.
4. If backend returns `401`, try `POST /auth/refresh`.
5. If refresh succeeds, retry the original request once.
6. If refresh fails, clear token and redirect to `/login` unless `silent` is
   set.

This keeps route components simpler and centralizes auth retry behavior.

## Styling System

Global styles live in:

```txt
app/globals.css
```

Components use Tailwind utility classes directly. The app appears to use a
custom palette with names such as `ink`, `cream`, `forest`, and `sage`.

When adding UI:

- Prefer existing visual language and spacing.
- Reuse app shell components.
- Keep form controls accessible.
- Avoid fake actions that imply backend support when the backend does not have
  the workflow yet.
- Keep SaaS dashboard pages dense enough to be useful, but not visually noisy.

## Data Flow Examples

### Food Snap Flow

```txt
snap/page.tsx
  -> InputPanel collects text/image
  -> lib/api/food.ts calls POST /analyze-food
  -> ResultCard shows items/totals
  -> lib/api/meals.ts logs meal with foodQueryId
  -> dashboard/meals/analytics update from backend data
```

### Settings Telegram Flow

```txt
settings/page.tsx
  -> getTelegramStatus()
  -> user clicks Connect
  -> createTelegramLink()
  -> opens https://t.me/<bot>?start=<token>
  -> backend webhook links Telegram account
  -> status later shows connected account
```

### Auth Flow

```txt
login/signup/callback page
  -> lib/api account/email auth helpers
  -> backend issues access token and refresh cookie
  -> apiFetch stores access token in memory
  -> authenticated pages call backend with bearer token
```

## Frontend File Guide

### App Root

| File | Role |
| --- | --- |
| `app/layout.tsx` | Root layout and global document wrapper. |
| `app/globals.css` | Global styles, design tokens, Tailwind setup. |
| `app/favicon.ico` | Browser favicon. |

### Marketing Files

See the marketing section above. Marketing code is intentionally separate from
authenticated product UI so landing page animation/visual needs do not leak into
dashboard components.

### Auth Files

Auth pages share `AuthCard` and the auth layout. Keep validation, API calls, and
redirect handling local to these pages unless reused.

### Setup Files

The setup route is a structured onboarding path. It should stay connected to the
backend profile model and should not invent separate client-only profile fields.

### App Files

App pages are the actual SaaS product. They should:

- Fetch via `lib/api`.
- Show real loading and error states.
- Avoid silently falling back to fake data in production paths.
- Keep user-owned data guarded by backend auth.

### API Files

The API folder is the frontend contract with the backend. When backend endpoints
change, update:

1. `types.ts`
2. the specific API helper file
3. the page/component using it

Do not scatter raw `fetch` calls throughout pages.

## What Was Likely Built First

Based on route and feature structure, the frontend likely evolved in this
order:

1. Default Next app scaffold.
2. Marketing landing page and primitives.
3. Auth screens.
4. App shell and sidebar.
5. Dashboard.
6. Food Snap flow.
7. Meal history.
8. Profile/onboarding/settings.
9. Analytics.
10. Coach/chat.
11. Recommendations.
12. Challenges.
13. Weight tracking.
14. Admin.
15. Telegram settings integration.

This roughly mirrors backend feature growth: auth, food analysis, meals,
uploads, personalization, analytics, public/admin features, then Telegram.

## Frontend Improvement Areas

These are high-value improvements before SaaS launch:

1. Confirm whether `frontend` or `frontend2` is the production app. Remove or
   archive the unused one to avoid duplicate work.
2. Add automated UI tests for auth, Snap, meal logging, settings, and Telegram
   connect flows.
3. Add stronger form validation on every write form, preferably using schemas
   shared with or generated from backend contracts.
4. Add a proper API error display pattern for all app pages.
5. Add route guards so authenticated app pages redirect cleanly when no user is
   logged in.
6. Replace any hardcoded demo user/profile text in settings with real backend
   values.
7. Add upload API helpers in `lib/api/uploads.ts` if image upload logic is still
   embedded in components.
8. Add food history API helpers if history is exposed in the UI.
9. Add optimistic UI carefully for meal logging and deletion.
10. Add skeleton states for dashboard, meals, analytics, and coach.
11. Improve accessibility: labels, focus states, keyboard flow, color contrast,
    and reduced motion support.
12. Add telemetry for important funnels: signup, onboarding completion, first
    food analysis, first logged meal, Telegram connect.
13. Add environment documentation for `NEXT_PUBLIC_API_URL` or whichever API
    URL variable `lib/api/auth.ts` expects.
14. Create a shared design component layer for common buttons, inputs, cards,
    dialogs, empty states, and notices.
15. Add production-safe feature flags for incomplete flows like account deletion
    and data export.

## How To Add A New Frontend Feature

Use this order:

1. Confirm the backend endpoint and DTO shape.
2. Add or update types in `lib/api/types.ts`.
3. Add an API helper in the correct `lib/api/*.ts` file.
4. Build the page or component under the correct route group.
5. Add loading, empty, error, and success states.
6. Use existing design patterns and app shell components.
7. Run `npm run lint`.
8. Run `npm run build`.
9. Update this README if the feature changes structure or workflow.

## Production Checklist

Before frontend deployment:

- Run `npm run lint`.
- Run `npm run build`.
- Confirm backend API URL points to production.
- Confirm CORS allows the frontend domain.
- Confirm auth refresh cookies work across domains.
- Confirm all authenticated pages handle expired sessions.
- Confirm no fake demo data is shown where live user data should appear.
- Confirm Telegram connect opens the correct bot username.
- Confirm mobile layouts for dashboard, Snap, meals, settings, and onboarding.
- Confirm image upload flow works against production S3.
- Confirm analytics pages handle empty/new-user state.

## Current Verification Status

At the time this guide was written, the frontend previously passed:

```bash
npm run lint
npm run build
```

Run those again before shipping any new frontend changes.
