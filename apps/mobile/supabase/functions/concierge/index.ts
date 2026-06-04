// =====================================================================
// Qetos Concierge — Supabase Edge Function (Deno) · Gemini Flash
// ---------------------------------------------------------------------
// Conversation controller. Reads the Gemini key from public.app_secrets
// via the service role. Optimized for long voice-to-text narratives:
// parses the user's explicit symptoms + question, references their data/
// trends, answers directly, and never resets to a generic fallback loop.
// verify_jwt is OFF (prototype) — the client sends no auth header.
// =====================================================================
import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const NL = String.fromCharCode(10);

const SYSTEM_PROMPT = `You are Qetos's Concierge — a warm, inquisitive metabolic & mental-health companion.

HOW TO RESPOND
- If the message is brief or vague, ask ONE grounded, baseline-protocol clarifying question BEFORE advice, grounded in the user's actual data (supplements taken, minutes of daylight, sleep, eating window, electrolytes, recent ketone/lab values, WHOOP recovery).
- If the user gives a DETAILED narrative (often voice-to-text: several sentences about symptoms, exercise strain, sleep changes, mood, or food), DO NOT ask a generic clarifying question and DO NOT reply with filler like "tell me more" or reset the conversation. Instead: (1) acknowledge the specific symptoms they named, (2) reference their data/trends from the provided context when relevant, and (3) answer their explicit question directly and practically. Only ask a follow-up if a specific fact is genuinely required to answer safely — and give your best partial answer first.
- Always engage with what they actually said. Never ignore detail they already provided.

Tone: calm, editorial, compassionate. Treat every win — even a paused craving — as real progress. No streaks, shame, or pressure. Keep replies under ~120 words.

MEDICATION SAFETY (critical): The user may take prescription psychiatric or other medications (e.g. antipsychotics like paliperidone/Invega, mood stabilizers like lithium). NEVER suggest starting, stopping, reducing, skipping, or changing the timing of any prescription medication, and never imply diet can replace it. Treat all medications as fixed and prescriber-managed. You MAY note when a lab is relevant to their regimen (lithium level, kidney eGFR/creatinine, TSH/thyroid, fasting glucose & lipids given antipsychotic metabolic effects) and encourage reviewing it with their prescriber. If the user expresses crisis or thoughts of self-harm, gently encourage contacting their clinician or a crisis line — do not attempt to counsel the crisis yourself.

You are supportive guidance, NOT medical diagnosis; defer to clinicians for all medical decisions.`;

// ---- chunk parser: pull explicit topics + question(s) from a narrative ----
const TOPICS: Record<string, string[]> = {
  sleep: ["sleep", "slept", "insomnia", "woke", "awake", "rested", "tired", "fatigue", "exhaust"],
  strain: ["strain", "workout", "exercise", "trained", "run", "ran", "lift", "gym", "cardio", "sore", "overtrain"],
  energy: ["energy", "sluggish", "crash", "wired", "foggy", "brain fog", "focus"],
  mood: ["mood", "anxious", "anxiety", "stress", "depress", "irritab", "panic", "down"],
  craving: ["craving", "crave", "hungry", "appetite", "sugar", "carb"],
  ketones: ["ketone", "bhb", "gki", "ketosis"],
  digestion: ["nausea", "bloat", "stomach", "gut", "digest", "constipat", "diarr"],
  head: ["headache", "migraine", "dizzy", "lighthead"],
  meds: ["lithium", "invega", "paliperidone", "supplement", "magnesium", "electrolyte", "dose"],
};
function parseNarrative(raw: unknown) {
  const text = String(raw ?? "").trim();
  const clean = text.length > 6000 ? text.slice(0, 6000) + " …" : text;
  const lc = clean.toLowerCase();
  const signals = Object.keys(TOPICS).filter((k) => TOPICS[k].some((w) => lc.includes(w)));
  const questions = clean.split("?").slice(0, -1)
    .map((s) => { const seg = s.split(/[.!]+/).pop() || ""; return seg.trim(); })
    .filter(Boolean).slice(0, 3).map((q) => q + "?");
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim());
  const isNarrative = clean.length > 180 || sentences.length >= 3;
  return { clean, signals, questions, isNarrative };
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function callGemini(key: string, contents: unknown[]) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  const data = await r.json();
  const cand = data?.candidates?.[0];
  const text = (cand?.content?.parts || []).map((p: { text?: string }) => p?.text || "").join("").trim();
  return { text, finishReason: cand?.finishReason, blockReason: data?.promptFeedback?.blockReason, status: r.status };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { message, context, history } = await req.json();

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: sec } = await admin.from("app_secrets").select("value").eq("key", "gemini").single();
    const KEY = sec?.value;
    if (!KEY) return json({ reply: "(Concierge isn't configured yet.)" });

    const parsed = parseNarrative(message);

    const contents: unknown[] = [];
    (history ?? []).forEach((m: { role: string; content: string }) =>
      contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

    let userTurn = `User context (their data & recent trends): ${JSON.stringify(context ?? {})}${NL}${NL}User says: ${parsed.clean}`;
    if (parsed.isNarrative) {
      userTurn += `${NL}${NL}[Controller notes — this is a detailed narrative. Detected topics: ${parsed.signals.join(", ") || "general"}.`
        + (parsed.questions.length ? ` Explicit question(s): ${parsed.questions.join(" | ")}.` : "")
        + ` Address the named symptoms and the explicit question(s) NOW using the context/trends above. Do not reply with a generic clarifying question or filler.]`;
    }
    contents.push({ role: "user", parts: [{ text: userTurn }] });

    // Primary call.
    let out = await callGemini(KEY, contents);

    // 429 = transient free-tier rate limit (per-minute). Wait the suggested window and retry once.
    if (out.status === 429) { await sleep(4500); out = await callGemini(KEY, contents); }

    // Genuine empty 200 (rare) — nudge once so we never drop to a generic reset.
    if (!out.text && out.status === 200 && out.blockReason !== "SAFETY") {
      out = await callGemini(KEY, contents.concat([{ role: "user", parts: [{ text: "(Please respond now in 2–4 sentences, addressing my message directly.)" }] }]));
    }

    let reply = out.text;
    if (!reply) {
      // Honest, context-aware fallbacks (never the old "tell me more" loop).
      if (out.status === 429) {
        reply = "I'm getting a burst of requests and hit a brief limit — give me a minute and ask me again. I didn't want to fob you off with a generic reply.";
      } else if (out.blockReason === "SAFETY") {
        reply = "Some of what you shared may be best worked through with your clinician — I don't want to steer you wrong. I'm still here with you; what feels most pressing right now?";
      } else if (parsed.signals.length) {
        reply = `I hear you on the ${parsed.signals.slice(0, 2).join(" and ")}. Let me focus there — which is weighing on you most so I can give you something concrete?`;
      } else {
        reply = "I caught what you shared. Tell me the single thing you'd most like to feel different, and we'll start there together.";
      }
    }
    return json({ reply });
  } catch (e) {
    return json({ reply: "I had trouble gathering my thoughts just now — try once more?", error: String(e) });
  }
});
