# Hero Warm-Editorial Re-skin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. When writing any JSX/CSS, the frontend-design-guidelines + design-taste skills are already reflected in the code below — match it, don't regenerate.

**Goal:** Re-skin the landing-page hero from the roasted "dark + acid-lime + Geist" AI-default look to a warm editorial direction (paper bg, forest ink, single saffron accent, Fraunces display font, specific copy, 2 effects instead of 6).

**Architecture:** Pure frontend, no new dependencies. Swap fonts via the existing `next/font/google` path, add two CSS tokens, rewrite `Hero` + `HeroVisual` + `FloatingPhone` + `Nav` in one file, delete two now-unused hero sub-components, prune dead CSS. Everything below the hero is untouched.

**Tech Stack:** Next 16 (App Router) · React 19 · Tailwind v4 (inline-hex utility style, matches existing file) · framer-motion (unused by hero) · `@phosphor-icons/react`.

## Global Constraints

- Single file for the hero markup: `frontend/app/(marketing)/_components/LandingPage.tsx`. Match its existing style: inline-hex Tailwind utilities (`bg-[#173c2b]`), phosphor icons, no shadcn.
- Palette: background `#f6f1e7` (paper) · ink `#173c2b` (forest) · body `#4a534a` · muted `#5f675f` · accent `#b5651d` (saffron, AA-safe ≥3:1 as large text on paper — do NOT use lighter `#d98324` for text). Acid-lime `#d7ff68` must not appear in the hero or nav.
- Verified contrast: forest `#173c2b` on paper = ~13:1; body `#4a534a` on paper = ~7:1; saffron `#b5651d` on paper = ~3.85:1 (large text only — only the H1 word "thali" and decorative accents).
- No `transition-all` / `transition: all` — use explicit `transition-[...]` / `transition-colors`.
- Shadows stay soft: max ~`rgba(23,60,43,0.22)`. No `rgba(0,0,0,0.78)` mega-shadows.
- `prefers-reduced-motion` is already honored globally in `globals.css` — keep it that way; add no always-on motion.
- Verify commands run from `frontend/`: `npm run lint` (eslint) and `npm run build` (next build --webpack). Visual check: `npm run dev`.
- Commit after each task. Branch is already `hero-warm-editorial`.

---

### Task 1: Swap fonts (Geist → Hanken Grotesk + Fraunces)

**Files:**
- Modify: `frontend/app/layout.tsx:3,21-29,105`
- Modify: `frontend/app/globals.css:299-302` (`.display-heading`)

**Interfaces:**
- Produces: CSS vars `--font-sans` (Hanken Grotesk) and `--font-display` (Fraunces) on `<html>`. `body` already consumes `var(--font-sans)` (globals.css:79). The hero H1 consumes `--font-display` via `.display-heading`.

- [ ] **Step 1: Replace the font imports/instances in `layout.tsx`**

Replace line 3:
```tsx
import { Geist, Geist_Mono } from "next/font/google";
```
with:
```tsx
import { Hanken_Grotesk, Fraunces } from "next/font/google";
```

Replace lines 21-29:
```tsx
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
```
with:
```tsx
const hankenSans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
```

- [ ] **Step 2: Update the `<html>` className (layout.tsx:105)**

Replace:
```tsx
className={`${geistSans.variable} ${geistMono.variable}`}
```
with:
```tsx
className={`${hankenSans.variable} ${fraunces.variable}`}
```

- [ ] **Step 3: Confirm `--font-mono` was not used elsewhere**

Run: `grep -rn "font-mono" frontend/app`
Expected: no results (Geist_Mono was unused). If there ARE results, instead keep a mono by adding `import { JetBrains_Mono } from "next/font/google"` and a `--font-mono` instance — do not leave a dangling var. (Default branch: no results, nothing to do.)

- [ ] **Step 4: Point `.display-heading` at the display font (globals.css:299-302)**

Replace:
```css
.display-heading {
  letter-spacing: 0;
  text-wrap: balance;
}
```
with:
```css
.display-heading {
  font-family: var(--font-display), Georgia, "Times New Roman", serif;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
```

- [ ] **Step 5: Verify build + no Geist remains**

Run: `cd frontend && grep -rn "Geist" app && echo "FOUND GEIST" || echo "no geist"`
Expected: `no geist`
Run: `cd frontend && npm run build`
Expected: build succeeds (Next downloads Hanken Grotesk + Fraunces from Google Fonts at build time).

- [ ] **Step 6: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/globals.css
git commit -m "feat(hero): swap Geist for Hanken Grotesk + Fraunces display font"
```

---

### Task 2: Add warm palette tokens + warm the page background

**Files:**
- Modify: `frontend/app/globals.css:4,33` (`:root`) and `:35-52` (`@theme inline`)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:118` (`<main>` bg)

**Interfaces:**
- Produces: tokens `--paper: #f6f1e7`, `--saffron: #b5651d`, plus `--color-paper` / `--color-saffron` so `bg-paper` / `text-saffron` utilities exist. `--background` warmed to `#f6f1e7`.

- [ ] **Step 1: Add tokens to `:root` (globals.css)**

Change line 4 from:
```css
  --background: #fafaf7;
```
to:
```css
  --background: #f6f1e7;
```
Add inside the Brand Palette block (after line 12 `--lime: #d7ff68;`):
```css
  --paper: #f6f1e7;
  --saffron: #b5651d;
```

- [ ] **Step 2: Expose them in `@theme inline` (after globals.css:42 `--color-lime`)**

Add:
```css
  --color-paper: var(--paper);
  --color-saffron: var(--saffron);
```

- [ ] **Step 3: Warm the page `<main>` so hero → next section has no seam (LandingPage.tsx:118)**

Change:
```tsx
<main className="min-h-screen bg-[#f8f8f3] text-[#101510]">
```
to:
```tsx
<main className="min-h-screen bg-[#f6f1e7] text-[#173c2b]">
```

- [ ] **Step 4: Verify build**

Run: `cd frontend && npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/globals.css "frontend/app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat(hero): add paper + saffron tokens, warm page background"
```

---

### Task 3: Rewrite the Hero (copy, light theme, cut spotlight + glows + fake stats)

**Files:**
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:199-312` (entire `Hero` function)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:24-26` (drop unused `heroImageSmall`)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:5` (drop `useRef` if now unused)

**Interfaces:**
- Consumes: `HeroVisual` (rewritten in Task 4), `Sparkle`, `ArrowRight`, `Check` (already imported), `phoneImage`.
- Produces: a `Hero` with no `spotlightRef`, no `onMouseMove`, no background `<Image>`, no radial-glow stack, no `cta-pulse`.

- [ ] **Step 1: Replace the whole `Hero` function (lines 199-312) with:**

```tsx
function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f6f1e7] text-[#173c2b]">
      {/* single soft warm wash — replaces the mouse spotlight + 4 stacked radial glows */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-[#b5651d]/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-5 pb-20 pt-28 sm:pb-24 lg:min-h-[760px] lg:grid-cols-[minmax(0,0.92fr)_minmax(46%,1.08fr)] lg:gap-10 lg:px-8">
        <div className="max-w-[720px] lg:pb-8">
          <div className="hero-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-[#173c2b]/15 bg-white/60 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-[#173c2b] backdrop-blur-sm">
            <Sparkle size={14} weight="fill" className="text-[#b5651d]" />
            AI meal tracker · India + US
          </div>

          <h1 className="hero-reveal hero-delay-1 display-heading text-[44px] font-semibold leading-[1.02] md:text-[60px] lg:text-[64px] xl:text-[80px]">
            Finally, a calorie tracker that understands a <span className="text-[#b5651d]">thali</span>.
          </h1>

          <p className="hero-reveal hero-delay-2 mt-6 max-w-xl text-[16px] leading-7 text-[#4a534a] md:text-[18px] xl:text-[19px] xl:leading-8">
            Snap dal-rice, a paneer bowl, or a hostel thali — get calories, protein, and macros in seconds. Indian &amp; US meals, every estimate editable.
          </p>

          <div className="hero-reveal hero-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#estimate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173c2b] px-7 py-4 text-[16px] font-bold text-[#f6f1e7] shadow-[0_16px_40px_rgba(23,60,43,0.22)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(23,60,43,0.28)] active:translate-y-0"
            >
              Scan your first meal free
              <ArrowRight size={16} weight="bold" />
            </a>
            <a
              href="#product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#173c2b]/18 bg-white/50 px-6 py-3.5 text-[15px] font-semibold text-[#173c2b] backdrop-blur-sm transition-colors duration-200 hover:bg-white"
            >
              See how it works
            </a>
          </div>

          {/* honest proof line — replaces the 4 fake-stat chips */}
          <ul className="hero-reveal hero-delay-3 mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-semibold text-[#4a534a]">
            {["Free to try", "Photo or text", "Telegram-ready", "Edit every estimate"].map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <Check size={14} weight="bold" className="text-[#173c2b]" />
                {item}
              </li>
            ))}
          </ul>

          {/* kept: concrete, on-brand food chips */}
          <div className="hero-reveal hero-delay-3 mt-6 grid max-w-xl gap-2 sm:grid-cols-3">
            {["Hostel food", "Homemade thalis", "Street-food rolls"].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-lg border border-[#173c2b]/10 bg-white/55 px-4 py-3 text-[13px] font-semibold text-[#173c2b] transition-colors duration-200 hover:bg-white"
              >
                <Check size={14} weight="bold" className="text-[#b5651d]" />
                {item}
              </div>
            ))}
          </div>

          {/* mobile meal card — light reskin (HeroVisual is hidden below lg) */}
          <div className="hero-reveal hero-delay-3 mt-7 rounded-2xl border border-[#173c2b]/10 bg-white p-4 shadow-[0_12px_40px_rgba(23,60,43,0.10)] lg:hidden" aria-hidden="true">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b5651d]">Meal saved</p>
                <p className="mt-1 text-[20px] font-semibold text-[#173c2b]">Paneer thali</p>
              </div>
              <span className="rounded-full bg-[#173c2b] px-3 py-1 text-[11px] font-bold text-[#f6f1e7]">92% sure</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["612", "kcal"],
                ["42g", "pro"],
                ["58g", "carb"],
                ["19g", "fat"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-[#f1f5ef] p-2">
                  <p className="text-[15px] font-bold text-[#173c2b]">{value}</p>
                  <p className="text-[10px] font-semibold text-[#5f675f]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HeroVisual />
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#173c2b]/55 md:block">
        See how the AI identifies meals in seconds ↓
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Remove the now-unused `heroImageSmall` const (lines 26-27)**

Delete:
```tsx
const heroImageSmall = "/marketing/hero-small.jpg";
```

- [ ] **Step 3: Remove `useRef` from the React import if unused (line 5)**

Run: `grep -n "useRef" "frontend/app/(marketing)/_components/LandingPage.tsx"`
Expected after Step 1: no results. If none, change line 5 from:
```tsx
import { useEffect, useRef, useState } from "react";
```
to:
```tsx
import { useEffect, useState } from "react";
```

- [ ] **Step 4: Verify the cuts landed + lint passes**

Run: `cd frontend && grep -n "spotlightRef\|onMouseMove\|cta-pulse\|heroImageSmall" "app/(marketing)/_components/LandingPage.tsx" || echo "all cut"`
Expected: `all cut`
Run: `cd frontend && npm run lint`
Expected: no errors (no unused-var errors for `useRef` / `heroImageSmall`).

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat(hero): warm-editorial hero copy + light theme, drop spotlight/glows/fake-stats"
```

---

### Task 4: Simplify HeroVisual to one meal card (remove HUD + CoachBubble, reskin device)

**Files:**
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:314-326` (`HeroVisual`)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:328-429` (`FloatingPhone` — recolor + soften shadow + center)
- Delete: `frontend/app/(marketing)/_components/LandingPage.tsx:431-455` (`NutritionHUD`) and `:457-474` (`CoachBubble`)

**Interfaces:**
- Consumes: `FloatingPhone`, `Image`, `Check`, `phoneImage` (all already imported).
- Produces: a single focal product card; `NutritionHUD` and `CoachBubble` no longer exist (verify no other references).

- [ ] **Step 1: Confirm `NutritionHUD` / `CoachBubble` are only used in the hero**

Run: `grep -n "NutritionHUD\|CoachBubble" "frontend/app/(marketing)/_components/LandingPage.tsx"`
Expected: each name appears exactly twice (definition + the single `HeroVisual` call). Safe to delete.

- [ ] **Step 2: Replace `HeroVisual` (lines 314-326) with:**

```tsx
function HeroVisual() {
  return (
    <div className="hero-reveal hero-delay-2 hidden w-full items-center justify-center lg:flex" aria-hidden="true">
      <div className="relative flex aspect-[1.05/1] w-full max-w-[460px] items-center justify-center">
        {/* one soft warm halo — replaces two blur-120 halos + the spinning ring */}
        <div className="absolute inset-[16%] rounded-full bg-[#b5651d]/12 blur-[90px]" />
        <FloatingPhone />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Replace `FloatingPhone` (lines 328-429) with the centered, light-reskinned version:**

```tsx
function FloatingPhone() {
  return (
    <div className="absolute left-1/2 top-1/2 z-30 w-[66%] -translate-x-1/2 -translate-y-1/2">
      <div className="relative aspect-[304/590] w-full rotate-[4deg] rounded-[14%] bg-[linear-gradient(145deg,#2a322a,#0c100c_42%,#1a211a)] p-[3%] shadow-[0_40px_90px_rgba(23,60,43,0.20),0_0_0_1px_rgba(23,60,43,0.06)] transition-transform duration-500 hover:rotate-[2deg]">
        <span className="absolute -left-1 top-[18%] h-[9%] w-1 rounded-l-full bg-white/24" />
        <span className="absolute -left-1 top-[31%] h-[13%] w-1 rounded-l-full bg-white/20" />
        <span className="absolute -right-1 top-[24%] h-[16%] w-1 rounded-r-full bg-black/45" />
        <div className="pointer-events-none absolute inset-[3%] z-20 rounded-[12%] bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_28%,transparent_68%,rgba(255,255,255,0.08))]" />

        <div className="relative h-full overflow-hidden rounded-[12%] bg-[#f8f8f3] text-[#173c2b]">
          <div className="absolute left-1/2 top-[2%] z-30 h-[5%] w-[32%] -translate-x-1/2 rounded-full bg-[#090d09]" />

          <div className="relative h-[31%] overflow-hidden">
            <Image
              src={phoneImage}
              alt="Healthy meal ingredients"
              fill
              sizes="(min-width: 1024px) 18vw, 80vw"
              className="object-cover saturate-[1.08] contrast-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.22))]" />
            {/* kept effect #2: the scan line tells the photo→analyzed story */}
            <div className="scan-line absolute inset-x-[7%] top-[18%] h-px bg-[#b5651d]/80 shadow-[0_0_18px_rgba(181,101,29,0.6)]" />
            <div className="absolute bottom-[8%] left-[7%] flex items-center gap-1.5 rounded-full bg-white/92 px-2.5 py-1.5 text-[10px] font-bold text-[#173c2b] shadow-[0_10px_28px_rgba(23,60,43,0.16)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#173c2b]" />
              Analyzed
            </div>
          </div>

          <div className="p-[5%]">
            <div className="rounded-[18px] bg-white p-[5%] shadow-[0_14px_36px_rgba(23,60,43,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f796f]">Lunch analysis</p>
                  <p className="mt-1 text-[18px] font-semibold leading-tight xl:text-[20px]">Paneer thali</p>
                </div>
                <span className="rounded-full bg-[#b5651d] px-2.5 py-1 text-[10px] font-bold text-[#f6f1e7]">92% sure</span>
              </div>

              <div className="mt-3 rounded-[16px] bg-[#173c2b] p-[6%] text-white">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-white/60">Estimated calories</p>
                    <p className="mt-0.5 text-[26px] font-semibold leading-none xl:text-[30px]">612</p>
                  </div>
                  <p className="pb-1 text-[12px] font-semibold text-[#e0b079]">kcal</p>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-white/16">
                  <div className="h-full w-[68%] rounded-full bg-[#e0b079]" />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {["rice", "paneer", "dal", "roti"].map((item) => (
                  <div key={item} className="rounded-full border border-[#173c2b]/10 bg-[#f6f8f2] px-2.5 py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.08em] text-[#173c2b]">
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {[
                  ["42g", "Protein"],
                  ["58g", "Carbs"],
                  ["19g", "Fat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-[14px] bg-[#f1f5ef] p-2 text-center">
                    <p className="text-[14px] font-semibold xl:text-[15px]">{value}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-[#6f796f]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-3 w-full rounded-[16px] bg-[#173c2b] py-[4%] text-[13px] font-bold text-[#f6f1e7] shadow-[0_14px_28px_rgba(23,60,43,0.20)]">
              Confirm meal
            </button>
            <div className="mx-auto mt-3 h-1 w-[34%] rounded-full bg-[#173c2b]/22" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Delete `NutritionHUD` (lines 431-455) and `CoachBubble` (lines 457-474) entirely.**

(After deletion, line numbers shift — delete by matching the `function NutritionHUD() {` … `}` and `function CoachBubble() {` … `}` blocks.)

- [ ] **Step 5: Verify deletions + no dangling refs + lint**

Run: `cd frontend && grep -n "NutritionHUD\|CoachBubble\|bar-grow\|float-soft" "app/(marketing)/_components/LandingPage.tsx" || echo "clean"`
Expected: `clean` (none of these should remain in this file).
Run: `cd frontend && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat(hero): single focal meal card, remove floating HUD + coach clutter"
```

---

### Task 5: Re-skin the Nav + scroll progress for paper

**Files:**
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:165-197` (`Nav`)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:158` (scroll progress bar color)

**Interfaces:**
- Consumes: `Link`, `ForkKnife`, `ArrowRight` (already imported).
- Produces: a light paper-glass nav with forest ink; no lime, no dark slab over the new paper hero.

- [ ] **Step 1: Replace the `Nav` function (lines 165-197) with:**

```tsx
function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#173c2b]/10 bg-[#f6f1e7]/80 text-[#173c2b] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-[#173c2b] text-[#f6f1e7]">
            <ForkKnife size={17} weight="bold" />
          </span>
          myNutriAI
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-[14px] font-medium text-[#173c2b]/70 md:flex">
          <a href="#estimate" className="rounded-full border border-[#b5651d]/35 bg-[#b5651d]/10 px-3 py-1.5 text-[#b5651d] transition-colors duration-200 hover:bg-[#b5651d] hover:text-[#f6f1e7]">Try demo</a>
          <a href="#product" className="transition-colors hover:text-[#173c2b]">Product</a>
          <a href="#loop" className="transition-colors hover:text-[#173c2b]">Routine</a>
          <a href="#pricing" className="transition-colors hover:text-[#173c2b]">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-[#173c2b]">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="inline-flex text-[14px] font-semibold text-[#173c2b]/70 transition-colors hover:text-[#173c2b]">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-md bg-[#173c2b] px-4 py-2 text-[14px] font-semibold text-[#f6f1e7] transition-colors duration-200 hover:bg-[#225036]"
          >
            Get started
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Recolor the scroll-progress bar (line 158)**

Change:
```tsx
className="h-full bg-[#d7ff68] shadow-[0_0_20px_rgba(215,255,104,0.55)]"
```
to:
```tsx
className="h-full bg-[#b5651d] shadow-[0_0_16px_rgba(181,101,29,0.45)]"
```

- [ ] **Step 3: Verify no lime left in nav/progress + build**

Run: `cd frontend && grep -n "d7ff68\|215,255,104" "app/(marketing)/_components/LandingPage.tsx" | sed -n '1,40p'`
Expected: any remaining hits are BELOW the hero (e.g. `ProofStrip`, `ProductMoments`, `Pricing`) — none in `Nav`, `ScrollProgress`, `Hero`, `HeroVisual`, `FloatingPhone`. Eyeball the line numbers.
Run: `cd frontend && npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat(hero): light paper-glass nav + saffron scroll progress"
```

---

### Task 6: Prune dead CSS + final review

**Files:**
- Modify: `frontend/app/globals.css` (remove keyframes/utilities only if grep proves them unused)

**Interfaces:**
- Consumes: nothing. Produces: a leaner `globals.css` with no rules for cut effects.

- [ ] **Step 1: For each candidate, grep the whole frontend; remove the CSS only if there are zero usages**

Candidates created for now-removed hero pieces: `cta-pulse`, `float-soft`, `float-soft-delayed`, `bar-grow`, `spin-ring`.

Run for each:
```bash
cd frontend
for c in cta-pulse float-soft float-soft-delayed bar-grow spin-ring; do
  echo "== $c =="; grep -rn "$c" app --include=*.tsx
done
```
For any class with **no `.tsx` usage**, delete its `@keyframes` block and its `.<class>` rule from `globals.css`. Known: `scan-line`, `flow-line`, `reveal`, `hero-reveal`, `hero-delay-*` are still used — keep them. (`bar-grow` / `float-soft` / `cta-pulse` / `spin-ring` are expected to have zero `.tsx` hits after Tasks 3-4; confirm before deleting each.)

- [ ] **Step 2: Remove the duplicate reduced-motion block**

`globals.css` has two identical `@media (prefers-reduced-motion: reduce)` blocks (around lines 170 and 345). Delete the second one (lines ~345-354); keep the first.

- [ ] **Step 3: Verify build + lint**

Run: `cd frontend && npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 4: Visual check at three widths**

Run: `cd frontend && npm run dev` (then open http://localhost:3000)
Confirm by eye:
- Hero bg is warm paper, headline in Fraunces with "thali" in saffron, no acid-lime in hero/nav.
- One product card on the right (≥1024px); the mobile meal card shows below the CTAs at 375px; right visual hidden at 375px.
- No mouse-spotlight follow, no pulsing CTA ring; scan-line animates once per loop on the card.
- Hero → demo section (`PublicMealEstimator`) shows no color seam.
- Check 375px, 768px, 1280px (devtools responsive). Toggle "Reduce motion" in devtools rendering — entrance/scan-line should not animate.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/globals.css
git commit -m "chore(hero): prune dead keyframes + duplicate reduced-motion block"
```

---

## Self-Review

**Spec coverage:**
- Palette swap → Task 2 + recolors in Tasks 3-5. ✅
- Fraunces + Hanken, Geist removed → Task 1. ✅
- Headline + sub + CTAs + proof line + kept food chips, fake-stats removed → Task 3. ✅
- One focal card, NutritionHUD + CoachBubble removed → Task 4. ✅
- Effects 6→2 (keep reveal + scan-line; cut spotlight, cta-pulse, 4 glows, blur-120 halos) → Tasks 3, 4, 6. ✅
- Nav light-glass → Task 5. ✅
- Seamless hero→next section → Task 2 Step 3. ✅
- Contrast / reduced-motion / build → Global Constraints + Task 6 Step 4. ✅
- Out of scope (sections below hero, backend, pricing, SEO) → untouched; no task edits them. ✅

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✅

**Type/name consistency:** `HeroVisual` (Task 3 consumes, Task 4 defines), `FloatingPhone` (Task 4), token names `--paper`/`--saffron`/`#b5651d` used identically across Tasks 2-5. ✅
