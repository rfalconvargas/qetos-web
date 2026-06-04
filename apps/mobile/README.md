# Qetos — Mobile (Capacitor)

AI-first metabolic & mental-health companion. One web codebase → **Android** now,
**iOS** and **Desktop** later. Built from the Stitch "Metabolic Editorial" design system.

```
ketofy-mobile/
├─ www/                     ← the app (what Capacitor ships)
│  ├─ index.html            ← all 5 views, Stitch design tokens
│  └─ js/
│     ├─ app.js             ← interactions: auth, nav, chat, camera, DRESS, breathing, settings
│     └─ ai.js              ← Concierge client (DEMO local engine ↔ LIVE backend proxy)
├─ supabase/functions/concierge/index.ts   ← server proxy that holds your AI key
├─ capacitor.config.json
└─ package.json
```

## 1. Run the web app (no install)
Open `www/index.html` in a browser, or:
```bash
npm run serve     # http://localhost:4179
```
It runs in **DEMO mode** (local inquisitive engine) with zero keys.

## 2. Build the Android app (Step 1 + 5 of the plan)
Prereqs: **Node 18+**, **Android Studio** (with an SDK + a device/emulator), **JDK 17**.
```bash
npm install
npx cap add android        # generates the native android/ project
npm run sync               # copy www/ into the native shell
npm run open:android       # opens Android Studio → press Run ▶
# headless debug APK:
npm run build:android      # android/app/build/outputs/apk/debug/app-debug.apk
```

## 3. Go LIVE with real AI (Step 4)
1. Get a key: `ANTHROPIC_API_KEY` (Claude) or `GEMINI_API_KEY`.
2. Deploy the proxy (keeps the key server-side — never in the app):
   ```bash
   supabase functions deploy concierge --no-verify-jwt
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```
3. In `www/js/ai.js`, set `CONFIG.endpoint` to the function URL. Done — chat now uses Claude/Gemini,
   and falls back to DEMO mode automatically if the network fails.

Recommended models: **Claude Haiku 4.5** (fast/cheap) escalating to **Sonnet** for lab interpretation,
or **Gemini Flash** for cheap multimodal. The system prompt enforces the "ask before advising" rule
and uses prompt caching to cut cost.

## 4. Desktop app (Step 5)
Same codebase via Capacitor's Electron target:
```bash
npm i -D @capacitor-community/electron
npx cap add @capacitor-community/electron
npx cap open @capacitor-community/electron      # then npm start inside electron/
```

## What's wired
- **Auth** (Google / Instagram / magic-link) → fades into the app, remembered across launches.
- **Chat** Concierge that asks a baseline-protocol question before advice; quick chips; mic (sim).
- **Log** Omni-Camera (uses the real device camera on Android) → food card / structured medical card
  (Observation · Action · Pending Labs) → flows into the Concierge.
- **Habits** DRESS journey with star-glow completion, craving/habit wins, a growing garden of orbs.
- **More** every item opens a working panel; device connect runs a real connect→sync state machine.
- **Breathing** 5-min reset, no end bell. Light state persists via Capacitor Preferences.

> Disclaimer: supportive guidance, not medical advice. Add real consent + HIPAA/GDPR handling before shipping health data.
