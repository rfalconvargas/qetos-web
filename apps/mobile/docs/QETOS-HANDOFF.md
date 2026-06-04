# Qetos — Project Handoff & Spec (paste this into a new chat)

> **Purpose of this doc:** give a fresh assistant (or teammate) full context on what Qetos is,
> how it's built, what exists today, the conventions, and the known constraints — so they can be
> productive immediately. Pair this with `QETOS-OPEN-QUESTIONS.md` (the decisions still to make).
> Last updated: 2026-06-04.

---

## 1. What Qetos is
Qetos is a **calm, AI-guided companion for metabolic & mental health** (keto / low-carb focused,
"compassion-first," built on the **DRESS** philosophy: **D**iet, **R**est, **E**xercise, **S**tress,
**S**upplements — no streaks, no shame). It pairs a conversational **Concierge AI** with food/lab
photo logging, ketone tracking, a daily plan timeline, and wearable (WHOOP) recovery data.

Two surfaces:
1. **Marketing landing page** — phone-number waitlist (no email), deployed to Vercel.
2. **Mobile app** — Capacitor web→Android app (also runs as a web app), the actual product.

**Hard rule across everything:** NO medical claims. Reuse the disclaimer verbatim:
> "Qetos provides general wellness and educational information — not medical advice, diagnosis, or treatment."

---

## 2. Repo, branches, hosting
- **Local path:** `C:\ketofy-app-v1\ketofy-mobile` (git repo).
- **GitHub remote:** `https://github.com/rfalconvargas/qetos-web`
  - `main` — protected (direct pushes are blocked by policy/tooling).
  - `landing-page` — landing-page work (committed + pushed).
  - `mobile-app-updates` — all the mobile-app work from recent sessions (committed + pushed). **This is the active branch.**
  - No PRs opened/merged yet; nothing merged to `main` on the remote.
- **Landing deploy:** Vercel project **`landing`** (team `rfalconvargas-projects`), deployed via **Vercel CLI** (`vercel deploy --prod` on the `landing/` folder — NOT git-integrated).
  - Custom domain: **`qetos.ailiur.com`** (apex + `www`), DNS in **Google Cloud DNS** (A record → `76.76.21.21`).
  - Vercel **Deployment Protection** was disabled so the page is public.
  - `landing/vercel.json` has a **rewrite**: `/api/waitlist` → the Supabase `waitlist` edge function (makes the form same-origin → no CORS).
- **Mobile app local dev:** static files in `www/`, served by `python -m http.server` (see `.claude/launch.json` — but note that file lives in a different working dir, `C:\mytabolism-app-v3\.claude\launch.json`, with configs: `mytabolism`:4178, `ketofy`:4180 → serves `www/`, `qetos-landing`:4182 → serves `landing/`).

---

## 3. Tech stack
- **Frontend (both):** vanilla HTML/CSS/JS. **No framework.** Tailwind (compiled, see below) + custom CSS.
- **Mobile shell:** Capacitor (`android/` exists; iOS not set up). Plugins referenced: Preferences, Camera, Filesystem, LocalNotifications, StatusBar.
- **Fonts:** self-hosted, offline-first (`www/assets/fonts.css`) — Inter (body), Playfair Display (display), **Material Symbols Outlined as a committed SUBSET woff2** (`assets/fonts/material-symbols-outlined.woff2`).
- **Backend:** **Supabase** project `efkantatoxcpcteqthfh`.
  - Edge Functions (Deno): `waitlist`, `concierge`, `vision`, `estimate`, `foods`, `recipe`.
  - **AI model:** Google **Gemini 2.5 Flash** (key stored in `public.app_secrets` row `key='gemini'`, read service-role-only).
  - DB tables (Postgres): `profiles`, `waitlist`, `meals`, `ketone_readings`, `wins`, `lab_reports`,
    `lab_metrics`, `daily_logs`, `shopping_list`, `chat_messages`, `memories`, `supplements`, `targets`, `app_secrets`.
  - Migrations in `supabase/migrations/` (0001 init, 0002 consent_accepted_at, 0003 waitlist, 0004 waitlist_names).

---

## 4. File map (mobile app)
- `www/index.html` — all markup: app header, views (`view-chat`, `view-log`, `view-recipes`, `view-plan`, `view-more`), bottom nav, auth/login screen, overlays (settings panel, breathing, consent, toast, plan calendar, pantry sheet, LDL info sheet). Inline `<style>` + `<script src>` to the JS files (cache-busted with `?v=`).
- `www/js/app.js` — the interaction layer (~1200 lines): state, persistence (`Store`), auth glue, nav (`switchView`), chat rendering, camera/vision flow, Recipes, Plan timeline, settings, WHOOP card, etc.
- `www/js/ai.js` — `window.Concierge` (live Gemini via edge fn + local "demo" fallback engine), `window.Vision`, `window.Foods`, `window.Estimate` clients.
- `www/js/supabase-client.js` — `window.DB` wrapper (auth, profile, logging, lists). All writes are no-ops unless `DB.ready() && DB.currentUser()`.
- `www/js/vendor/supabase.js` — Supabase JS SDK.
- `www/assets/tailwind.css` — **compiled/purged** Tailwind output. Rebuild with `npm run build:css` after adding new utility classes (config `content: ["./www/**/*.{html,js}"]`).
- `supabase/functions/<name>/index.ts` — edge functions.
- `landing/index.html` + `landing/media/` + `landing/vercel.json` — the marketing site.

---

## 5. What's built (recent sessions)
**Landing page:** rebranded from an aerospace template to Qetos (navy/mint palette, Playfair headings),
phone waitlist form (first/last name optional? see below) → `waitlist` edge fn, optimized local media,
real logo, "Join the waitlist" CTA band, compliance disclaimer, deployed + public on `qetos.ailiur.com`.

**Mobile app:**
- **Profile** persistence (Preferred name, Age, Primary focus) via `Store` (Capacitor Preferences/localStorage). Was previously a no-op form.
- **Nav rename:** Food→**Recipes**, Habits→**Plan** (labels, route keys, IDs, icons). Removed **Instagram** login option.
- **Recipes tab:** AI recipe generation + **manual text meal logging** (`estimate` edge fn → macros, editable "Edit Macros" override).
- **Log tab (camera):** food/ketone/document scanning via `vision` edge fn. **Meal Recognized** card renders a scannable **ingredient list with food emojis** + macros. **Keto-Mojo** logs: saves photo to a local folder + thumbnail, a **pen-edit** button + **manual numeric entry** (no photo).
- **LDL info sheet:** `(i)` button by the LDL pill → bottom sheet explaining LDL-lowering/neutral/boosting (non-medical).
- **Plan tab (rebuilt):** persistent daily-history timeline. Date header ("Thursday, June 4, 2026") with `<`/`>` day nav + a **28-day jump calendar**. **Unified Morning/Afternoon/Evening timeline** showing: logged **meals + ketone readings** (by time), **pantry-derived meal-prep/cook goals** (pantry editable via a sheet; "Cook: <recipe>" deep-links to Recipes), and **toggleable lifestyle tasks** (Meditate, Daylight, Workout, Read, Bed by 10 PM) placed by part of day with **per-day completion checkboxes**. Retired the old DRESS "wins/orbs/journey" UI.
- **WHOOP:** replaced the arbitrary "92% Energy Stability Score" with a **WHOOP recovery card** (recovery %, sleep, sleep performance, HRV, strain, RHR). AI starter is **data-aware**: when WHOOP telemetry exists, the Concierge references it and **stops asking redundant "did you sleep well?"** questions; chat shows **WHOOP context chips**. Plan timeline gets a **recovery-aware nudge** (green/yellow/red).
- **Concierge conversation controller:** rewritten for **long voice-to-text narratives** — parses explicit symptoms + the question, references data/trends, answers directly, and never resets to the generic "tell me more" loop. Handles Gemini **429 rate limits** with a delayed retry + honest fallback.
- **Logo:** real Qetos mark wired into app header + login screen. Script tags cache-busted.

---

## 6. Key conventions & gotchas (READ before editing)
- **Icons:** Material Symbols is a **committed SUBSET**. A glyph not in the subset renders as literal text (e.g. `MENU_BOOK`). Before using a new icon, verify it's in the subset (measure a probe span's width, ~24px = present) or use one already used in the app, or an emoji/Unicode. There is **no font-subset rebuild script** — regenerating needs the full Material Symbols font + fonttools.
- **Tailwind:** classes are purged at build time. After adding a NEW utility class, run `npm run build:css` (else the class silently does nothing). Verified classes ship in `www/assets/tailwind.css`.
- **Cache:** the dev server (python http.server) sends no cache headers → browsers serve stale JS/CSS. `js/*` script tags are now `?v=`-busted; bump the version when shipping JS changes (or hard-refresh). Same applies to any CDN/host caching.
- **Client persistence keys (Store):** `qetos-auth`, `qetos-consent`, `qetos-profile`, `qetos-state`, `qetos-tasks`, `qetos-taskdone`, `qetos-pantry`. On device these use Capacitor Preferences; on web, localStorage.
- **DB writes** only happen when signed in (`DB.ready() && DB.currentUser()`); otherwise the app runs in **demo mode** with local state only.
- **Edge functions** currently have **`verify_jwt` OFF** (prototype) and CORS `*` (except `waitlist`, which reflects an allowlist of origins). The client sends no auth header to them.
- **Hardcoded single-user placeholders** are everywhere: "Raul Falcon", `raul@rfalcon.com`, referral code `RAUL26`, share link `ketofy.me/r/raul-7fc2`, an onboarding seed (193cm/86.7kg/age in `ONBOARDING_SEED`), demo device summaries. These must be de-hardcoded for multi-user.
- **Two brand domains appear in code:** the `waitlist` CORS allowlist includes `getqetos.com` / `qetos.app`, but the site is actually live on **`qetos.ailiur.com`**. Canonical domain is undecided (see open questions).

---

## 7. Known issues / tech debt
- **Gemini key is FREE TIER** → 429 rate limits under normal use. Concierge now degrades gracefully, but production reliability requires a **paid Google AI key / higher quota**.
- **WHOOP/Oura/Cronometer "connections" are simulated** (mock telemetry). No real OAuth or device APIs yet. WHOOP data model is structured and ready for real data; needs a registered WHOOP developer app (client id/secret + redirect) and an OAuth + fetch path.
- **Vision OCR** (Keto-Mojo / labels / meals) is Gemini-based and can misread; manual override exists for ketones, not yet for meal macros from photo.
- **Auth not fully wired:** magic-link email, phone OTP, and Google/Apple provider buttons exist; Google/Apple need to be enabled in Supabase Auth. Most flows fall back to a demo "enterApp".
- **`verify_jwt` OFF** on edge functions — must be turned ON + gated to logged-in users before launch.
- **No automated tests / CI**. Verification has been manual (Claude Preview MCP + curl + SQL).
- **iOS not set up**; only Android via Capacitor.
- **Single Supabase project** for prototype — no separate dev/staging/prod environments.

---

## 8. How to run / verify locally
- Serve the app: `python -m http.server 4180 --directory www` (or the `ketofy` launch config). Open `http://localhost:4180`.
- Rebuild CSS after class changes: `npm run build:css`.
- Edge functions are deployed to Supabase (via the Supabase MCP `deploy_edge_function` in past sessions, or `supabase functions deploy` if the CLI is installed/authed — it currently is NOT).
- Landing deploy: `vercel deploy "…/landing" --yes --prod`.

---

## 9. The "north star" tone
Calm, editorial, compassionate. Curiosity over pressure. Every win counts (even a paused craving).
Never streaks/shame. The Concierge **asks one grounded question before advising** for vague inputs,
but **answers directly** when the user already gave a detailed narrative. Medication is always treated
as fixed and prescriber-managed (the seed user takes lithium + paliperidone/Invega).
