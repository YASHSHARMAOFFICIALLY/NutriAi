# Landing Page — Unify + Polish

**Date:** 2026-07-14
**Branch:** hero-warm-editorial
**Scope:** Marketing surface color unification + craft polish. Files: `app/(marketing)/_components/LandingPage.tsx`, `PublicMealEstimator.tsx`, `SeoArticlePage.tsx`, `app/globals.css`. No backend, no copy rewrites, no layout restructure, no new dependencies.

## Problem

The hero was re-skinned to warm editorial (paper `#f6f1e7`, forest `#173c2b`, saffron `#b5651d`). Everything below still runs the old palette — acid-lime `#d7ff68` on near-black `#101510` — creating a visible identity seam. Separately, craft details are inconsistent: three button radii (`rounded-md` / `rounded-lg` / `rounded-xl`) with no system, no focus-visible rings anywhere, ad-hoc border values (`black/8`, `black/10`, `white/10`), and mixed hover treatments.

## Decisions (locked with user)

- **Direction:** Unify the whole marketing surface to warm editorial **and** do the craft pass in one effort.
- **Dark sections:** Deep forest + saffron. Near-black `#101510` → `#10241a`; lime `#d7ff68` → saffron `#b5651d`; white text kept.
- **Lime retired** as an accent across the marketing surface (token stays defined to avoid breakage; unused on these pages).

## Design

### 1. Tokens (`globals.css`)

Add:
- `--forest-black: #10241a;` — warm-dark surface, replaces cold `#101510`.
- `--saffron-strong: #a5571a;` — saffron hover/active.

Matching `@theme inline` entries (`--color-forest-black`, `--color-saffron-strong`) so utility classes resolve. `--lime` / `--color-lime` stay defined but unused on marketing pages.

### 2. Palette unify

Mechanical per-section swap. `#101510` → `#10241a`; `#d7ff68` → `#b5651d` (or `--saffron`). Where saffron text sits on the forest-black surface, verify contrast ≥ 4.5:1; if a label fails, use paper `#f6f1e7` for body text and reserve saffron for kickers/large text only.

| Section (file) | Now | After |
|---|---|---|
| ProductMoments tiles (Landing) | `#101510` bg, lime icon/bar/ring | `#10241a`, saffron |
| ImmersiveProduct (Landing) | `#101510` section, lime text, lime reco card | `#10241a`, saffron text, saffron reco card |
| Pricing featured tile (Landing) | `#101510` + lime | `#10241a` + saffron |
| Pricing "promise" card (Landing) | lime `#d7ff68` bg | saffron `#b5651d` bg, paper text |
| ProofStrip / SeoHub / FAQ hovers (Landing) | `group-hover bg-#d7ff68` | saffron |
| Footer / `Final` (Landing) | full lime `#d7ff68` bg | deep forest `#10241a`, paper text, saffron CTA + rings |
| `PublicMealEstimator` | `#101510` section, lime badge | `#10241a`, saffron badge |
| `SeoArticlePage` | `#101510` hero/CTA, lime accents, lime CTA block | `#10241a`, saffron accents, saffron→forest CTA block |

### 3. Craft polish (all sections)

- **Radius system:** primary CTAs `rounded-xl`; small + nav buttons `rounded-lg` (Nav CTA is `rounded-md` today — fix); chips/pills `rounded-full`; cards `rounded-xl`. Apply consistently.
- **Focus rings (a11y, required):** every button and link CTA gets `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]` (offset color = the section's surface). None exist today.
- **Borders:** replace ad-hoc `black/8` `black/10` `white/10` with consistent values (`--border` where a token maps cleanly; keep `white/*` variants on dark surfaces but standardize to one alpha).
- **Hover:** one card-hover treatment across sections — `-translate-y-0.5` + shadow step, 200ms. Buttons keep existing lift.
- **Motion:** `Reveal` respects `prefers-reduced-motion` — when reduced, render at final state (no y-translate, no opacity fade). Existing choreography otherwise unchanged; no new animation added.

## Out of scope (ponytail)

Copy rewrites, layout/section restructure, new sections, backend, pricing logic, SEO content, new dependencies, app (non-marketing) routes, font work (already done).

## Success criteria

- No `#d7ff68` or `#101510` literal left on the three marketing files.
- One radius system applied; Nav CTA no longer `rounded-md`.
- Every CTA button/link has a visible focus-visible ring.
- Saffron-on-forest-black text passes 4.5:1 (or demoted to paper body text).
- `prefers-reduced-motion` renders content at final state, no motion.
- `npm run build` passes; no console errors; no visible color seam hero → footer.
