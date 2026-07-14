# Hero Re-skin — Warm Editorial

**Date:** 2026-06-26
**Scope:** Landing page hero only (`app/(marketing)/_components/LandingPage.tsx` Hero + HeroVisual, `Nav`, `globals.css`, `layout.tsx`). No sections below the fold, no backend.

## Problem

The hero hits ~6 of the exact defaults that read as "AI-generated 2025 SaaS hero." The code is competent; the *taste signals* are generic:

1. **Geist font** — the Vercel/Next default; loudest "scaffolded" tell.
2. **Acid-lime `#d7ff68` on near-black `#101510`** — the most over-used AI SaaS palette of the era.
3. **Vague headline** — "myNutriAI helps you understand every meal." No specificity, no edge.
4. **Fake-stat chips** — feature labels (`Telegram / ready`) costumed as a metrics row.
5. **Effect overload** — mouse-spotlight + scan-line + cta-pulse + 4 radial glows + blur everywhere; no focal point.
6. **Angled floating glassy phone + 3 floating HUDs** — stock AI hero composition.

The page below the fold is already mostly light (`main` is `#f8f8f3`; `PublicMealEstimator` sits on it). The dark hero is the odd one out, so going warm-light *improves* flow.

## Decisions (locked with user)

- **Scope:** Re-skin identity + copy (boldest of three options).
- **Direction:** Warm editorial, light.
- **Display font:** Fraunces; **body font:** Hanken Grotesk (both via `next/font/google`).
- **Headline angle:** Indian-food specificity (the product's wedge), US support kept in subhead.

## Design

### Palette
Reuse existing tokens; stop the hero's lime-on-black reliance; add 2 warm values. Lime is **not** deleted globally (other sections still use it) — it just stops being the hero's identity.

| Role | Now | New |
|---|---|---|
| Hero background | `#101510` | warm paper `#f6f1e7` |
| Ink / headline | white | forest `#173c2b` (existing `--forest`) |
| Body text | `white/78` | `#5f675f` (existing `--muted`) |
| Primary accent | `#d7ff68` | forest-green buttons + saffron `#d98324` highlight |
| Page `--background` | `#f8f8f3` | nudge → `#f6f1e7` (warm) so hero→next section is seamless |

Add tokens to `globals.css`: `--paper: #f6f1e7;` and `--saffron: #d98324;` (plus matching `@theme inline` entries if used via utility classes).

### Typography
- Replace Geist in `layout.tsx` with **Hanken Grotesk** (`--font-sans`) + **Fraunces** (`--font-display`).
- H1 and kicker use Fraunces; body uses Hanken Grotesk.
- Update `body { font-family: var(--font-sans) ... }` (already references `--font-sans`, so swap is in `layout.tsx`).
- Add a `.display-heading { font-family: var(--font-display); }` rule (or apply the font var class directly).

### Copy
- **Kicker:** `AI MEAL TRACKER · INDIA + US`
- **H1 (Fraunces):** *Finally, a calorie tracker that understands a thali.* — "**thali**" rendered in saffron.
- **Sub:** *Snap dal-rice, a paneer bowl, or a hostel thali — get calories, protein, and macros in seconds. Indian & US meals, every estimate editable.*
- **CTAs:** primary forest-green `Scan your first meal free` (→ `#estimate`); secondary ghost `See how it works` (→ `#product`).
- **Proof line** (replaces the 4 fake-stat chips at `:257-269`): one honest row — `Free to try · Photo or text · Telegram-ready · You can edit every estimate`.
- **Keep** the food chips (`Hostel food · Homemade thalis · Street-food rolls`, `:271-278`) — concrete and on-brand.

### Composition
- **Left:** kicker → H1 → sub → CTAs → proof line → food chips.
- **Right:** ONE meal-analysis card (the existing Paneer-thali card from `FloatingPhone`) over a warm-treated `hero.webp` (drop the heavy `blur-[4px] brightness-[0.72] saturate-[0.52]`). Re-skinned for light bg.
- **Remove from hero:** `NutritionHUD` and `CoachBubble` (they reappear in sections below). One focal object, not four.

### Effects (6 → 2)
- **Keep:** staggered `hero-reveal` entrance; single `scan-line` on the meal card.
- **Cut:** mouse-follow spotlight (`spotlightRef` + `onMouseMove`), `cta-pulse` ring, the 4 stacked radial glows (`:222-233`), the `blur-[120px]` halos in `HeroVisual` (`:318`).
- Remove the now-unused keyframes/utilities from `globals.css` (`cta-pulse`, spotlight bits) only if nothing else references them — grep first.

### Nav
- Light-glass variant to match paper: swap `bg-[#101510]/78 text-white` for a light translucent paper/white glass with forest ink. A dark nav over warm paper would look bolted-on.
- Keep structure, links, logo, and CTA buttons; only recolor.

## Out of scope (ponytail)
- Every section below the hero, backend, pricing logic, SEO, the mobile meal card at `:280-301` beyond recolor-to-match.
- No new dependencies — Fraunces/Hanken load through the existing `next/font/google` path.

## Success criteria
- Geist no longer loaded; Fraunces + Hanken in use.
- Hero background is warm paper, not near-black; no acid-lime as the hero's primary accent.
- Headline is the specific thali line; no fake-stat chip row.
- Hero has exactly 2 motion effects; no mouse-spotlight, no cta-pulse, no 120px halos.
- Hero → `PublicMealEstimator` has no visible color seam.
- `prefers-reduced-motion` still honored; `npm run build` (or lint) passes; no console errors.
