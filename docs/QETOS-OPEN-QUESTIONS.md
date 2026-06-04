# Qetos — Exhaustive Open Questions & Decisions

> Everything still to be figured out, organized by area. Treat each `[ ]` as a decision to make.
> Many are interdependent. Prioritize the ⭐ **launch-blocking** ones first. Pair with `QETOS-HANDOFF.md`.

---

## 0. ⭐ The biggest unknowns (decide these first)
- [ ] **Is this a regulated medical product or a wellness/educational app?** This single answer cascades into legal, claims, data, features, and review processes.
- [ ] **Who is the launch user — just you (single-user prototype) or a multi-user public app?** Almost everything is hardcoded to one user ("Raul") right now.
- [ ] **Canonical domain + brand name:** code references `getqetos.com`, `qetos.app`, AND `qetos.ailiur.com`. Which is THE domain? Is the product "Qetos" or "Ketofy" (repo/paths say ketofy; share links say `ketofy.me`)?
- [ ] **Business model:** free, freemium, subscription, one-time, B2B/clinician? Determines paywalls, App Store setup, billing.
- [ ] **Who pays for the AI?** Gemini is on a free key today (rate-limited). Production needs a paid plan and a cost model per active user.
- [ ] **Launch platforms & date:** web first? Android? iOS? TestFlight/closed beta? Target timeline?
- [ ] **Team:** solo, or who owns design / clinical review / legal / growth?

---

## 1. Product vision, scope & roadmap
- [ ] One-sentence positioning statement (what it is, for whom, vs. what alternative).
- [ ] MVP feature set vs. v2+ (what's truly required to launch?).
- [ ] Is the **Concierge AI the core**, or is logging/tracking the core, or the Plan?
- [ ] Primary "job to be done" for a new user in week 1?
- [ ] What does "success" look like for a user (the outcome you promise without medical claims)?
- [ ] Which existing features are keepers vs. demo-only scaffolding to cut?
- [ ] Offline expectations — must the app work without internet? (Currently AI needs network.)
- [ ] Single-player only, or social/sharing/care-team features?
- [ ] Roadmap priorities & rough timeline / milestones.

## 2. Target users & personas
- [ ] Primary persona(s): keto beginners? metabolic-health optimizers? people managing mental-health + metabolic conditions?
- [ ] Are people on psychiatric meds (like the seed user) a core audience or an edge case? (Big safety implications.)
- [ ] Age range / minors policy (COPPA/teen use)?
- [ ] Geography for launch (US only? affects SMS, privacy law, crisis lines, units).
- [ ] Tech-savviness / accessibility needs of the audience.
- [ ] Do users have wearables (WHOOP/Oura) or is that a small subset?

## 3. ⭐ Medical, clinical & safety
- [ ] **Clinical advisor / medical reviewer** — who signs off on health content and safety logic? Do you have one?
- [ ] Exact boundaries of what the AI may/may not say (it currently must never change meds; how far can nutrition guidance go?).
- [ ] **Mental-health crisis protocol:** detection, escalation, crisis-line numbers per region, liability. Current behavior just "encourage contacting a clinician/crisis line" — is that sufficient/approved?
- [ ] Self-harm / eating-disorder safeguards (a keto/calorie app + ED risk is a known sensitivity).
- [ ] Medication interactions: how are the user's meds captured, and how does the AI stay safe around them at scale (not just the seeded lithium/Invega)?
- [ ] Drug/lab guidance limits (the app suggests "review X lab with prescriber" — vet this list clinically).
- [ ] Pregnancy / diabetes (T1 keto + ketones is dangerous — DKA vs nutritional ketosis), kidney disease, and other contraindication handling.
- [ ] Disclaimer placement/frequency and whether a one-time consent gate is legally enough.
- [ ] Accuracy expectations for AI macro/ketone/lab estimates and how you communicate uncertainty.

## 4. ⭐ Legal & regulatory
- [ ] **Privacy Policy** and **Terms of Service** (currently `#privacy` / `#terms` placeholders everywhere). Who writes them?
- [ ] **HIPAA** applicability — are you a covered entity / business associate? (Likely not if pure D2C wellness, but confirm; affects Supabase BAA, etc.)
- [ ] **FDA / medical device (SaMD)** — does any feature (lab interpretation, recommendations) risk being a regulated device?
- [ ] **GDPR / UK GDPR / CCPA/CPRA** — data subject rights, consent, DPA, cookie/consent banners.
- [ ] **TCPA / SMS consent** — the waitlist collects phone + SMS consent. Confirm opt-in language, STOP/HELP handling, and a registered SMS sender/short code (A2P 10DLC in the US).
- [ ] Health-data specific laws (e.g., Washington **My Health My Data Act**, BIPA if any biometrics).
- [ ] App Store / Play Store health-app policy compliance.
- [ ] Data Processing Agreements with subprocessors (Supabase, Google/Gemini, Vercel, SMS provider, WHOOP).
- [ ] Does sending health context to **Google Gemini** raise data-sharing/consent issues you must disclose?
- [ ] Liability insurance / corporate entity / who is the legal operator?

## 5. ⭐ Data model, privacy & retention
- [ ] What PII/PHI is collected and the lawful basis for each (phone, name, age, meals, ketones, labs, mood, meds, wearable data, chat transcripts)?
- [ ] **Data retention** periods per data type; auto-deletion?
- [ ] **User data export** (GDPR portability) and **account/data deletion** flows — none exist yet.
- [ ] Encryption at rest/in transit expectations; field-level encryption for sensitive data?
- [ ] Chat transcripts + "memories" table — how long stored, used for personalization/training? Disclosed?
- [ ] Lab report images/PDFs storage location, access control, retention (currently parsed via Gemini).
- [ ] Keto-Mojo/meal photos saved to `qetos-logs/` on device — synced to cloud? backed up? deletable?
- [ ] De-identification / analytics data minimization.
- [ ] Row-Level Security policies for EVERY table (waitlist is locked; are the rest properly per-user RLS?).
- [ ] Backups, point-in-time recovery, disaster recovery plan.

## 6. ⭐ Auth & accounts
- [ ] Final auth methods: magic-link email? phone OTP? Google? Apple (required by Apple if other social login exists)? password?
- [ ] Enable Google/Apple providers in Supabase (currently buttons exist, providers not enabled).
- [ ] Onboarding flow for a NEW (non-seeded) user — there's only a hardcoded seed today.
- [ ] Profile fields needed at onboarding vs later (age was deferred from waitlist; DOB decision).
- [ ] Account recovery, email/phone change, multi-device sessions.
- [ ] Remove demo "enterApp" bypass before launch (or gate it).
- [ ] Do you need accounts at all for v1, or local-only?

## 7. ⭐ AI / Concierge
- [ ] **Model choice & cost:** stay on Gemini 2.5 Flash? paid tier? fallback model? per-user cost ceiling?
- [ ] Rate-limit/quota strategy at scale (free tier 429s today).
- [ ] **System-prompt governance:** versioning, review, who can change it, red-teaming.
- [ ] Personalization depth: how much user history/data goes into context? privacy tradeoff.
- [ ] **Memory:** the `memories` table + embeddings — strategy for long-term memory, retrieval, decay, user control/visibility.
- [ ] Conversation history length/window sent each turn (currently last ~16 messages).
- [ ] Safety eval set + automated tests for the Concierge (med-safety, crisis, claims). None today.
- [ ] Hallucination handling for nutrition/lab numbers; should AI numbers be labeled "estimate"?
- [ ] Voice-to-text: which STT (device dictation vs a service)? language support? Is the `toggleMic` real or placeholder?
- [ ] Streaming responses vs. wait? Typing indicator UX at scale.
- [ ] Cost/latency: caching, prompt caching, trivial-message local handling (already partially done).
- [ ] Multi-language / tone customization?

## 8. ⭐ Integrations & wearables
- [ ] **WHOOP:** register a WHOOP developer app (client id/secret, redirect URI), implement OAuth + token storage + data fetch (`/recovery`, `/sleep`, `/cycle`, `/workout`). Refresh tokens, scopes, rate limits. (Data model is ready; everything else is mocked.)
- [ ] **Oura, Cronometer** — real APIs or drop them? (Currently simulated.)
- [ ] **Apple Health / Google Fit** integration (likely higher value than WHOOP for most users)?
- [ ] **Keto-Mojo** — official API/Bluetooth, or stay photo-OCR + manual?
- [ ] CGM (continuous glucose) support (Levels/Stelo/Libre)?
- [ ] Sync model: pull frequency, background sync, conflict resolution, historical backfill.
- [ ] Which device data feeds which feature (recovery → Plan nudge; sleep → AI context; etc.).

## 9. Vision / OCR & nutrition data
- [ ] Accuracy targets + correction UX for meal-photo macros (manual override exists for ketones only).
- [ ] Supported document types for lab parsing; how to handle multi-page PDFs, poor scans.
- [ ] **Food database:** `foods` fn uses Open Food Facts — is that accurate/complete enough? Licensed nutrition DB (USDA, Nutritionix, Edamam)?
- [ ] Portion-size estimation reliability + units (g vs oz vs household).
- [ ] Barcode scanning?
- [ ] Recipe generation provenance / accuracy / allergen handling.

## 10. ⭐ Notifications & messaging
- [ ] **SMS provider** for the waitlist + any SMS (Twilio? A2P 10DLC registration in US). Who sends, from what number, with what consent record?
- [ ] What does a waitlist signer actually receive, and when? (You're collecting numbers now with no sending pipeline.)
- [ ] Push notifications: provider (FCM/APNs via Capacitor), the "daily rhythm" morning/evening nudges — opt-in, quiet hours, frequency caps.
- [ ] Notification content governance (no medical claims; calm tone).
- [ ] Email at all, or SMS/push only?

## 11. ⭐ Monetization & pricing
- [ ] Free vs paid; price points; trial length; annual vs monthly.
- [ ] What's gated behind paid (AI usage caps? integrations? history?).
- [ ] Billing: Stripe (web) and/or App Store/Play in-app purchase (Apple takes 15-30%, requires IAP for digital goods).
- [ ] Founders/early-access pricing (the app says "Founders · active").
- [ ] Referral program economics (`RAUL26` code, "invite a friend" — real or cosmetic?).
- [ ] Unit economics: AI + infra cost per active user vs price.

## 12. Platforms & native
- [ ] iOS app (not set up) — needed for launch? Apple review for health apps.
- [ ] Android: Play Store listing, signing, release track.
- [ ] Web app as a product, or just the marketing site?
- [ ] Native capabilities needed: camera (✓), filesystem (✓), notifications (✓), HealthKit/Health Connect, Bluetooth (Keto-Mojo), background sync.
- [ ] Capacitor plugin list finalized; permissions strings (iOS Info.plist / Android manifest).
- [ ] Min OS versions, device/screen support, offline behavior.
- [ ] App icons, splash screens, store screenshots, store copy.

## 13. ⭐ Infrastructure, DevOps & environments
- [ ] **Environments:** separate dev/staging/prod Supabase projects? (One project today.) Same for Gemini keys.
- [ ] **CI/CD:** none today. Pipeline for tests + deploy (functions, web, app)?
- [ ] **Secrets management:** Gemini key is in `app_secrets` table; review approach. Rotate keys, who has access.
- [ ] Supabase plan/tier (free vs pro), connection limits, function limits, storage.
- [ ] Vercel: keep CLI deploys or switch to git-integrated deploys? Production branch?
- [ ] Monitoring/observability: error tracking (Sentry?), function logs, uptime, alerting.
- [ ] Analytics platform (privacy-respecting; PostHog/Plausible?) — and what events to track.
- [ ] Backups & DR (see Data section).
- [ ] Domain/DNS ownership consolidation (ailiur.com vs getqetos.com vs qetos.app).

## 14. ⭐ Security
- [ ] Turn `verify_jwt` ON for edge functions + gate to authenticated users (currently OFF).
- [ ] Audit RLS on all tables (per-user isolation).
- [ ] Rate limiting / abuse protection on public endpoints (waitlist, AI).
- [ ] Input validation / prompt-injection hardening for the AI (user text → model; lab text → model).
- [ ] CORS review (functions are `*`; tighten?).
- [ ] Dependency/supply-chain review (vendored Supabase SDK, esm.sh imports in functions).
- [ ] Pen test / security review before launch.
- [ ] PII in logs? (Edge logs, analytics.)

## 15. Design system & brand
- [ ] Finalize brand: name, logo lockups, color tokens (navy #071834, mint, teal, lavender, orange, star-glow, bg), type scale.
- [ ] Logo asset set: favicon, app icons (all sizes), social/OG image, monochrome variants. (Only a transparent mark exists.)
- [ ] **Icon strategy:** the Material Symbols subset has no rebuild script — either add a `build:icons` step (fonttools subset of the full font) or curate to in-subset glyphs. Decide.
- [ ] Accessibility: contrast (orange on white?), font sizes, screen-reader labels, focus states, reduced-motion (lots of animations).
- [ ] Dark mode? (`<html class="light">` is hardcoded.)
- [ ] Empty states, loading states, error states consistency.
- [ ] Design source of truth (Figma?) vs. code-first.

## 16. Content & copy
- [ ] Final medical disclaimer wording + where it must appear (✓ standard line exists).
- [ ] Onboarding copy, notification copy, error/fallback copy review.
- [ ] Localization/i18n plan (units: kcal/kJ, mmol/L vs mg/dL, date formats, language).
- [ ] Educational content (DRESS explainers, LDL guide already drafted) — clinically reviewed?
- [ ] Tone guide documented for AI + UI consistency.

## 17. ⭐ Waitlist & go-to-market
- [ ] What happens to a waitlist signup operationally (CRM, SMS sequence, invite cadence)?
- [ ] How do you view/export the list (currently Supabase Table Editor / SQL)?
- [ ] Launch plan: invite waves, capacity, founders cohort.
- [ ] Growth channels, content, referral mechanics (decide if `RAUL26`/invite is real).
- [ ] Landing analytics + conversion tracking (none wired).
- [ ] Goal field on waitlist (metabolic/mental/both/curious) — how used for segmentation?

## 18. Specific app gaps / cleanup (concrete TODOs)
- [ ] De-hardcode the single user: "Raul Falcon", `raul@rfalcon.com`, `RAUL26`, `ketofy.me/r/raul-7fc2`, `ONBOARDING_SEED`, demo device summaries, "Founders · active", account screen.
- [ ] Settings screens that are demo/no-op: Account ("Manage email" toast), Targets (sliders save a toast — persist to `targets`?), Sharing (fake link), Referrals, Support (toast), Daily rhythm (real notifications?), Connect devices (simulated).
- [ ] The "Energy win" bento + `logEnergyWin` still reference the deprecated `state.energy` — keep, repurpose, or remove?
- [ ] Meal-photo macros have no manual override yet (ketones do) — add?
- [ ] Recovery nudge / WHOOP data shown even in demo (mock) — gate to real connection?
- [ ] Plan timeline: should ketone readings, wins, supplements, daylight, fasting also appear? Editing past days?
- [ ] Voice input (`toggleMic`) — confirm it's real STT vs placeholder.
- [ ] Consent gate currently one-time local — re-consent on policy change?
- [ ] Confirm first/last name on waitlist (added) is desired; map `goal` values to real segments.

## 19. Testing & QA
- [ ] Automated tests (unit/integration/E2E) — none today. What framework, what coverage targets?
- [ ] AI eval harness (safety + quality regression).
- [ ] Device/browser test matrix.
- [ ] Beta testing program + feedback loop.
- [ ] Accessibility audit.

## 20. Analytics & metrics
- [ ] North-star metric + key funnels (waitlist→activation→retention).
- [ ] Event taxonomy; privacy-respecting analytics tool.
- [ ] AI quality metrics (helpfulness, fallbacks rate, 429 rate).
- [ ] Health-outcome proxies you can track WITHOUT making medical claims.

## 21. Operations & support
- [ ] Support channel (the Support screen is a toast) — real inbox/helpdesk?
- [ ] SLA for responses; who staffs it?
- [ ] Incident response (security, outage, data breach notification duties).
- [ ] Content moderation if any user-generated/shared content.

## 22. Finance & business
- [ ] Budget/runway; cost of AI + infra + SMS at projected scale.
- [ ] Entity, banking, payment processor, tax/VAT on subscriptions.
- [ ] Pricing experiments plan.

---

### Suggested first 10 to resolve
1. Regulated medical vs wellness app (Section 0 / 3 / 4).
2. Single-user vs multi-user (drives de-hardcoding, auth, RLS).
3. Canonical brand + domain.
4. Business model + who pays for AI.
5. Privacy Policy + Terms (+ SMS/TCPA consent) — launch-blocking legal.
6. Paid Gemini key + environments (dev/prod) + `verify_jwt` ON + RLS audit.
7. Auth flow for new users + onboarding.
8. Clinical reviewer for safety logic + crisis protocol.
9. WHOOP (and/or Apple Health) real integration decision.
10. SMS provider + what the waitlist actually triggers.
