# Landing Page Unify + Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the marketing surface to the warm-editorial palette (retire acid-lime/near-black) and apply one consistent craft system (radii, focus rings, borders, hover, reduced-motion).

**Architecture:** Pure presentational reskin. Token additions in `globals.css`; mechanical color swaps + craft polish in three marketing components. No logic, routing, or backend change. Verification is grep gates (forbidden literals absent) plus `npm run build`, not unit tests — this is CSS.

**Tech Stack:** Next.js App Router, Tailwind v4 (`@theme inline` tokens), framer-motion, Phosphor icons.

## Global Constraints

- Forbidden literals on the three marketing files after this work: `#d7ff68` and `#101510` (case-insensitive, with/without `#`). Grep must return zero.
- Dark surface = `#10241a` (forest-black). Accent = `#b5651d` (saffron). Hover saffron = `#a5571a`. Paper = `#f6f1e7`. Forest = `#173c2b`.
- Radius system: primary CTAs `rounded-xl`; small/nav buttons `rounded-lg`; chips/pills `rounded-full`; cards `rounded-xl`.
- Every button/link CTA: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2` + `focus-visible:ring-offset-[<section surface>]`.
- Saffron text on forest-black must pass 4.5:1; if a small label fails, use paper `#f6f1e7` for body and keep saffron for kickers/large text only.
- No new dependencies. No copy rewrites. No layout restructure. Font work already done — do not touch `layout.tsx`.
- `prefers-reduced-motion`: content renders at final state (no y-translate, no fade).
- Files: `frontend/app/globals.css`, `frontend/app/(marketing)/_components/LandingPage.tsx`, `PublicMealEstimator.tsx`, `SeoArticlePage.tsx`.
- Commit after each task. Run all commands from `frontend/`.

---

### Task 1: Tokens + reduced-motion `Reveal`

**Files:**
- Modify: `frontend/app/globals.css` (`:root` block ~line 3-33; `@theme inline` block ~line 35-55)
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx:36-56` (`Reveal`)

**Interfaces:**
- Produces: CSS vars `--forest-black`, `--saffron-strong` and utility colors `bg-forest-black` / `text-saffron-strong`; a `Reveal` that no-ops motion under `prefers-reduced-motion`. Later tasks may use the token classes but MAY also use raw hex `#10241a` / `#b5651d` — both are acceptable.

- [ ] **Step 1: Add raw tokens to `:root`**

In `globals.css`, inside `:root`, under the `Warm editorial (hero)` group, add:

```css
  --forest-black: #10241a;
  --saffron-strong: #a5571a;
```

- [ ] **Step 2: Expose tokens in `@theme inline`**

In the `@theme inline` block, after `--color-saffron: var(--saffron);` add:

```css
  --color-forest-black: var(--forest-black);
  --color-saffron-strong: var(--saffron-strong);
```

- [ ] **Step 3: Make `Reveal` respect reduced motion**

Replace the `Reveal` component body (`LandingPage.tsx:45-55`) with a `useReducedMotion` guard. Add `useReducedMotion` to the existing `framer-motion` import on line 5 (`import { motion, useReducedMotion } from "framer-motion";`). New body:

```tsx
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={reduce ? undefined : { duration: REVEAL.duration, ease: REVEAL.ease, delay }}
    >
      {children}
    </motion.div>
  );
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds, no type error on `useReducedMotion`.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css "app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat: add forest-black/saffron-strong tokens and reduced-motion Reveal"
```

---

### Task 2: LandingPage — palette unify

**Files:**
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx`

**Interfaces:**
- Consumes: tokens from Task 1 (raw hex allowed).
- Produces: LandingPage free of `#d7ff68` / `#101510`. Craft polish (radii/focus) is Task 3 — leave radii/focus as-is here.

Swap every occurrence in this file. Exact map (`OLD → NEW`), applies to any Tailwind arbitrary value (`bg-[...]`, `text-[...]`, `border-[...]`, `from-[...]`, `via-[...]`, `to-[...]`, `shadow`, `group-hover:*`):

- `#101510` → `#10241a` (every occurrence — ProductMoments tiles/gradients, ImmersiveProduct section + inner cards, Pricing featured tile, Final footer bg, and the `text-[#101510]` on the lime cards which become paper text, see below)
- `#d7ff68` → `#b5651d` (every occurrence — icon hovers, bars, kickers, checks, ring accents, badges)

Then fix the four spots where the swap alone reads wrong:

- [ ] **Step 1: Global literal swap**

Do the two replacements above across the whole file (ProofStrip `:416`, ProductMoments `:439-460`, ImmersiveProduct `:475-560`, DailyLoop `:621`, Personalization `:695-698`, Pricing `:739-787`, SeoHub `:837`, FAQ `:886`, Final `:906`).

- [ ] **Step 2: Fix Pricing "promise" card contrast (`:785-787`)**

Was lime bg with dark text. After swap it is `bg-[#b5651d]` — change its text to paper. Set the card text to `text-[#f6f1e7]`:

```tsx
          <div className="rounded-xl border border-black/8 bg-[#b5651d] p-5 text-[#f6f1e7] shadow-[0_16px_46px_rgba(16,21,16,0.08)]">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">The promise</p>
            <p className="mt-3 text-[20px] font-semibold leading-snug">Snap or type the meal, review the estimate, and save it. No searching a database or logging every ingredient by hand.</p>
          </div>
```

- [ ] **Step 3: Fix ImmersiveProduct reco card contrast (`:529-537`)**

The Cuckoo recommendation card was lime bg + dark text. After swap it is `bg-[#b5651d]`. Change its text from `text-[#101510]` (now `#10241a`) to paper, and the inner chips `bg-[#101510]/10` to `bg-black/15`:

```tsx
                <div className="float-soft-delayed rounded-xl border border-white/16 bg-[#b5651d] p-5 text-[#f6f1e7] shadow-[0_28px_80px_rgba(0,0,0,0.26)]">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] opacity-70">Cuckoo recommendation • just now</p>
                  <p className="mt-2 text-[24px] font-semibold">Make dinner protein-led.</p>
                  <p className="mt-4 text-[14px] leading-6 opacity-90">You have enough carbs today. Add lean protein and vegetables, keep oils light.</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {["dal", "curd", "tofu"].map((item) => (
                      <span key={item} className="rounded-full bg-black/15 px-3 py-1.5 text-center text-[12px] font-bold uppercase tracking-[0.08em]">{item}</span>
                    ))}
                  </div>
                </div>
```

- [ ] **Step 4: Fix Footer (`Final`) — deep forest, not saffron (`:906-908`)**

Blanket swap turned the lime footer into `bg-[#b5651d]` (a saffron block). Per spec the footer is deep forest with paper text and saffron rings. Set:

```tsx
    <footer className="relative overflow-hidden bg-[#10241a] px-5 py-24 text-[#f6f1e7] lg:px-8 lg:py-28">
      <div className="absolute right-[-90px] top-[-120px] h-[360px] w-[360px] rounded-full border-[50px] border-[#b5651d]/15" />
      <div className="absolute bottom-[-80px] left-[-60px] h-[260px] w-[260px] rounded-full border-[40px] border-[#b5651d]/10" />
```

The footer CTA (`:919`) was `bg-[#101510]` (now `#10241a`) — on a forest-black footer it vanishes. Change that CTA to saffron:

```tsx
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b5651d] px-8 py-4 text-[15px] font-semibold text-[#f6f1e7] shadow-[0_16px_40px_rgba(16,21,16,0.28)] transition hover:bg-[#a5571a] hover:shadow-[0_20px_50px_rgba(16,21,16,0.32)]">
```

The footer bottom border/links use `#101510`/opacity — after swap they are `#10241a` on forest-black. Change `border-[#101510]/12` → `border-[#f6f1e7]/15` and the `opacity-70` text stays (paper). Verify the two `Link` legal links remain readable (paper at opacity-70).

- [ ] **Step 5: Verify no forbidden literals**

Run: `grep -nE "d7ff68|101510" "app/(marketing)/_components/LandingPage.tsx"`
Expected: no output.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add "app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat: unify LandingPage palette to warm editorial (forest-black + saffron)"
```

---

### Task 3: LandingPage — craft polish (radii, focus, hover, borders)

**Files:**
- Modify: `frontend/app/(marketing)/_components/LandingPage.tsx`

**Interfaces:**
- Consumes: unified palette from Task 2.
- Produces: consistent radius system + focus rings on all CTAs.

- [ ] **Step 1: Fix Nav CTA radius (`:220`)**

The Nav "Get started" button is `rounded-md`. Change to `rounded-lg` (nav/small button standard). Same for the "Try demo" pill — it is `rounded-full` (a pill, correct, leave it).

- [ ] **Step 2: Add focus rings to Nav (`:201, :208-211, :215, :218-224`)**

Add to the logo `Link`, each nav `<a>`, "Log in" `Link`, and "Get started" `Link`:
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e7]`

- [ ] **Step 3: Add focus rings to Hero CTAs (`:256-268`)**

Both hero CTAs (`Scan your first meal free`, `See how it works`) get the same focus-visible classes (offset `#f6f1e7`).

- [ ] **Step 4: Add focus rings to Pricing + Final + SeoHub CTAs**

- Pricing free `Link` (`:758-764`) and paid `button` (`:766-774`): offset `#f1f5ef` on non-featured; the featured tile buttons sit on `#10241a` → use `focus-visible:ring-offset-[#10241a]`. Since both branches share a className string, add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2` and let offset default (transparent) — acceptable; do NOT block on per-tile offset.
- SeoHub cards (`:815`, `:832`, `:849`): add focus ring, offset `#f8f8f3`.
- Final CTA (`:919`) and legal links (`:928-929`): add focus ring, offset `#10241a`.
- FAQ toggle `button` (`:880-884`): add focus ring, offset `#f8f8f3`.

- [ ] **Step 5: Unify card hover**

ProofStrip card (`:415`) already lifts via bg/shadow — leave. Ensure SeoHub cards (`:815-817`, `:832-835`) include `hover:-translate-y-0.5 transition` alongside their existing shadow hover for a consistent lift. Add `hover:-translate-y-0.5` to the two SeoHub link classes if absent. Keep 200ms (`transition` default).

- [ ] **Step 6: Verify + build**

Run: `grep -c "focus-visible:ring-\[#b5651d\]" "app/(marketing)/_components/LandingPage.tsx"`
Expected: ≥ 10 (every CTA covered).
Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add "app/(marketing)/_components/LandingPage.tsx"
git commit -m "feat: consistent radii, focus rings, and hover lift on LandingPage"
```

---

### Task 4: PublicMealEstimator — unify + polish

**Files:**
- Modify: `frontend/app/(marketing)/_components/PublicMealEstimator.tsx`

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: file free of `#d7ff68` / `#101510`; submit button has focus ring.

- [ ] **Step 1: Swap literals**

- `#101510` → `#10241a` (section bg `:50`, text colors `:52,:100`).
- `#d7ff68` → `#b5651d` (badge `:106`, keep the `/70` alpha → `bg-[#b5651d]/70`).

- [ ] **Step 2: Focus ring on submit button (`:80`)**

The estimate submit `button` (`inline-flex min-h-12 ... rounded-lg`): add
`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10241a]`.
The textarea (`:74`) gets `focus-visible:ring-2 focus-visible:ring-[#b5651d]/50 focus:outline-none` (input focus affordance).

- [ ] **Step 3: Verify + build**

Run: `grep -nE "d7ff68|101510" "app/(marketing)/_components/PublicMealEstimator.tsx"`
Expected: no output.
Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add "app/(marketing)/_components/PublicMealEstimator.tsx"
git commit -m "feat: unify PublicMealEstimator palette and add focus states"
```

---

### Task 5: SeoArticlePage — unify + polish

**Files:**
- Modify: `frontend/app/(marketing)/_components/SeoArticlePage.tsx`

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: SEO article template free of `#d7ff68` / `#101510`; CTAs have focus rings.

- [ ] **Step 1: Swap literals**

- `#101510` → `#10241a`: `main` text (`:8`), hero section bg (`:38`), the final CTA block dark text (`:163,:166`), the final CTA button bg (`:171`).
- `#d7ff68` → `#b5651d`: kickers (`:41,:64`), check icons (`:69`), icon chip bg (`:117`), the `bg-[#d7ff68]` CTA block (`:162`) and its inner CTA (`:49`).

- [ ] **Step 2: Fix CTA block contrast (`:162-171`)**

`:162` block was lime → now `bg-[#b5651d]`; its heading/body (`:163,:166`) were dark `#101510` → set to paper `#f6f1e7` (heading) and `text-[#f6f1e7]/80` (body). Its button (`:171`) was `bg-[#101510]` on lime → now dark-on-saffron; change button to `bg-[#10241a] text-[#f6f1e7]` (forest-black on saffron, readable).

- [ ] **Step 3: Fix hero CTA (`:49`)**

Hero CTA was `bg-[#d7ff68]` (lime) with dark text on the near-black hero. After swap `bg-[#b5651d]` on `#10241a` hero — good contrast. Ensure its text is paper: `text-[#f6f1e7]`. Add focus ring `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5651d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10241a]`.

- [ ] **Step 4: Verify + build**

Run: `grep -nE "d7ff68|101510" "app/(marketing)/_components/SeoArticlePage.tsx"`
Expected: no output.
Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add "app/(marketing)/_components/SeoArticlePage.tsx"
git commit -m "feat: unify SeoArticlePage palette and add focus states"
```

---

### Task 6: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Global grep gate**

Run: `grep -rnE "d7ff68|101510" "app/(marketing)/_components/"`
Expected: no output.

- [ ] **Step 2: Build clean**

Run: `npm run build`
Expected: succeeds, no warnings about the marketing route.

- [ ] **Step 3: Visual check (manual, via `run` skill or dev server)**

Run: `npm run dev`, open `/`. Confirm: hero → estimator → proof → moments → immersive → pricing → footer has no cold-black or lime seam; footer is deep forest; tab-focus on any CTA shows a saffron ring; toggle OS reduced-motion → sections appear without slide/fade.

- [ ] **Step 4: Commit any doc/checklist updates**

```bash
git add -A && git commit -m "chore: landing unify + polish verification" --allow-empty
```
```
```

## Self-review

**Spec coverage:** tokens (T1), reduced-motion (T1), palette unify all sections incl. PublicMealEstimator + SeoArticlePage (T2/T4/T5), footer=deep forest (T2.4), radius system + Nav rounded-md fix (T3.1), focus rings all CTAs (T3/T4/T5), hover unify (T3.5), contrast fallbacks (T2.2/T2.3/T5.2), grep gate + build + reduced-motion visual (T6). All spec success criteria mapped.

**Placeholders:** none — every swap has exact old→new and line refs.

**Type consistency:** no new types; token names `--forest-black`/`--saffron-strong` consistent across tasks; `useReducedMotion` import matches usage.
